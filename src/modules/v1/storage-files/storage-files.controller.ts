import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { StorageFilesService } from './storage-files.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { FileUploadDto } from './dto/file-upload.dto';
// import { existsSync } from 'fs';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorator/loggedin-user.decorator';
import { ExpressRequestUser } from '../../../common/types/express-user';
import { FilesQueryFilterDto } from './entities/files-query-filter.dto';
import { cloudinarySignedUrl } from 'src/utils/bucket/cloudinary';

@ApiTags('Storage Files')
@Controller('storage-files')
export class StorageFilesController {
  constructor(private readonly storageFilesService: StorageFilesService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe())
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: FileUploadDto })
  @UseInterceptors(
    FileInterceptor('fileName', {
      storage: diskStorage({
        // destination: (req, file, cb) => {
        //   const uploadsPath = join(
        //     __dirname,
        //     '..',
        //     '..',
        //     '..',
        //     '..',
        //     'public',
        //     'uploads',
        //   );
        //   if (!existsSync(uploadsPath)) {
        //     mkdirSync(uploadsPath, { recursive: true });
        //   }
        //   cb(null, uploadsPath);
        // },
        filename: (req, file, cb) => {
          const randomName = uuidv4();
          const fileName = `${Date.now()}-${randomName}${extname(file.originalname)}`;
          cb(null, fileName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'video/mp4',
          'video/webm',
          'video/avi',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Only image and video files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  create(
    @CurrentUser() user: ExpressRequestUser,
    @UploadedFile() file: Express.Multer.File,
    @Body() fileUploadDto: FileUploadDto,
  ) {
    console.log('fileUploadDto', fileUploadDto);
    return this.storageFilesService.create(file, fileUploadDto, user.id);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query() query: FilesQueryFilterDto,
    @CurrentUser() user: ExpressRequestUser,
  ) {
    return this.storageFilesService.findAll(query, user.id);
  }

  @Get('download/:fileName')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async downloadFile(@Param('fileName') fileName: string) {
    try {
      const file = await this.storageFilesService.findOne(fileName);

      const contentType = file.file_content_type.split('/')[0];

      // Generate the signed URL from Cloudinary
      const signedUrl = await cloudinarySignedUrl(file.file_key, contentType);

      if (!signedUrl) {
        throw new BadRequestException('Unable to generate signed URL');
      }

      // Redirect the user to the Cloudinary signed URL for download
      return {
        signedUrl,
        contentType,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('generate-link/:fileName')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async generatePublicLink(@Param('fileName') fileName: string) {
    try {
      return this.storageFilesService.generateLink(fileName);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('private/preview/:fileName')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async privatePreview(
    @Param('fileName') fileName: string,
    @Request() req: any,
  ) {
    try {
      const file = await this.storageFilesService.findOne(fileName);

      const contentType = file.file_content_type.split('/')[0];
      // Generate the signed URL from Cloudinary
      const signedUrl = await cloudinarySignedUrl(file.file_key, contentType);

      if (!signedUrl) {
        throw new BadRequestException('Unable to generate signed URL');
      }

      const viewerIp = req.ip;
      const viewerId = req.user?.id;

      await this.storageFilesService.logFileView(file.id, viewerIp, viewerId);

      // Redirect the user to the Cloudinary signed URL for download
      return { signedUrl, contentType };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('public/preview/:token')
  async publicPreview(@Param('token') token: string, @Request() req: any) {
    try {
      const file = await this.storageFilesService.validateToken(token);

      const contentType = file.file_content_type.split('/')[0];
      // Generate the signed URL from Cloudinary
      const signedUrl = await cloudinarySignedUrl(file.file_key, contentType);

      if (!signedUrl) {
        throw new BadRequestException('Unable to generate signed URL');
      }

      const viewerIp = req.ip;

      await this.storageFilesService.logFileView(file.id, viewerIp);

      // Redirect the user to the Cloudinary signed URL for download
      return { signedUrl, contentType };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':fileId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findJoinCodeByLessonId(@Param('fileId') fileId: string) {
    return this.storageFilesService.remove(fileId);
  }
}
