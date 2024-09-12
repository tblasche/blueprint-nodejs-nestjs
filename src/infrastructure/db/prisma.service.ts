import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  async isConnectedToDatabase(): Promise<boolean> {
    return await this.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  }
}
