import {
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
  Min,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

import { PaginationQuery } from '@/common/dto/response.dto';

// 교과목 목록 조회 쿼리 DTO
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
    description: '교과목명 검색',
    example: 'IoT 기초',
    required: false,
  })
  @IsOptional()
  @IsString()
  subjectName?: string;

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

// 교과목 Master 생성 요청 DTO
export class CourseMasterCreate {
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
  @IsString()
  englishName: string;

  @ApiProperty({
    description: '교과목 설명',
    example:
      'This course provides an introduction to IoT concepts and applications.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: '학년',
    example: '1학년',
    required: false,
  })
  @IsString()
  grade: string;

  @ApiProperty({
    description: '학점',
    example: 3.0,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  credit: number;

  @ApiProperty({
    description: '강의유형',
    example: '이론',
    required: false,
  })
  @IsString()
  courseType: string;
}

// 교과목 Offering 생성 요청 DTO
export class CourseOfferingCreate {
  @ApiProperty({
    description: 'CourseMaster ID',
    example: 'uuid-1234-5678-9012',
  })
  @IsString()
  masterId: string; // CourseMaster ID 참조

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
    description: '분반',
    example: '01',
    required: false,
  })
  @IsOptional()
  @IsString()
  section?: string;

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
    description: '강의계획서 URL',
    example: 'https://example.com/syllabus.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  syllabusUrl?: string;
}

// Master 교과목 수정 요청 DTO
export class CourseMasterUpdate {
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
    description: '교과목 영문명',
    example: 'IoT Fundamentals',
    required: false,
  })
  @IsOptional()
  @IsString()
  englishName?: string;

  @ApiProperty({
    description: '교과목 설명',
    example:
      'This course provides an introduction to IoT concepts and applications.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description: string;

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
    description: '강의유형',
    example: '이론',
    required: false,
  })
  @IsOptional()
  @IsString()
  courseType?: string;
}

// Offering 교과목 수정 요청 DTO
export class CourseOfferingUpdate {
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
    description: '분반',
    example: '01',
    required: false,
  })
  @IsOptional()
  @IsString()
  section?: string;

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
    description: '강의계획서 URL',
    example: 'https://example.com/syllabus.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  syllabusUrl?: string;
}

// 교과목 응답 DTO
export class CourseMasterResponse {
  @ApiProperty({
    description: '교과목 ID',
    example: 'uuid-1234-5678-9012',
  })
  id: string;

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
  englishName: string;

  @ApiProperty({
    description: '교과목 설명',
    example:
      'This course provides an introduction to IoT concepts and applications.',
    required: false,
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: '학년',
    example: '1학년',
    required: false,
  })
  grade: string;

  @ApiProperty({
    description: '학점',
    example: 3.0,
    required: false,
  })
  credit: number;

  @ApiProperty({
    description: '강의유형',
    example: '이론',
    required: false,
  })
  courseType?: string;
}

// 교과목 offering 응답 DTO
export class CourseOfferingResponse extends CourseMasterResponse {
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
    description: '분반',
    example: '01',
    required: false,
  })
  section?: string;

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

// 교과목 일괄 등록 요청 DTO
export class CourseBulkInitMasterRequest {
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
    type: [CourseMasterCreate],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseMasterCreate)
  courses: CourseMasterCreate[];
}

// 교과목 일괄 등록 요청 DTO
export class CourseBulkInitOfferingRequest {
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
    type: [CourseOfferingCreate],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CourseOfferingCreate)
  courses: CourseOfferingCreate[];
}

// 교과목 일괄 등록 결과 DTO
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
