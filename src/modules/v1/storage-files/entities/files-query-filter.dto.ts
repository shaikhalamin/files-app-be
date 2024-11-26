import { ApiProperty } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';

export class FilesQueryFilterDto {
  @ApiProperty({
    default: 1,
  })
  @IsOptional()
  page: number = 1;

  @ApiProperty({
    default: 10,
  })
  @IsOptional()
  perPage: number = 10;
}
