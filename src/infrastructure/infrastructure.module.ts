import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaService } from './db/prisma.service';
import { LoggerModule, Params } from 'nestjs-pino';
import { getLoggingConfig } from './logging/logging.config';
import * as Joi from 'joi';
import { appConfigValidationSchema } from '../app.config.validation-schema';
import { APP_FILTER } from '@nestjs/core';
import { GlobalExceptionFilter } from './error/global-exception.filter';

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
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): Params => getLoggingConfig(config)
    })
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
