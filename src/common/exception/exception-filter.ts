import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // console.log('exception', exception);
    let message: string | string[] = 'An unexpected error occurred';

    if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse();
      if (
        typeof exceptionResponse === 'object' &&
        'message' in exceptionResponse
      ) {
        const errorMessage = exceptionResponse['message'];
        if (Array.isArray(errorMessage)) {
          message = errorMessage;
        } else if (typeof errorMessage === 'string') {
          message = errorMessage;
        } else {
          message = 'Something went wrong';
        }
      }
    } else if (exception instanceof HttpException) {
      message = exception.message;
    }

    const responseBody = {
      status_code: httpStatus,
      message: message,
      data: null,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
