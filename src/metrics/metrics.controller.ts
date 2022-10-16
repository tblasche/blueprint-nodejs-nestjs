import { Controller, Get, Header } from '@nestjs/common';
import PrometheusClient = require('prom-client');
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Metrics')
export class MetricsController {
  constructor() {
    PrometheusClient.register.clear();
    PrometheusClient.collectDefaultMetrics({ register: PrometheusClient.register });
  }

  @Header('Content-Type', PrometheusClient.register.contentType)
  @Get('prometheus-metrics')
  prometheusMetrics(): Promise<string> {
    return PrometheusClient.register.metrics();
  }
}
