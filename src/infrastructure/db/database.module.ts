import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [ConfigService, PrismaService],
  exports: [PrismaService]
})
export class DatabaseModule {}
