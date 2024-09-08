import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { TestHelper } from '../infrastructure/testing/test.helper';

describe('DemoController (e2e)', () => {
  jest.setTimeout(60000);
  let app: NestFastifyApplication;

  beforeAll(async () => {
    app = await TestHelper.initApp();
  });

  afterAll(async () => {
    await TestHelper.closeApp(app);
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
          id: expect.stringMatching(/^[a-f0-9-]{36}$/),
          title: 'demo',
          description: 'desc',
          createdAt: expect.stringMatching(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/),
          updatedAt: expect.stringMatching(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/)
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
