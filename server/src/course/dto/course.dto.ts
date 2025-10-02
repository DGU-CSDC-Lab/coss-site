import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationQuery } from '../../common/dto/pagination.dto';

export class CourseQuery extends PaginationQuery {
  @ApiProperty({
    description: '연도 필터',
    example: 2024,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  year?: number;

  @ApiProperty({
    description: '학기 필터',
    example: '1학기',
    required: false,
  })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiProperty({
    description: '학과 검색',
    example: '지능IoT학과',
    required: false,
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({
    description: '과목명 검색 (키워드)',
    example: 'IoT',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: '학수번호 검색',
    example: 'IOT101',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: '수강학년 검색',
    example: '1학년',
    required: false,
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({
    description: '정렬 기준',
    example: 'name',
    enum: ['name', 'code', 'department', 'grade', 'credit', 'createdAt'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['name', 'code', 'department', 'grade', 'credit', 'createdAt'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: '정렬 순서',
    example: 'ASC',
    enum: ['ASC', 'DESC'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class CourseCreate {
  @ApiProperty({
    description: '학년도',
    example: 2024,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({
    description: '학기',
    example: '1학기',
  })
  @IsString()
  semester: string;

  @ApiProperty({
    description: '학과',
    example: '지능IoT학과',
  })
  @IsString()
  department: string;

  @ApiProperty({
    description: '교과목 코드',
    example: 'IOT101',
  })
  @IsString()
  courseCode: string;

  @ApiProperty({
    description: '교과목명',
    example: 'IoT 기초',
  })
  @IsString()
  subjectName: string;

  @ApiProperty({
    description: '교과목 영문명',
    example: 'IoT Fundamentals',
    required: false,
  })
  @IsOptional()
  @IsString()
  englishName?: string;

  @ApiProperty({
    description: '학년',
    example: '1학년',
    required: false,
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({
    description: '학점',
    example: 3.0,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  credit?: number;

  @ApiProperty({
    description: '수업 시간',
    example: '월 09:00-12:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  classTime?: string;

  @ApiProperty({
    description: '담당교원',
    example: '김교수',
    required: false,
  })
  @IsOptional()
  @IsString()
  instructor?: string;

  @ApiProperty({
    description: '강의실',
    example: 'A101',
    required: false,
  })
  @IsOptional()
  @IsString()
  classroom?: string;

  @ApiProperty({
    description: '강의유형',
    example: '이론',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseType?: string;

  @ApiProperty({
    description: '강의계획서 URL',
    example: 'https://example.com/syllabus.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  syllabusUrl?: string;
}

export class CourseUpdate {
  @ApiProperty({
    description: '학년도',
    example: 2024,
    minimum: 2000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(2000)
  year?: number;

  @ApiProperty({
    description: '학기',
    example: '1학기',
    required: false,
  })
  @IsOptional()
  @IsString()
  semester?: string;

  @ApiProperty({
    description: '학과',
    example: '지능IoT학과',
    required: false,
  })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({
    description: '교과목 코드',
    example: 'IOT101',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseCode?: string;

  @ApiProperty({
    description: '교과목명',
    example: 'IoT 기초',
    required: false,
  })
  @IsOptional()
  @IsString()
  subjectName?: string;

  @ApiProperty({
    description: '학년',
    example: '1학년',
    required: false,
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({
    description: '학점',
    example: 3,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  credit?: number;

  @ApiProperty({
    description: '수업 시간',
    example: '월 09:00-12:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  classTime?: string;

  @ApiProperty({
    description: '교과목 영문명',
    example: 'IoT Fundamentals',
    required: false,
  })
  @IsOptional()
  @IsString()
  englishName?: string;

  @ApiProperty({
    description: '담당교원',
    example: '김교수',
    required: false,
  })
  @IsOptional()
  @IsString()
  instructor?: string;

  @ApiProperty({
    description: '강의실',
    example: 'A101',
    required: false,
  })
  @IsOptional()
  @IsString()
  classroom?: string;

  @ApiProperty({
    description: '강의유형',
    example: '이론',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseType?: string;

  @ApiProperty({
    description: '강의계획서 URL',
    example: 'https://example.com/syllabus.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  syllabusUrl?: string;
}

export class CourseResponse {
  @ApiProperty({
    description: '교과목 ID',
    example: 'uuid-1234-5678-9012',
  })
  id: string;

  @ApiProperty({
    description: '학년도',
    example: 2024,
  })
  year: number;

  @ApiProperty({
    description: '학기',
    example: '1학기',
  })
  semester: string;

  @ApiProperty({
    description: '학과',
    example: '지능IoT학과',
  })
  department: string;

  @ApiProperty({
    description: '교과목 코드',
    example: 'IOT101',
  })
  courseCode: string;

  @ApiProperty({
    description: '교과목명',
    example: 'IoT 기초',
  })
  subjectName: string;

  @ApiProperty({
    description: '교과목 영문명',
    example: 'IoT Fundamentals',
    required: false,
  })
  englishName?: string;

  @ApiProperty({
    description: '학년',
    example: '1학년',
    required: false,
  })
  grade?: string;

  @ApiProperty({
    description: '학점',
    example: 3.0,
    required: false,
  })
  credit?: number;

  @ApiProperty({
    description: '수업 시간',
    example: '월 09:00-12:00',
    required: false,
  })
  classTime?: string;

  @ApiProperty({
    description: '담당교원',
    example: '김교수',
    required: false,
  })
  instructor?: string;

  @ApiProperty({
    description: '강의실',
    example: 'A101',
    required: false,
  })
  classroom?: string;

  @ApiProperty({
    description: '강의유형',
    example: '이론',
    required: false,
  })
  courseType?: string;

  @ApiProperty({
    description: '강의계획서 URL',
    example: 'https://example.com/syllabus.pdf',
    required: false,
  })
  syllabusUrl?: string;

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

export class CourseBulkInitRequest {
  @ApiProperty({
    description: '학년도',
    example: 2025,
    minimum: 2000,
  })
  @IsInt()
  @Min(2000)
  year: number;

  @ApiProperty({
    description: '학기',
    example: '1학기',
  })
  @IsString()
  semester: string;

  @ApiProperty({
    description: '교과목 목록',
    type: [CourseCreate],
  })
  courses: CourseCreate[];
}

export class CourseUploadResult {
  @ApiProperty({
    description: '업로드 성공 개수',
    example: 10,
  })
  successCount: number;

  @ApiProperty({
    description: '업로드 실패 개수',
    example: 2,
  })
  failureCount: number;

  @ApiProperty({
    description: '실패한 행 정보',
    example: ['2행: 필수 필드 누락', '5행: 잘못된 학점 형식'],
  })
  errors: string[];
}
