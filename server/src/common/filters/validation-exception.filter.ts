import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorResponse } from '@/common/dto/response.dto';

/**
 * 유효성 검사 예외 전용 필터
 *
 * BadRequestException 중에서도 특히 유효성 검사 실패로 인한 예외를 처리합니다.
 * - class-validator에서 발생하는 유효성 검사 에러들을 422 상태 코드로 변환
 * - 여러 필드의 유효성 검사 에러를 구조화된 형태로 클라이언트에 전달
 * - HttpExceptionFilter보다 우선순위가 높아 먼저 처리됨
 */
@Catch(BadRequestException) // BadRequestException만 캐치
export class ValidationExceptionFilter implements ExceptionFilter {
  /**
   * 유효성 검사 예외 처리 메서드
   * @param exception BadRequestException 객체
   * @param host ArgumentsHost - 실행 컨텍스트 정보
   */
  catch(exception: BadRequestException, host: ArgumentsHost) {
    // HTTP 컨텍스트 추출
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // BadRequestException의 응답 내용 추출
    const exceptionResponse = exception.getResponse() as any;

    // 에러 상세 정보와 메시지 초기화
    let details: Record<string, any> | undefined;
    let message = 'Validation failed';

    // 응답 형태에 따라 적절히 처리
    if (exceptionResponse.message && Array.isArray(exceptionResponse.message)) {
      // class-validator에서 생성하는 배열 형태의 에러 메시지들을 구조화
      const structuredErrors = this.parseValidationErrors(
        exceptionResponse.message,
      );

      details = {
        validationErrors: structuredErrors,
        errorCount: Object.keys(structuredErrors).length,
      };

      // 첫 번째 에러를 메인 메시지로 사용
      const firstError = Object.values(structuredErrors)[0] as any;
      if (firstError && firstError.errors.length > 0) {
        message = `${firstError.field}: ${firstError.errors[0]}`;
      }
    } else if (typeof exceptionResponse.message === 'string') {
      // 단순 문자열 메시지인 경우
      message = exceptionResponse.message;
    }

    // 표준화된 에러 응답 객체 생성
    // traceId는 ErrorResponse 생성자에서 자동 생성됨
    const errorResponse = new ErrorResponse(
      'VALIDATION_ERROR', // 유효성 검사 에러는 항상 이 코드 사용
      message,
      details,
    );

    // 422 Unprocessable Entity 상태 코드로 응답
    // 400 Bad Request 대신 422를 사용하여 유효성 검사 실패임을 명확히 표시
    response.status(422).json(errorResponse);
  }

  /**
   * class-validator 에러 메시지 배열을 필드별로 구조화
   * @param errors class-validator에서 생성한 에러 메시지 배열
   * @returns 필드별로 그룹핑된 에러 정보 객체
   */
  private parseValidationErrors(errors: string[]): Record<string, any> {
    const structuredErrors: Record<string, any> = {};

    errors.forEach(error => {
      // "email must be a valid email" 형태에서 필드명과 메시지 분리
      const parts = error.split(' ');
      const field = parts[0]; // 첫 번째 단어가 필드명
      const errorMessage = error;

      // 필드별로 에러 정보 구조화
      if (!structuredErrors[field]) {
        structuredErrors[field] = {
          field: field,
          errors: [],
          type: this.getErrorType(errorMessage),
        };
      }

      structuredErrors[field].errors.push(errorMessage);
    });

    return structuredErrors;
  }

  /**
   * 에러 메시지를 분석하여 에러 타입 분류
   * @param errorMessage 에러 메시지
   * @returns 에러 타입 (format, length, type, required, range, enum 등)
   */
  private getErrorType(errorMessage: string): string {
    // 이메일 형식 검증
    if (errorMessage.includes('must be a valid email')) return 'format';
    
    // 날짜 형식 검증
    if (errorMessage.includes('must be a valid ISO 8601 date string')) return 'format';
    
    // 길이 검증 (@MinLength, @MaxLength, @Length)
    if (
      errorMessage.includes('must be longer than') ||
      errorMessage.includes('must be shorter than') ||
      errorMessage.includes('must be exactly')
    ) return 'length';
    
    // 숫자 범위 검증 (@Min, @Max)
    if (
      errorMessage.includes('must not be less than') ||
      errorMessage.includes('must not be greater than')
    ) return 'range';
    
    // 타입 검증 (@IsString, @IsNumber, @IsInt, @IsBoolean, @IsArray)
    if (
      errorMessage.includes('must be a number') ||
      errorMessage.includes('must be a string') ||
      errorMessage.includes('must be an integer') ||
      errorMessage.includes('must be a boolean') ||
      errorMessage.includes('must be an array')
    ) return 'type';
    
    // Enum 검증 (@IsEnum)
    if (
      errorMessage.includes('must be one of the following values') ||
      errorMessage.includes('must be a valid enum value')
    ) return 'enum';
    
    // 필수값 검증
    if (
      errorMessage.includes('should not be empty') ||
      errorMessage.includes('must be defined') ||
      errorMessage.includes('should not be null or undefined')
    ) return 'required';
    
    // 패턴 검증 (@Matches)
    if (errorMessage.includes('must match')) return 'pattern';
    
    // 배열 검증
    if (
      errorMessage.includes('each value in') ||
      errorMessage.includes('must contain')
    ) return 'array';
    
    // 기본값
    return 'validation';
  }
}
