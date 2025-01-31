import { Controller, Get, Header } from '@nestjs/common';
import * as PrometheusClient from 'prom-client';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Metrics')
export class MetricsController {
  constructor() {
    PrometheusClient.register.clear();
    PrometheusClient.collectDefaultMetrics({ register: PrometheusClient.register });
  }

  @Header('Content-Type', PrometheusClient.register.contentType)
  @Get('metrics')
  metrics(): Promise<string> {
    return PrometheusClient.register.metrics();
  }
}
