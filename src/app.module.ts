import { Module } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { DemoModule } from './demo/demo.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule, DemoModule, HealthModule, MetricsModule]
})
export class AppModule {}
