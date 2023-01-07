import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RegisterDto {
  @ApiProperty()
  name: String;

  @ApiProperty()
  dob: Date;

  @ApiProperty()
  @IsEmail()
  email: String;

  @ApiProperty()
  password: String;

  @ApiProperty()
  phone: String;
}
