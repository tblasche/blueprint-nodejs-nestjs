import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { MetricsModule } from './metrics.module';

describe('MetricsController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MetricsModule]
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should provide prometheus metrics', () => {
    return app.inject({ method: 'GET', url: '/prometheus-metrics' })
      .then(result => {
        expect(result.statusCode).toBe(200);
        expect(result.headers['content-type']).toMatch(/^text\/plain; /);
        expect(result.headers['content-type']).toContain('charset=utf-8');
        expect(result.payload).toContain('nodejs_version_info');
      });
  });
});
