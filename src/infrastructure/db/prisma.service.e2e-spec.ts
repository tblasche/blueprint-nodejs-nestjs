import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PrismaService } from './prisma.service';
import { E2eTestHelper } from '../testing/e2e-test.helper';

describe('PrismaService (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await E2eTestHelper.initApp();
  });

  afterAll(async () => {
    await E2eTestHelper.closeApp(app);
  });

  describe('isConnectedToDatabase()', () => {
    it('should return true when database is connected', async () => {
      expect(await app.get(PrismaService).isConnectedToDatabase()).toBe(true);
    });

    it('should return false when database is not connected', async () => {
      // given
      const app = await E2eTestHelper.initApp({ withDatabase: false });

      // expect
      expect(await app.get(PrismaService).isConnectedToDatabase()).toBe(false);

      // cleanup
      await E2eTestHelper.closeApp(app);
    });
  });
});
