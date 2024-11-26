import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The email of the User',
    example: 'ibrahim@gmail.com',
  })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'ibrahim@123!@',
  })
  @IsNotEmpty()
  password: string;
}
