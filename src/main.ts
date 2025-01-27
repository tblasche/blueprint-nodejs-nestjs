import * as crypto from 'crypto';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { ApiDocumentationConfigurer } from './apidoc/api-documentation.configurer';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      requestIdHeader: 'x-request-id',
      genReqId: () => crypto.randomBytes(16).toString('hex')
    }),
    { bufferLogs: true }
  );
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new ValidationPipe());
  ApiDocumentationConfigurer.configure(app);
  await app.listen(app.get(ConfigService).get<string>('APP_PORT') || 3000, '0.0.0.0');
}
bootstrap();
