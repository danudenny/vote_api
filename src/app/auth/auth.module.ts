import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/models/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../../strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from '../../strategies/local.strategy';
import { GoogleStrategy } from 'src/strategies/google.strategy';
import { TwitterStrategy } from 'src/strategies/twitter.strategy';
import { AuthGoogleService } from './auth-google.service';
import { AuthTwitterService } from './auth-twitter.service';
import { LoaderEnv } from 'src/config/loader';
import { AuthKakaoService } from './auth-kakao.service';
import { KakaoStrategy } from 'src/strategies/kakao.strategy';
import { MailService } from '../mail/mail.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule,
    JwtModule.register({
      secret: LoaderEnv.envs.JWT_SECRET,
      signOptions: { expiresIn: '2h' },
    }),
    BullModule.registerQueue({
      name: 'MAIL_QUEUE',
    }),
  ],
  providers: [
    AuthService,
    MailService,
    AuthGoogleService,
    AuthTwitterService,
    AuthKakaoService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    TwitterStrategy,
    KakaoStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
