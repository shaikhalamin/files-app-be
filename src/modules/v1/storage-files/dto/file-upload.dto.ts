import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  fileName: any;

  @ApiProperty({
    description: 'Tag of the file',
    example: 'picture, nature',
  })
  @IsNotEmpty()
  tags: string;
}
