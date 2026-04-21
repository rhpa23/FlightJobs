import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(Error)
export class MailExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MailExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    this.logger.error('Mail operation failed:', exception.message);

    // Don't expose email errors to client for security
    if (response && typeof response.status === 'function') {
      response.status(500).json({
        message: 'An error occurred while processing your request.',
        error: 'Internal Server Error',
        statusCode: 500,
      });
    }
  }
}
