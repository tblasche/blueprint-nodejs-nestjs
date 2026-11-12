import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller.js';
import { DemoService } from './demo.service.js';

@Module({
  controllers: [DemoController],
  providers: [DemoService]
})
export class DemoModule {}
