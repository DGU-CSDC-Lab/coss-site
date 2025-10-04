import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities';
import { CourseUploadDto, CourseUploadResult } from '../dto/course-upload.dto';
import * as XLSX from 'xlsx';

@Injectable()
export class CourseUploadService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async uploadFromExcel(
    file: Express.Multer.File,
    uploadDto: CourseUploadDto,
  ): Promise<CourseUploadResult> {
    if (!file) {
      throw new BadRequestException('Excel 파일이 필요합니다');
    }

    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      throw new BadRequestException('Excel 파일만 업로드 가능합니다');
    }

    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (jsonData.length === 0) {
        throw new BadRequestException('Excel 파일에 데이터가 없습니다');
      }

      const result: CourseUploadResult = {
        successCount: 0,
        errorCount: 0,
        errors: [],
        totalCount: jsonData.length,
      };

      // 기존 데이터 삭제 (같은 연도, 학기)
      await this.courseRepository.delete({
        year: uploadDto.year,
        semester: uploadDto.semester,
      });

      for (let i = 0; i < jsonData.length; i++) {
        const rowIndex = i + 2;
        const row = jsonData[i] as any;

        try {
          const courseData = this.parseRowData(row, uploadDto);

          if (!courseData.code || !courseData.name) {
            result.errors.push(
              `${rowIndex}행: 학수강좌번호와 교과목명은 필수입니다`,
            );
            result.errorCount++;
            continue;
          }

          const course = this.courseRepository.create(courseData);
          await this.courseRepository.save(course);
          result.successCount++;
        } catch (error) {
          result.errors.push(`${rowIndex}행: ${error.message}`);
          result.errorCount++;
        }
      }

      return result;
    } catch (error) {
      throw new BadRequestException(
        `Excel 파일 처리 중 오류: ${error.message}`,
      );
    }
  }

  private parseRowData(row: any, uploadDto: CourseUploadDto): Partial<Course> {
    return {
      year: uploadDto.year,
      semester: uploadDto.semester,
      code: this.getFieldValue(row, ['학수강좌번호', '과목코드', 'code']) || '',
      name: this.getFieldValue(row, ['교과목명', '과목명', 'name']) || '',
      englishName: this.getFieldValue(row, ['교과목영문명', 'englishName']),
      department:
        this.getFieldValue(row, ['개설학과', '학과', 'department']) || '',
      grade: this.parseGrade(
        this.getFieldValue(row, ['대상학년', '학년', 'grade']),
      ),
      credit: this.parseCredit(this.getFieldValue(row, ['학점', 'credit'])),
      time: this.parseTime(
        this.getFieldValue(row, ['요일/교시', '시간', 'time']),
      ),
      instructor: this.getFieldValue(row, ['담당교원', '교수', 'instructor']),
      classroom: this.parseClassroom(
        this.getFieldValue(row, ['강의실', 'classroom']),
      ),
      courseType: this.getFieldValue(row, ['강의유형', '유형', 'courseType']),
      syllabusUrl: this.getFieldValue(row, ['강의계획서', 'syllabusUrl']),
    };
  }

  private getFieldValue(row: any, possibleKeys: string[]): any {
    for (const key of possibleKeys) {
      if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
        return String(row[key]).trim();
      }
    }
    return null;
  }

  private parseGrade(value: any): string | undefined {
    if (!value) return undefined;
    const str = String(value).trim();
    // "1학년", "2학년", "3,4학년" 등의 형태를 그대로 유지
    return str || undefined;
  }

  private parseCredit(value: any): number | undefined {
    if (!value) return undefined;
    const num = parseFloat(String(value));
    return isNaN(num) ? undefined : num;
  }

  private parseTime(value: any): string | undefined {
    if (!value) return undefined;
    let timeStr = String(value).trim();

    // 시간 형태 정규화
    timeStr = timeStr
      .replace(/(\d+)교시\((\d{2}:\d{2})\)/g, '$2') // "1교시(09:00)" → "09:00"
      .replace(/~/g, '-') // "~" → "-"
      .replace(/\s+/g, ' '); // 여러 공백을 하나로

    return timeStr || undefined;
  }

  private parseClassroom(value: any): string | undefined {
    if (!value) return undefined;
    const classroom = String(value).trim();

    // 강의실 정보에서 핵심 정보만 추출
    const match = classroom.match(/^([A-Z]?\d+)/);
    if (match) {
      return match[1];
    }

    return classroom || undefined;
  }

  async getExcelTemplate(): Promise<Buffer> {
    const templateData = [
      [
        '학수강좌번호',
        '교과목명',
        '교과목영문명',
        '개설학과',
        '대상학년',
        '학점',
        '요일/교시',
        '담당교원',
        '강의실',
        '강의유형',
      ],
      [
        'IOT101-01',
        'IoT 기초',
        'IoT Fundamentals',
        '지능IoT학과',
        '1학년',
        3.0,
        '월 09:00-12:00',
        '김교수',
        'A101',
        '이론',
      ],
      [
        'IOT201-01',
        '데이터구조',
        'Data Structure',
        '지능IoT학과',
        '2학년',
        3.0,
        '화 13:00-16:00',
        '이교수',
        'A102',
        '이론',
      ],
      [
        'IOT301-01',
        'IoT시스템설계',
        'IoT System Design',
        '지능IoT학과',
        '3학년',
        3.0,
        '수 09:00-12:00',
        '박교수',
        'A103',
        '실습',
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '교육과정');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
