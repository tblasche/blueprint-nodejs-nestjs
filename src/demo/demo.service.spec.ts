import { DemoService } from './demo.service';
import { PrismaService } from '../infrastructure/db/prisma.service';

describe('DemoService', () => {
  describe('getDemos()', () => {
    it('should return empty array when there are no Demos in database', async () => {
      // given
      const mockPrismaService = {
        demo: { findMany: () => Promise.resolve([]) }
      } as PrismaService;
      const demoService = new DemoService(mockPrismaService);

      // expect
      expect(await demoService.getDemos()).toStrictEqual([]);
    });

    it('should return Demos from database', async () => {
      // given
      const mockPrismaService = {
        demo: {
          findMany: () =>
            Promise.resolve([
              {
                id: '532b2016-aac7-4c78-8a02-54a8e920466a',
                title: 'Title 1',
                description: 'Desc 1',
                createdAt: '2024-09-10T20:35:40.673Z',
                updatedAt: '2024-09-10T20:35:40.673Z'
              },
              {
                id: '8e006eff-e10e-40df-9f3a-39afec0755bb',
                title: 'Title 2',
                createdAt: '2024-09-10T20:35:41.339Z',
                updatedAt: '2024-09-10T20:40:41.339Z'
              }
            ])
        }
      } as any;
      const demoService = new DemoService(mockPrismaService);

      // expect
      expect(await demoService.getDemos()).toMatchObject([
        {
          id: '532b2016-aac7-4c78-8a02-54a8e920466a',
          title: 'Title 1',
          description: 'Desc 1',
          createdAt: '2024-09-10T20:35:40.673Z',
          updatedAt: '2024-09-10T20:35:40.673Z'
        },
        {
          id: '8e006eff-e10e-40df-9f3a-39afec0755bb',
          title: 'Title 2',
          description: undefined,
          createdAt: '2024-09-10T20:35:41.339Z',
          updatedAt: '2024-09-10T20:40:41.339Z'
        }
      ]);
    });
  });
});
