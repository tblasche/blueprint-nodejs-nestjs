import { Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    // setting database URL here is necessary to achieve parallel e2e tests. Correct URL is provided via ConfigService but not via env(DATABASE_URL)
    const adapter = new PrismaPg({
      connectionString: configService.get<string>('DATABASE_URL')
    });

    super({ adapter });
  }

  async isConnectedToDatabase(): Promise<boolean> {
    return await this.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  }
}
