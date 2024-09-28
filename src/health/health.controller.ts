import { Controller, Get, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../infrastructure/db/prisma.service';
import { FastifyReply } from 'fastify';

@Controller()
@ApiTags('Health')
export class HealthController {
  constructor(private readonly prismaService: PrismaService) {}

  @Get('alive')
  alive(): void {}

  @Get('ready')
  ready(@Res() res: FastifyReply): void {
    this.prismaService.isConnectedToDatabase().then((isConnected) => {
      return isConnected ? res.code(200).send({ database: 'UP' }) : res.code(503).send({ database: 'NO CONNECTION' });
    });
  }
}
