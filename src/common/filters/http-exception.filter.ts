import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      //@ts-expect-error ...
      message: exception.getResponse?.().message || exception.message,
    };

    console.log(exception);
    console.log(exception.message);

    if (exception.message.startsWith('E11000')) {
      responseBody.message = 'Повторяющийся значение';
    }

    if (exception.message.includes('(expected size is less than 1048576)')) {
      responseBody.message = 'Слишком большой файл';
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
