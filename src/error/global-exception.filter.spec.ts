import { ArgumentsHost, BadRequestException, HttpException } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  const globalExceptionFilter: GlobalExceptionFilter = new GlobalExceptionFilter();
  const requestIdDummy = 'dummy_request_id';

  const request = {
    id: requestIdDummy
  };
  const response = {
    code: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  };

  const argumentHost = {
    switchToHttp: (): any => ({
      getRequest: (): any => request,
      getResponse: (): any => response
    })
  } as ArgumentsHost;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send response for Error', () => {
    globalExceptionFilter.catch(new Error('Foo Bar'), argumentHost);

    expect(response.code).toHaveBeenCalledWith(500);
    expect(response.header).toHaveBeenCalledWith('Content-Type', 'application/json; charset=utf-8');
    expect(response.send).toHaveBeenCalledWith({
      error: {
        status: 500,
        message: 'INTERNAL_SERVER_ERROR',
        requestId: requestIdDummy
      }
    });
  });

  it('should send exception message of HttpException', () => {
    globalExceptionFilter.catch(new HttpException('Foo Bar', 404), argumentHost);

    expect(response.code).toHaveBeenCalledWith(404);
    expect(response.header).toHaveBeenCalledWith('Content-Type', 'application/json; charset=utf-8');
    expect(response.send).toHaveBeenCalledWith({
      error: {
        status: 404,
        message: 'Foo Bar',
        requestId: requestIdDummy
      }
    });
  });

  it('should send message of message object of exceptions derived from HttpException', () => {
    globalExceptionFilter.catch(new BadRequestException('Missing parameter xyz'), argumentHost);

    expect(response.code).toHaveBeenCalledWith(400);
    expect(response.header).toHaveBeenCalledWith('Content-Type', 'application/json; charset=utf-8');
    expect(response.send).toHaveBeenCalledWith({
      error: {
        status: 400,
        message: 'Missing parameter xyz',
        requestId: requestIdDummy
      }
    });
  });
});
