import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '@/common/dto/response.dto';

/**
 * 전역 HTTP 예외 필터
 * 
 * 애플리케이션에서 발생하는 모든 예외를 캐치하여 일관된 에러 응답 형태로 변환합니다.
 * - HttpException: NestJS HTTP 예외들을 적절한 상태 코드와 메시지로 변환
 * - 기타 예외: 500 Internal Server Error로 처리하고 로깅
 * - 모든 에러에 추적 ID(traceId) 자동 생성
 */
@Catch() // 모든 예외를 캐치
export class HttpExceptionFilter implements ExceptionFilter {
  /**
   * 예외 처리 메인 메서드
   * @param exception 발생한 예외 객체
   * @param host ArgumentsHost - 실행 컨텍스트 정보
   */
  catch(exception: unknown, host: ArgumentsHost) {
    // HTTP 컨텍스트 추출
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 에러 응답에 사용할 변수들 초기화
    let status: number;
    let errorCode: string;
    let message: string;
    let details: Record<string, any> | undefined;

    // HttpException인지 확인하여 적절히 처리
    if (exception instanceof HttpException) {
      // NestJS HttpException 처리
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // 응답 형태에 따라 메시지와 에러 코드 추출
      if (typeof exceptionResponse === 'string') {
        // 단순 문자열 메시지인 경우
        message = exceptionResponse;
        errorCode = this.getErrorCode(status);
      } else if (typeof exceptionResponse === 'object') {
        // 객체 형태의 응답인 경우 (ValidationPipe 등에서 생성)
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        errorCode = responseObj.code || responseObj.error || this.getErrorCode(status);
        details = responseObj.details;
      } else {
        // 기타 경우
        message = exception.message;
        errorCode = this.getErrorCode(status);
      }
    } else {
      // HttpException이 아닌 예상치 못한 에러 처리
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorCode = 'INTERNAL_SERVER_ERROR';
      message = 'Internal server error';
      
      // 예상치 못한 에러는 콘솔에 로깅 (운영환경에서는 로거 사용 권장)
      console.error('Unexpected error:', exception);
    }

    // 에러 추적을 위한 고유 ID 생성
    const traceId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 표준화된 에러 응답 객체 생성
    const errorResponse = new ErrorResponse(
      errorCode,
      message,
      details,
      traceId,
    );

    // HTTP 상태 코드와 함께 에러 응답 반환
    response.status(status).json(errorResponse);
  }

  /**
   * HTTP 상태 코드를 기반으로 에러 코드 문자열 생성
   * @param status HTTP 상태 코드
   * @returns 에러 코드 문자열
   */
  private getErrorCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST: // 400
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED: // 401
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN: // 403
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND: // 404
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT: // 409
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY: // 422
        return 'VALIDATION_ERROR';
      case HttpStatus.INTERNAL_SERVER_ERROR: // 500
        return 'INTERNAL_SERVER_ERROR';
      default:
        return 'UNKNOWN_ERROR';
    }
  }
}
