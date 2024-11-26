import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'The firstName of the user',
    example: 'Md',
  })
  @IsNotEmpty()
  first_name: string;

  @ApiProperty({
    description: 'The lastName of the user',
    example: 'Ibrahim',
  })
  @IsNotEmpty()
  last_name: string;

  @ApiProperty({
    description: 'The email of the User',
    example: 'ibrahim@gmail.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'The phone of the User',
    example: '+19786600659',
  })
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'ibrahim@123!@',
  })
  @IsOptional()
  password: string;
}
