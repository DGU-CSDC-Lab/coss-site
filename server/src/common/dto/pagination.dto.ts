import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PaginationQuery {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    minimum: 1,
    default: 1,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
    required: false
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number = 10;
}

export class PageMeta {
  @ApiProperty({
    description: '현재 페이지 번호',
    example: 1
  })
  page: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10
  })
  size: number;

  @ApiProperty({
    description: '전체 항목 수',
    example: 45
  })
  totalElements: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 5
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
    description: '페이지 메타데이터'
  })
  meta: PageMeta;

  @ApiProperty({
    description: '데이터 목록',
    isArray: true
  })
  items: T[];

  constructor(items: T[], page: number, size: number, totalElements: number) {
    this.items = items;
    this.meta = new PageMeta(page, size, totalElements);
  }
}
