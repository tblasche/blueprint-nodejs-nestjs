import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaService } from './prisma.service';
import { TestHelper } from '../testing/test.helper';

describe('PrismaService (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await TestHelper.initApp();
  });

  afterAll(async () => {
    await TestHelper.closeApp(app);
  });

  describe('isConnectedToDatabase()', () => {
    it('should return true when database is connected', async () => {
      expect(await app.get(PrismaService).isConnectedToDatabase()).toBe(true);
    });

    it('should return false when database is not connected', async () => {
      // given
      const app = await TestHelper.initApp({ withDatabase: false });

      // expect
      expect(await app.get(PrismaService).isConnectedToDatabase()).toBe(false);

      // cleanup
      await TestHelper.closeApp(app);
    });
  });
});
