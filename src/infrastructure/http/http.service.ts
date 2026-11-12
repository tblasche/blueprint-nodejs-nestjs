import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class HttpService {
  private readonly logger: Logger = new Logger(HttpService.name);

  /**
   * Fetches the given URL.
   *
   * @param url The URL to fetch
   * @param requestProperties Request properties like method, headers or body
   * @param requestTimeoutMillis Timeout in milliseconds. Defaults to <code>10000</code>ms
   * @return The response in case of success, an Error otherwise
   */
  public async fetch(
    url: string,
    requestProperties: RequestInit = {},
    requestTimeoutMillis: number = 10000
  ): Promise<Response> {
    this.logger.debug(`Fetching ${url} with timeout ${requestTimeoutMillis}ms`);

    const headers = new Headers(requestProperties.headers);

    if (!headers.has('Accept-Encoding')) {
      headers.set('Accept-Encoding', 'zstd;q=1.0, br;q=0.8, gzip;q=0.6');
    }

    requestProperties.headers = headers;
    requestProperties.signal = AbortSignal.timeout(requestTimeoutMillis);

    try {
      return await fetch(url, requestProperties);
    } catch (error) {
      const e = error as Error;

      if (e.name === 'TimeoutError') {
        throw new Error(`Unable to fetch ${url}: ${requestTimeoutMillis}ms timeout exceeded`);
      }

      throw new Error(`Unable to fetch ${url}: ${e.message}${e.cause ? ` (${e.cause as string})` : ''}`);
    }
  }
}
