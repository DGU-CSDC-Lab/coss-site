import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities';
import {
  CourseCreate,
  CourseUpdate,
  CourseResponse,
  CourseQuery,
  CourseUploadResult,
} from '../dto/course.dto';
import { PagedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async findAll(query: CourseQuery): Promise<PagedResponse<CourseResponse>> {
    const {
      year,
      semester,
      department,
      name,
      code,
      grade,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      page = 1,
      size = 20,
    } = query;

    const queryBuilder = this.courseRepository.createQueryBuilder('course');

    // 필터링
    if (year) queryBuilder.andWhere('course.year = :year', { year });
    if (semester)
      queryBuilder.andWhere('course.semester = :semester', { semester });
    if (department)
      queryBuilder.andWhere('course.department LIKE :department', {
        department: `%${department}%`,
      });
    if (name)
      queryBuilder.andWhere('course.name LIKE :name', { name: `%${name}%` });
    if (code)
      queryBuilder.andWhere('course.code LIKE :code', { code: `%${code}%` });
    if (grade)
      queryBuilder.andWhere('course.grade LIKE :grade', {
        grade: `%${grade}%`,
      });

    // 정렬
    const sortField = this.getSortField(sortBy);
    queryBuilder.orderBy(sortField, sortOrder);

    const [courses, totalElements] = await queryBuilder
      .skip((page - 1) * size)
      .take(size)
      .getManyAndCount();

    const items = courses.map(this.toResponse);
    return new PagedResponse(items, page, size, totalElements);
  }

  private getSortField(sortBy: string): string {
    const fieldMap: { [key: string]: string } = {
      name: 'course.name',
      code: 'course.code',
      department: 'course.department',
      grade: 'course.grade',
      credit: 'course.credit',
      createdAt: 'course.createdAt',
    };
    return fieldMap[sortBy] || 'course.createdAt';
  }

  async findOne(id: string): Promise<CourseResponse> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return this.toResponse(course);
  }

  async create(createDto: CourseCreate): Promise<CourseResponse> {
    const course = this.courseRepository.create({
      year: createDto.year,
      semester: createDto.semester,
      department: createDto.department,
      code: createDto.courseCode,
      name: createDto.subjectName,
      englishName: createDto.englishName,
      grade: createDto.grade,
      credit: createDto.credit,
      time: createDto.classTime,
      instructor: createDto.instructor,
      classroom: createDto.classroom,
      courseType: createDto.courseType,
      syllabusUrl: createDto.syllabusUrl,
    });

    const saved = await this.courseRepository.save(course);
    return this.toResponse(saved);
  }

  async update(id: string, updateDto: CourseUpdate): Promise<CourseResponse> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    Object.assign(course, {
      year: updateDto.year ?? course.year,
      semester: updateDto.semester ?? course.semester,
      department: updateDto.department ?? course.department,
      code: updateDto.courseCode ?? course.code,
      name: updateDto.subjectName ?? course.name,
      englishName: updateDto.englishName ?? course.englishName,
      grade: updateDto.grade ?? course.grade,
      credit: updateDto.credit ?? course.credit,
      time: updateDto.classTime ?? course.time,
      instructor: updateDto.instructor ?? course.instructor,
      classroom: updateDto.classroom ?? course.classroom,
      courseType: updateDto.courseType ?? course.courseType,
      syllabusUrl: updateDto.syllabusUrl ?? course.syllabusUrl,
    });

    const saved = await this.courseRepository.save(course);
    return this.toResponse(saved);
  }

  async bulkInit(
    year: number,
    semester: string,
    courses: CourseCreate[],
  ): Promise<CourseUploadResult> {
    // 기존 년도/학기 데이터 삭제
    await this.courseRepository.delete({ year, semester });

    let successCount = 0;
    const errors: string[] = [];

    // 새 데이터 추가
    for (let i = 0; i < courses.length; i++) {
      try {
        const courseData = { ...courses[i], year, semester };
        const course = this.courseRepository.create(courseData);
        await this.courseRepository.save(course);
        successCount++;
      } catch (error) {
        errors.push(`${i + 1}번째 교과목: ${error.message}`);
      }
    }

    return {
      successCount,
      failureCount: errors.length,
      errors,
    };
  }

  async delete(id: string): Promise<void> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    await this.courseRepository.remove(course);
  }

  async uploadFromFile(
    buffer: Buffer,
    filename: string,
  ): Promise<CourseUploadResult> {
    if (!filename.endsWith('.csv')) {
      throw new BadRequestException('Only CSV files are supported');
    }

    const csvData = buffer.toString('utf-8');
    const lines = csvData.split('\n').filter(line => line.trim());

    if (lines.length < 2) {
      throw new BadRequestException(
        'CSV file must contain header and at least one data row',
      );
    }

    const errors: string[] = [];
    let successCount = 0;
    let failureCount = 0;

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      try {
        const columns = lines[i].split(',').map(col => col.trim());

        if (columns.length < 4) {
          errors.push(`Row ${i + 1}: Insufficient columns`);
          failureCount++;
          continue;
        }

        const courseData: CourseCreate = {
          year: parseInt(columns[0]) || new Date().getFullYear(),
          semester: columns[1] || '1학기',
          department: columns[2] || '',
          courseCode: columns[3] || '',
          subjectName: columns[4] || '',
          englishName: columns[5] || undefined,
          grade: columns[6] || undefined,
          credit: columns[7] ? parseFloat(columns[7]) : undefined,
          classTime: columns[8] || undefined,
          instructor: columns[9] || undefined,
          classroom: columns[10] || undefined,
          courseType: columns[11] || undefined,
          syllabusUrl: columns[12] || undefined,
        };

        await this.create(courseData);
        successCount++;
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error.message}`);
        failureCount++;
      }
    }

    return {
      successCount,
      failureCount,
      errors,
    };
  }

  private toResponse(course: Course): CourseResponse {
    return {
      id: course.id,
      year: course.year,
      semester: course.semester,
      department: course.department,
      courseCode: course.code,
      subjectName: course.name,
      englishName: course.englishName,
      grade: course.grade,
      credit: course.credit,
      classTime: course.time,
      instructor: course.instructor,
      classroom: course.classroom,
      courseType: course.courseType,
      syllabusUrl: course.syllabusUrl,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
