import { E2eTestApp } from '../infrastructure/testing/e2e.test-app';

describe('DemoController (e2e)', () => {
  let app: E2eTestApp;

  beforeAll(async () => {
    app = await E2eTestApp.start();
  });

  afterAll(async () => {
    await app.stop();
  });

  it('GET /api/demos should return 200 OK', async () => {
    // when
    const response = await app.inject({ method: 'GET', url: '/api/demos' });

    // then
    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual([]);
  });

  it('POST /api/demos should return 201 Created and create given Demo', async () => {
    // when
    const response = await app.inject({
      method: 'POST',
      url: '/api/demos',
      body: {
        title: 'demo',
        description: 'desc'
      }
    });

    // then
    expect(response.statusCode).toBe(201);
    expect(response.json()).toStrictEqual({
      id: expect.stringMatching(/^[a-f0-9-]{36}$/),
      title: 'demo',
      description: 'desc',
      createdAt: expect.stringMatching(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/),
      updatedAt: expect.stringMatching(/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$/)
    });
  });

  it('POST /api/demos should return 400 Bad Request on invalid CreateDemoDto', async () => {
    // when
    const response = await app.inject({
      method: 'POST',
      url: '/api/demos',
      body: {
        description: 'desc'
      }
    });

    // then
    expect(response.statusCode).toBe(400);
    expect(response.json()).toStrictEqual({
      statusCode: 400,
      error: 'Bad Request',
      message: ['title should not be empty'],
      requestId: 'request-id'
    });
  });
});
