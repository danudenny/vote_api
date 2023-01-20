import { Module } from '@nestjs/common';
import { LoaderEnv } from './config/loader';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from './app/user/user.module';
import { AuthModule } from './app/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailModule } from './app/mail/mail.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    LoaderEnv,
    TypeOrmModule.forRoot(LoaderEnv.getTypeOrmConfig()),
    LoggerModule.forRoot({
      pinoHttp: {
        level: LoaderEnv.envs.NODE_ENV !== 'production' ? 'debug' : 'error',
      },
    }),
    BullModule.forRootAsync({
      useFactory: async () => ({
        redis: {
          host: LoaderEnv.envs.REDIS_BULL_HOST,
          port: +LoaderEnv.envs.REDIS_BULL_PORT,
        },
      }),
    }),
    AuthModule,
    UserModule,
    MailModule,
  ]
})
export class AppModule {}
