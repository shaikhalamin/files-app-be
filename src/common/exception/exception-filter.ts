import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.log('all exception ', { error: JSON.stringify(exception) });

    console.log('exception got ', exception);

    // console.log('exception', exception);
    // let message: string | string[] = 'An unexpected error occurred';

    // if (exception instanceof BadRequestException) {
    //   const exceptionResponse = exception.getResponse();
    //   if (
    //     typeof exceptionResponse === 'object' &&
    //     'message' in exceptionResponse
    //   ) {
    //     const errorMessage = exceptionResponse['message'];
    //     if (Array.isArray(errorMessage)) {
    //       message = errorMessage;
    //     } else if (typeof errorMessage === 'string') {
    //       message = errorMessage;
    //     } else {
    //       message = 'Something went wrong';
    //     }
    //   }
    // } else if (exception instanceof HttpException) {
    //   message = exception.message;
    // }

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
    } else if (exception instanceof Error) {
      message = exception.message || 'Unknown error occurred';
    } else {
      message = 'An unexpected error occurred';
    }

    const responseBody = {
      status_code: httpStatus,
      message: message,
      data: null,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
