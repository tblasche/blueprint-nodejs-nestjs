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
      statusCode: 500,
      error: 'INTERNAL_SERVER_ERROR',
      requestId: requestIdDummy
    });
  });

  it('should send response for undefined exception', () => {
    globalExceptionFilter.catch(undefined, argumentHost);

    expect(response.code).toHaveBeenCalledWith(500);
    expect(response.header).toHaveBeenCalledWith('Content-Type', 'application/json; charset=utf-8');
    expect(response.send).toHaveBeenCalledWith({
      statusCode: 500,
      error: 'INTERNAL_SERVER_ERROR',
      requestId: requestIdDummy
    });
  });

  it('should send exception message of HttpException', () => {
    globalExceptionFilter.catch(new HttpException('Foo Bar', 404), argumentHost);

    expect(response.code).toHaveBeenCalledWith(404);
    expect(response.header).toHaveBeenCalledWith('Content-Type', 'application/json; charset=utf-8');
    expect(response.send).toHaveBeenCalledWith({
      statusCode: 404,
      error: 'Foo Bar',
      requestId: requestIdDummy
    });
  });

  it('should send message of message object of exceptions derived from HttpException and include requestId', () => {
    globalExceptionFilter.catch(new BadRequestException('Missing parameter xyz'), argumentHost);

    expect(response.code).toHaveBeenCalledWith(400);
    expect(response.header).toHaveBeenCalledWith('Content-Type', 'application/json; charset=utf-8');
    expect(response.send).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'Bad Request',
      message: 'Missing parameter xyz',
      requestId: requestIdDummy
    });
  });
});
