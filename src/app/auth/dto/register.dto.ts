import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { Gender } from '../../../models/enum';

export class RegisterDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  nickname: string;

  @ApiProperty()
  dob: Date;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  gender: Gender;
}
