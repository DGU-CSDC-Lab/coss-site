import { IsInt, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CourseUploadDto {
  @ApiProperty({
    description: '연도',
    example: 2024,
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(2020)
  @Max(2030)
  year: number;

  @ApiProperty({
    description: '학기',
    example: '1학기',
  })
  @IsString()
  semester: string;
}

export class CourseExcelRow {
  year: number;
  semester: string;
  department: string;
  code: string;
  name: string;
  grade?: string;
  credit?: number;
  time?: string;
  syllabusUrl?: string;
}

export class CourseUploadResult {
  @ApiProperty({
    description: '업로드 성공 건수',
    example: 45,
  })
  successCount: number;

  @ApiProperty({
    description: '업로드 실패 건수',
    example: 2,
  })
  errorCount: number;

  @ApiProperty({
    description: '오류 목록',
    example: ['2행: 과목코드가 누락되었습니다', '5행: 학점은 숫자여야 합니다'],
  })
  errors: string[];

  @ApiProperty({
    description: '전체 처리 건수',
    example: 47,
  })
  totalCount: number;
}
