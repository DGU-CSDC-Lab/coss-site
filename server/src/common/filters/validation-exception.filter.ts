import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '../dto/response.dto';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exceptionResponse = exception.getResponse() as any;

    let details: Record<string, any> | undefined;
    let message = 'Validation failed';

    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      // class-validator errors
      details = {
        validationErrors: exceptionResponse.message,
      };
      message = 'Validation failed';
    } else if (typeof exceptionResponse.message === 'string') {
      message = exceptionResponse.message;
    }

    const errorResponse = new ErrorResponse(
      'VALIDATION_ERROR',
      message,
      details,
    );

    response.status(422).json(errorResponse);
  }
}
