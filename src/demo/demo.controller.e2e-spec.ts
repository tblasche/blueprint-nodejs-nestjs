import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { TestHelper } from '../infrastructure/testing/test.helper';

describe('DemoController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await TestHelper.initApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/demos should return 200 OK', () => {
    return app.inject({ method: 'GET', url: '/api/demos' }).then((result) => {
      expect(result.statusCode).toBe(200);
      expect(result.json()).toStrictEqual([]);
    });
  });

  it('POST /api/demos should return 201 Created and create given Demo', () => {
    return app
      .inject({
        method: 'POST',
        url: '/api/demos',
        body: {
          title: 'demo',
          description: 'desc'
        }
      })
      .then((result) => {
        expect(result.statusCode).toBe(201);
        expect(result.json()).toStrictEqual({
          id: expect.stringMatching(/^[a-f0-9]{32}$/),
          title: 'demo',
          description: 'desc'
        });
      });
  });

  it('POST /api/demos should return 400 Bad Request on invalid CreateDemoDto', () => {
    return app
      .inject({
        method: 'POST',
        url: '/api/demos',
        body: {
          description: 'desc'
        }
      })
      .then((result) => {
        expect(result.statusCode).toBe(400);
        expect(result.json()).toStrictEqual({
          statusCode: 400,
          error: 'Bad Request',
          message: ['title should not be empty'],
          requestId: 'request-id'
        });
      });
  });
});
