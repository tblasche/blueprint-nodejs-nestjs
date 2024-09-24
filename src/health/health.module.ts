import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { DatabaseModule } from '../infrastructure/db/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController]
})
export class HealthModule {}
