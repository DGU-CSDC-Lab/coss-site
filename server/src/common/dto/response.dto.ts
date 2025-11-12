import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// 페이지네이션 쿼리 기본 클래스
export class PaginationQuery {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    minimum: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 20,
    minimum: 1,
    maximum: 500,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(500)
  size?: number = 20;
}

// 공통 성공 응답 DTO
export class SuccessResponse<T> {
  @ApiProperty({
    description: '성공 여부',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: '응답 데이터',
  })
  data: T;

  @ApiProperty({
    description: '응답 시간',
    example: '2025-10-12T18:57:40.370Z',
  })
  timestamp: string;

  constructor(data: T) {
    this.success = true;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

// 공통 에러 응답 DTO
export class ErrorResponse {
  @ApiProperty({
    description: '에러 코드',
    example: 'Unauthorized',
  })
  code: string;

  @ApiProperty({
    description: '에러 메시지',
    example: 'Invalid credentials',
  })
  message: string;

  @ApiProperty({
    description: '에러 상세 정보',
    example: { field: 'email', reason: 'invalid format' },
    required: false,
  })
  details?: Record<string, any>;

  @ApiProperty({
    description: '요청 추적 ID',
    example: 'req-1759188671895-h6mjr7nxe',
  })
  traceId: string;

  constructor(
    code: string,
    message: string,
    details?: Record<string, any>,
    traceId?: string,
  ) {
    this.code = code;
    this.message = message;
    this.details = details;
    this.traceId =
      traceId || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 페이지네이션 메타데이터 DTO
export class PageMeta {
  @ApiProperty({
    description: '현재 페이지 번호',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
  })
  size: number;

  @ApiProperty({
    description: '전체 항목 수',
    example: 45,
  })
  totalElements: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 5,
  })
  totalPages: number;

  constructor(page: number, size: number, totalElements: number) {
    this.page = page;
    this.size = size;
    this.totalElements = totalElements;
    this.totalPages = Math.ceil(totalElements / size);
  }
}

export class PagedResponse<T> {
  @ApiProperty({
    description: '페이지네이션 메타데이터',
    type: PageMeta,
  })
  meta: PageMeta;

  @ApiProperty({
    description: '데이터 목록',
    isArray: true,
  })
  items: T[];

  constructor(items: T[], page: number, size: number, totalElements: number) {
    this.items = items;
    this.meta = new PageMeta(page, size, totalElements);
  }
}
