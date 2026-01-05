import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();

    // 에러 로깅
    this.logger.error(`예외 발생: ${JSON.stringify(exception)}`, exception);

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    let errorMessage: string;
    if (typeof message === 'string') {
      errorMessage = message;
    } else if (
      typeof message === 'object' &&
      message !== null &&
      'message' in message
    ) {
      errorMessage = String((message as { message: unknown }).message);
    } else {
      errorMessage = 'Internal server error';
    }

    reply.status(status).send({
      statusCode: status,
      timestamp: new Date().toISOString(),
      message: errorMessage,
    });
  }
}
