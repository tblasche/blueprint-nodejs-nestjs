import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { DemoService } from './demo.service';
import { PrismaService } from '../infrastructure/db/prisma.service';

@Module({
  controllers: [DemoController],
  providers: [DemoService, PrismaService]
})
export class DemoModule {}
