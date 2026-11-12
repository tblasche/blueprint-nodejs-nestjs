import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './db/prisma.service.js';
import { LoggerModule, Params } from 'nestjs-pino';
import { getLoggingConfig } from './logging/logging.config.js';
import Joi from 'joi';
import { appConfigValidationSchema } from '../app.config.validation-schema.js';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './error/global-exception.filter.js';
import { HttpService } from './http/http.service.js';

// create instance of LoggerModule to be able to override it within tests
// see https://github.com/nestjs/nest/issues/11967
export const loggerModule = LoggerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService): Params => getLoggingConfig(config)
});

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.dist'],
      isGlobal: true,
      validationSchema: Joi.object({
        ...appConfigValidationSchema
      }),
      validationOptions: {
        libraryOptions: {
          allowUnknown: true,
          abortEarly: false
        }
      }
    }),
    loggerModule
  ],
  providers: [
    ConfigService,
    HttpService,
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    }
  ],
  exports: [HttpService, PrismaService]
})
export class InfrastructureModule {}
