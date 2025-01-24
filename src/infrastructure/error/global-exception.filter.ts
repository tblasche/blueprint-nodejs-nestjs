import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): any {
    const response = host.switchToHttp().getResponse<FastifyReply>();
    const request = host.switchToHttp().getRequest<FastifyRequest>();
    const responseStatus = this.getResponseStatus(exception);

    if (!this.isHttpException(exception)) {
      this.logException(exception);
    }

    response
      .code(responseStatus)
      .header('Content-Type', 'application/json; charset=utf-8')
      .send(
        exception instanceof BadRequestException
          ? Object.assign(exception.getResponse(), { requestId: request.id })
          : {
              statusCode: responseStatus,
              error: this.getErrorMessage(exception, responseStatus),
              requestId: request.id
            }
      );
  }

  private getResponseStatus(exception: unknown): number {
    return this.isHttpException(exception)
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception: unknown, httpStatus: HttpStatus): string {
    return this.isHttpException(exception) ? (exception as HttpException).message : HttpStatus[httpStatus];
  }

  private logException(exception: unknown): void {
    if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error(`Unhandled exception: ${String(exception)}`);
    }
  }

  private isHttpException(exception: unknown): boolean {
    return exception != null && exception instanceof HttpException;
  }
}
