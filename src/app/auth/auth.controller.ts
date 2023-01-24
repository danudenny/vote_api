import {
  Controller,
  Get,
  Post,
  Request,
  UseInterceptors,
  Body,
  UseGuards,
  Header,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBody,
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtGuard } from '../../guards/jwt.guard';
import { ResponseInterceptor } from '../../interceptors/response.interceptor';
import { GoogleGuard } from 'src/guards/google.guard';
import { TwitterGuard } from 'src/guards/twitter.guard';
import { AuthTwitterService } from './auth-twitter.service';
import { AuthGoogleService } from './auth-google.service';
import { LoaderEnv } from 'src/config/loader';
import { KakaoGuard } from 'src/guards/kakao.guard';
import { AuthKakaoService } from './auth-kakao.service';

@ApiTags('Branch')
@Controller('v1/auth')
export class AuthController {
  constructor(
    private authSvc: AuthService,
    private twitterSvc: AuthTwitterService,
    private googleSvc: AuthGoogleService,
    private kakaoSvc: AuthKakaoService,
  ) {}

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

  @Get('profile')
  @ApiSecurity('bearer')
  @UseGuards(JwtGuard)
  @ApiOkResponse({ description: 'Success Get Profile' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseInterceptors(ResponseInterceptor)
  profile(@Request() req) {
    return this.authSvc.profile(req.user.userId);
  }

  @Get('google')
  @UseGuards(GoogleGuard)
  async googleAuth(@Request() req) {}

  @Get('google/redirect')
  @UseGuards(GoogleGuard)
  googleAuthRedirect(@Request() req) {
    return this.googleSvc.googleLogin(req);
  }

  @Get('twitter')
  @UseGuards(TwitterGuard)
  async twitterAuth(@Request() req) {}

  @Get('twitter/redirect')
  @Header('Authorization', `Bearer ${LoaderEnv.envs.TWITTER_BEARER_TOKEN}`)
  @UseGuards(TwitterGuard)
  twitterAuthRedirect(@Request() req) {
    return this.twitterSvc.twitterLogin(req);
  }

  @Get('kakao')
  @UseGuards(KakaoGuard)
  async kakaoAuth(@Request() req) {}

  @Get('kakao/redirect')
  @UseGuards(KakaoGuard)
  kakaoAuthRedirect(@Request() req) {
    return this.kakaoSvc.kakaoLogin(req);
  }
}
