import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
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
      .send({
        error: {
          status: responseStatus,
          message: this.getErrorMessage(exception, responseStatus),
          requestId: request.id
        }
      });
  }

  private getResponseStatus(exception): number {
    return this.isHttpException(exception) ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorMessage(exception, httpStatus: HttpStatus): string {
    if (this.isHttpException(exception)) {
      return (exception.message && exception.message.message) ? exception.message.message : exception.message;
    }

    return HttpStatus[httpStatus];
  }

  private logException(exception): void {
    if (!!(exception as Error).message) {
      this.logger.error(exception.message, exception.stack);
    } else {
      this.logger.error(`Unhandled exception: ${exception}`);
    }
  }

  private isHttpException(exception): boolean {
    return exception instanceof HttpException;
  }
}
