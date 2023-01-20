import { Module } from '@nestjs/common';
import { LoaderEnv } from './config/loader';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { UserModule } from './app/user/user.module';
import { AuthModule } from './app/auth/auth.module';
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
    // BullModule.forRoot(LoaderEnv.bull()),
    UserModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
