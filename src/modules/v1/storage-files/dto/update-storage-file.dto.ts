import { PartialType } from '@nestjs/swagger';
import { CreateStorageFileDto } from './create-storage-file.dto';

export class UpdateStorageFileDto extends PartialType(CreateStorageFileDto) {}
