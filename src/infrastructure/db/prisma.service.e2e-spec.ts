import { PrismaService } from './prisma.service.js';
import { E2eTestApp } from '../testing/e2e.test-app.js';

describe('PrismaService (e2e)', () => {
  describe('isConnectedToDatabase()', () => {
    it('should return true when database is connected', async () => {
      // given
      const app = await E2eTestApp.start();

      // expect
      expect(await app.getApp().get(PrismaService).isConnectedToDatabase()).toBe(true);

      // cleanup
      await app.stop();
    });

    it('should return false when database is not connected', async () => {
      // given
      const app = await E2eTestApp.start({ withDatabase: false });

      // expect
      expect(await app.getApp().get(PrismaService).isConnectedToDatabase()).toBe(false);

      // cleanup
      await app.stop();
    });
  });
});
