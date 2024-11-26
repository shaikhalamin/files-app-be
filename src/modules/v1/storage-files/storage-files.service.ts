import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { StorageFile } from './entities/storage-file.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
// import { join } from 'path';
import { FileTag } from './entities/file-tag.entity';
import { FileUploadDto } from './dto/file-upload.dto';
import { FilesQueryFilterDto } from './entities/files-query-filter.dto';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { FileView } from './entities/file-view.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  cloudinarySignedUrl,
  cloudinaryUpload,
} from '../../../utils/bucket/cloudinary';

@Injectable()
export class StorageFilesService {
  private readonly logger = new Logger(StorageFilesService.name);
  constructor(
    @InjectRepository(StorageFile)
    private readonly storageFileRepository: Repository<StorageFile>,
    @InjectRepository(FileTag)
    private readonly fileTagRepository: Repository<FileTag>,
    @InjectRepository(FileView)
    private readonly fileViewRepository: Repository<FileView>,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(
    file: Express.Multer.File,
    fileUploadDto: FileUploadDto,
    userId: string,
  ) {
    try {
      // const fileKey = join('public', 'uploads', file.filename);
      // const fileUrl = `${fileKey}`;

      const folderPath = `fileshare/user_uploads`;

      let resourceType: string;

      if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      } else {
        resourceType = 'raw'; // Or handle other types if needed
      }

      const { public_id } = await cloudinaryUpload(
        file.path,
        folderPath,
        resourceType,
      );

      const signedUrl = await cloudinarySignedUrl(public_id);

      const storageFile = this.storageFileRepository.create({
        file_name: file.filename,
        file_content_type: file.mimetype,
        file_key: public_id,
        size: file.size,
        file_url: signedUrl,
        tags: [],
        user: { id: userId },
      });

      const tags = fileUploadDto.tags.split(',');

      for (const tag of tags) {
        if (tag.trim().length) {
          const fileTagInit = this.fileTagRepository.create({ tag_name: tag });
          storageFile.tags.push(fileTagInit);
        }
      }

      this.logger.log(`File uploading payload `, storageFile);
      return this.storageFileRepository.save(storageFile);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(filterDto: FilesQueryFilterDto, userId: string) {
    try {
      const { page = 1, perPage = 10 } = filterDto;

      const queryBuilder =
        this.storageFileRepository.createQueryBuilder('file');

      queryBuilder
        .leftJoinAndSelect('file.tags', 'tags')
        .leftJoinAndSelect('file.views', 'views')
        .loadRelationCountAndMap('file.totalViews', 'file.views')
        .where('file.user_id = :userId', { userId })
        .orderBy('file.created_at', 'DESC')
        .take(Number(perPage))
        .skip((Number(page) - 1) * Number(perPage));

      const [results, total] = await queryBuilder.getManyAndCount();

      const data = {
        results,
        meta: {
          allTotal: total || 0,
          total: results?.length || 0,
          perPage: Number(perPage),
          currentPage: Number(page),
        },
      };

      this.logger.log('find all files');
      this.logger.log({ meta: data.meta });

      return data;
    } catch (error) {
      this.logger.error('An error occurred in findAll', error.stack);
      throw new BadRequestException(error.message);
    }
  }

  async findOne(fileName: string): Promise<StorageFile> {
    try {
      const file = await this.storageFileRepository.findOne({
        where: { file_name: fileName },
      });
      if (!file) {
        throw new NotFoundException('File not found !');
      }
      return file;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getFileWithViewCount(
    fileId: number,
  ): Promise<{ file: StorageFile; viewCount: number }> {
    const file = await this.storageFileRepository
      .createQueryBuilder('file')
      .leftJoinAndSelect('file.views', 'view')
      .leftJoinAndSelect('file.tags', 'tag')
      .where('file.id = :fileId', { fileId })
      .loadRelationCountAndMap('file.viewCount', 'file.views')
      .getOne();

    return {
      file,
      viewCount: file?.viewCount || 0,
    };
  }

  async generateLink(fileName: string) {
    const file = await this.findOne(fileName);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    const payload = {
      fileName: file.file_name,
    };
    const token = this.authService.generateToken(payload);
    const frontendBaseUrl = this.configService.get('FRONTEND_APP_BASE_URL');
    const fileShareableLink = `${frontendBaseUrl}/shareable-link/file?token=${token}`;
    return fileShareableLink;
  }

  async validateToken(token: string) {
    const tokenValidate = await this.authService.validateToken(token);

    const fileName = tokenValidate.fileName;

    const file = await this.findOne(fileName);

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async logFileView(fileId: string, viewerIp: string, viewerId?: string) {
    const shouldLog = await this.shouldLogView(fileId, viewerIp);

    if (shouldLog) {
      const fileView = this.fileViewRepository.create({
        file: { id: fileId },
        viewer_ip: viewerIp,
        viewer_id: viewerId || null,
      });
      await this.fileViewRepository.save(fileView);
    }
    return null;
  }

  async shouldLogView(fileId: string, viewerIp: string): Promise<boolean> {
    const cacheKey = `file:${fileId}:ip:${viewerIp}`;
    const lastViewed = await this.cacheManager.get(cacheKey);
    this.logger.log(`Checking cache of cache key `, { cacheKey, lastViewed });
    if (lastViewed) {
      return false; // Skip logging
    }

    // 20 sec is TTL value
    await this.cacheManager.set(cacheKey, true, 20000);
    return true;
  }

  async getDailyViews(
    fileId: string,
  ): Promise<{ date: string; views: number }[]> {
    return this.fileViewRepository
      .createQueryBuilder('fileView')
      .select("DATE_TRUNC('day', fileView.viewedAt)", 'date')
      .addSelect('COUNT(*)', 'views')
      .where('fileView.file_id = :fileId', { fileId })
      .groupBy("DATE_TRUNC('day', fileView.viewedAt)")
      .getRawMany();
  }

  remove(id: string) {
    return `This action removes a #${id} storageFile`;
  }
}
