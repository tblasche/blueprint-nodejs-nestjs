import { Test, TestingModule } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { HealthModule } from './health.module';

describe('HealthController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule]
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /alive should return 200 OK', () => {
    return app.inject({ method: 'GET', url: '/alive' })
      .then(result => {
        expect(result.statusCode).toBe(200);
        expect(result.payload).toBe('');
      });
  });

  it('GET /ready should return 200 OK', () => {
    return app.inject({ method: 'GET', url: '/ready' })
      .then(result => {
        expect(result.statusCode).toBe(200);
        expect(result.payload).toBe('');
      });
  });
});
