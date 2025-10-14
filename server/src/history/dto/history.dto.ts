import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationQuery } from '@/common/dto/response.dto';

export class HistoryQuery extends PaginationQuery {
  @ApiProperty({
    description: '정렬 방식 (asc: 오래된 순, desc: 최신 순)',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
    required: false,
  })
  @IsOptional()
  sort?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: '정렬 순서 (ASC: 오름차순, DESC: 내림차순)',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    required: false,
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: '연도 필터',
    example: 2024,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  year?: number;
}

export class HistoryCreate {
  @ApiProperty({
    description: '연도',
    example: 2024,
    minimum: 1900,
    maximum: 2100,
  })
  @IsInt()
  @Min(1900)
  @Max(2100)
  year: number;

  @ApiProperty({
    description: '월',
    example: 3,
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    description: '연혁 제목',
    example: '지능IoT학과 신설',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '연혁 상세 내용',
    example: '지능IoT학과가 새롭게 신설되어 첫 신입생을 모집하였습니다.',
  })
  @IsString()
  description: string;
}

export class HistoryUpdate {
  @ApiProperty({
    description: '연도',
    example: 2024,
    minimum: 1900,
    maximum: 2100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(2100)
  year?: number;

  @ApiProperty({
    description: '월',
    example: 3,
    minimum: 1,
    maximum: 12,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiProperty({
    description: '연혁 제목',
    example: '지능IoT학과 신설',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '연혁 상세 내용',
    example: '지능IoT학과가 새롭게 신설되어 첫 신입생을 모집하였습니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class HistoryResponse {
  @ApiProperty({
    description: '연혁 ID',
    example: 'uuid-1234-5678-9012',
  })
  id: string;

  @ApiProperty({
    description: '연도',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: '월',
    example: 3,
  })
  month: number;

  @ApiProperty({
    description: '연혁 제목',
    example: '지능IoT학과 신설',
  })
  title: string;

  @ApiProperty({
    description: '연혁 상세 내용',
    example: '지능IoT학과가 새롭게 신설되어 첫 신입생을 모집하였습니다.',
  })
  description: string;
}
