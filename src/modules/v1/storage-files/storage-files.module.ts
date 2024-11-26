import { Module } from '@nestjs/common';
import { StorageFilesService } from './storage-files.service';
import { StorageFilesController } from './storage-files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageFile } from './entities/storage-file.entity';
import { FileTag } from './entities/file-tag.entity';
import { FileView } from './entities/file-view.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StorageFile, FileTag, FileView]),
    AuthModule,
  ],
  controllers: [StorageFilesController],
  providers: [StorageFilesService],
})
export class StorageFilesModule {}
