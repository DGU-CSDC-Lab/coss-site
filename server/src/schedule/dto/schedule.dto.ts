import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ScheduleCategory } from '../entities';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class ScheduleQuery extends PaginationQuery {
  @ApiProperty({
    description: '조회할 월 (YYYY-MM 형식). 생략 시 전체 기간 조회',
    example: '2024-03',
    required: false,
  })
  @IsOptional()
  @IsString()
  month?: string;

  @ApiProperty({
    description: '조회할 연도 (YYYY 형식). month가 있으면 무시됨',
    example: '2024',
    required: false,
  })
  @IsOptional()
  @IsString()
  year?: string;

  @ApiProperty({
    description: '조회할 특정 날짜 (YYYY-MM-DD 형식)',
    example: '2024-03-15',
    required: false,
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiProperty({
    description: '일정 카테고리. 생략 시 전체 카테고리 조회',
    enum: ScheduleCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScheduleCategory)
  category?: ScheduleCategory;
}

export class ScheduleCreate {
  @ApiProperty({
    description: '일정 제목',
    example: '2024학년도 1학기 개강',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: '일정 상세 내용',
    example: '2024학년도 1학기가 시작됩니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '일정 시작일',
    example: '2024-03-04T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: '일정 종료일',
    example: '2024-03-04T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: '일정 카테고리',
    enum: ScheduleCategory,
    example: ScheduleCategory.ACADEMIC,
  })
  @IsEnum(ScheduleCategory)
  category: ScheduleCategory;

  @ApiProperty({
    description: '장소',
    example: '본관 강당',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;
}

export class ScheduleUpdate {
  @ApiProperty({
    description: '일정 제목',
    example: '2024학년도 1학기 개강',
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: '일정 상세 내용',
    example: '2024학년도 1학기가 시작됩니다.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: '일정 시작일',
    example: '2024-03-04T00:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: '일정 종료일',
    example: '2024-03-04T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: '일정 카테고리',
    enum: ScheduleCategory,
    example: ScheduleCategory.ACADEMIC,
    required: false,
  })
  @IsOptional()
  @IsEnum(ScheduleCategory)
  category?: ScheduleCategory;

  @ApiProperty({
    description: '장소',
    example: '본관 강당',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;
}

export class ScheduleResponse {
  @ApiProperty({
    description: '일정 ID',
    example: 'uuid-1234-5678-9012',
  })
  id: string;

  @ApiProperty({
    description: '일정 제목',
    example: '2024학년도 1학기 개강',
  })
  title: string;

  @ApiProperty({
    description: '일정 상세 내용',
    example: '2024학년도 1학기가 시작됩니다.',
  })
  description?: string;

  @ApiProperty({
    description: '일정 시작일',
    example: '2024-03-04T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: '일정 종료일',
    example: '2024-03-04T23:59:59.000Z',
  })
  endDate?: Date;

  @ApiProperty({
    description: '일정 카테고리',
    enum: ScheduleCategory,
    example: ScheduleCategory.ACADEMIC,
  })
  category: ScheduleCategory;

  @ApiProperty({
    description: '장소',
    example: '본관 강당',
  })
  location?: string;

  @ApiProperty({
    description: '생성일시',
    example: '2024-03-15T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-03-15T09:00:00.000Z',
  })
  updatedAt: Date;
}
