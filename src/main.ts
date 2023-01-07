import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, PinoLogger } from 'nestjs-pino';
import { LoaderEnv } from './config/loader';
import { ValidationPipe } from './pipes/validation.pipe';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger/dist';
const logger = new PinoLogger({});

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: console });
  app.useLogger(app.get(Logger));

  if (LoaderEnv.envs.CORS) {
    app.enableCors();
  }
  logger.info(`Enable Cors APP  :: ${LoaderEnv.envs.CORS}`);

  app.useGlobalPipes(new ValidationPipe());

  if (!LoaderEnv.isProduction()) {
    const options = new DocumentBuilder()
      .setTitle(LoaderEnv.envs.SWAGGER_API_TITLE)
      .setDescription(LoaderEnv.envs.SWAGGER_API_DESC)
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
    logger.info(`Swagger docs builded to /docs/`);
  }

  await app.listen(LoaderEnv.envs.APP_PORT);
  logger.info(`Listen APP on PORT :: ${LoaderEnv.envs.APP_PORT}`);
}
bootstrap();
