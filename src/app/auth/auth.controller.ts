import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Post } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Branch')
@Controller('v1/auth')
export class AuthController {
  constructor(private authSvc: AuthService) {}

  @Post('register')
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ description: 'Success Register User' })
  register(@Body() payload: RegisterDto) {
    return this.authSvc.register(payload);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ description: 'Success Login' })
  login(@Body() payload: LoginDto) {
    return this.authSvc.login(payload);
  }
}
