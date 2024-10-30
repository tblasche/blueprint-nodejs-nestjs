import Fastify, { FastifyInstance } from 'fastify';
import { HttpService } from './http.service';
import { TestHelper } from '../testing/test.helper';

describe('HttpService', () => {
  const httpService: HttpService = new HttpService();
  let server: FastifyInstance | undefined;

  beforeEach(() => {
    server = undefined;
  });

  afterEach(async () => {
    if (server) {
      await server.close();
    }
  });

  function serverAddress(path: string): string {
    if (server) {
      const address = ['127.0.0.1', '::1'].includes(server.addresses()[0].address)
        ? 'localhost'
        : server.addresses()[0].address;
      return `http://${address}:${server.addresses()[0].port}/${path.replace(/^\//, '')}`;
    }

    return 'undefined';
  }

  describe('fetch', () => {
    it('should fetch given URL', async () => {
      // given
      server = Fastify();
      server.get('/', function (request, reply) {
        reply.send('ok');
      });
      await server.listen();

      // when
      const res = await httpService.fetch(serverAddress('/'));

      // then
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('ok');
    });

    it('should respect provided request config', async () => {
      // given
      server = Fastify();
      server.post('/', function (request, reply) {
        reply.send(request.body);
      });
      await server.listen();

      // when
      const res = await httpService.fetch(serverAddress('/'), { method: 'POST', body: 'post-body' });

      // then
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('post-body');
    });

    it('should set Accept-Encoding to gzip', async () => {
      // given
      server = Fastify();
      server.get('/', function (request, reply) {
        if (request.headers['accept-encoding'] !== 'gzip') {
          reply.status(500).send('missing accept-encoding=gzip header');
        } else {
          reply.send('ok');
        }
      });
      await server.listen();

      // when
      const res = await httpService.fetch(serverAddress('/'));

      // then
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('ok');
    });

    it('should abort request after provided timeout', async () => {
      // given
      server = Fastify();
      server.get('/', async function (request, reply) {
        await TestHelper.sleep(2000);
        reply.send('ok');
      });
      await server.listen();

      // expect
      await expect(() => httpService.fetch(serverAddress('/'), {}, 1000)).rejects.toThrow(
        /Unable to load http:\/\/[^:]+:\d+\/: 1000ms timeout exceeded/
      );
    });

    it('should handle unreachable URL', async () => {
      await expect(() => httpService.fetch('http://unknown-host.tld/')).rejects.toThrow(
        new Error(
          'Unable to load http://unknown-host.tld/: fetch failed (Error: getaddrinfo ENOTFOUND unknown-host.tld)'
        )
      );
    });
  });
});
