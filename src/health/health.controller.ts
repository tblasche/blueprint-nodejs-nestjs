import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Health')
export class HealthController {
  @Get('alive')
  alive(): void {
    return;
  }

  @Get('ready')
  ready(): void {
    return;
  }
}
