import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './db/prisma.service';
import { LoggerModule, Params } from 'nestjs-pino';
import { getLoggingConfig } from './logging/logging.config';
import * as Joi from 'joi';
import { appConfigValidationSchema } from '../app.config.validation-schema';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './error/global-exception.filter';

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
        allowUnknown: true,
        abortEarly: false
      }
    }),
    loggerModule
  ],
  providers: [
    ConfigService,
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter
    }
  ],
  exports: [PrismaService]
})
export class InfrastructureModule {}
