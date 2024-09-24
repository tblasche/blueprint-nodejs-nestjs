import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService) {
    // setting database URL here is necessary to achieve parallel e2e tests. Correct URL is provided via ConfigService but not via env(DATABASE_URL)
    super({
      datasources: {
        db: {
          url: configService.get<string>('DATABASE_URL')
        }
      }
    });
  }

  async isConnectedToDatabase(): Promise<boolean> {
    return await this.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  }
}
