import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module.js';
import { MetricsModule } from './metrics/metrics.module.js';
import { DemoModule } from './demo/demo.module.js';
import { InfrastructureModule } from './infrastructure/infrastructure.module.js';

@Module({
  imports: [InfrastructureModule, DemoModule, HealthModule, MetricsModule]
})
export class AppModule {}
