import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  // constructor(configService: ConfigService) {
  //   super({
  //     datasources: {
  //       db: {
  //         url: configService.get<string>('DATABASE_URL')
  //       }
  //     }
  //   });
  // }
}
