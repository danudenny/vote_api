import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  email: String;

  @ApiProperty()
  password: String;
}
