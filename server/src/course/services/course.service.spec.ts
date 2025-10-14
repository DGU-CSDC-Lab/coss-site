import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { CourseService } from '@/course/services/course.service';
import { Course } from '@/course/entities';
import { CommonException, CourseException } from '@/common/exceptions';
import { PagedResponse } from '@/common/dto/response.dto';

describe('CourseService', () => {
  let service: CourseService;
  let courseRepository: jest.Mocked<Repository<Course>>;

  const mockCourse = {
    id: 'course-1',
    year: 2024,
    semester: '1학기',
    department: 'Computer Science',
    code: 'CS101',
    name: 'Introduction to Programming',
    englishName: 'Introduction to Programming',
    grade: '1학년',
    credit: 3,
    time: '월1,2 수3,4',
    instructor: 'Dr. Kim',
    classroom: 'IT Building 301',
    courseType: '전공필수',
    syllabusUrl: 'https://example.com/syllabus.pdf',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Course),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    courseRepository = module.get(getRepositoryToken(Course));

    jest.clearAllMocks();
    
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('findAll', () => {
    it('should return paginated courses successfully', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockCourse], 1]),
      };

      courseRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 1, size: 20 });

      expect(result).toBeInstanceOf(PagedResponse);
      expect(result.items).toHaveLength(1);
      expect(result.meta.totalElements).toBe(1);
    });

    it('should throw CommonException when database error occurs', async () => {
      courseRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findAll({})).rejects.toThrow(CommonException);
    });
  });

  describe('findOne', () => {
    it('should return course by id successfully', async () => {
      courseRepository.findOne.mockResolvedValue(mockCourse);

      const result = await service.findOne('course-1');

      expect(result.id).toBe('course-1');
      expect(result.subjectName).toBe('Introduction to Programming');
    });

    it('should throw CourseException when course not found', async () => {
      courseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow('Course not found');
    });

    it('should throw CommonException when database error occurs', async () => {
      courseRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('course-1')).rejects.toThrow(CommonException);
    });
  });

  describe('create', () => {
    it('should create course successfully', async () => {
      const createDto = {
        year: 2024,
        semester: '1학기',
        department: 'Computer Science',
        courseCode: 'CS101',
        subjectName: 'Introduction to Programming',
      };

      courseRepository.create.mockReturnValue(mockCourse);
      courseRepository.save.mockResolvedValue(mockCourse);

      const result = await service.create(createDto);

      expect(result.id).toBe('course-1');
    });

    it('should throw CommonException when database error occurs', async () => {
      const createDto = {
        year: 2024,
        semester: '1학기',
        department: 'Computer Science',
        courseCode: 'CS101',
        subjectName: 'Introduction to Programming',
      };

      courseRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createDto)).rejects.toThrow(CommonException);
    });
  });

  describe('update', () => {
    it('should update course successfully', async () => {
      const updateDto = {
        subjectName: 'Advanced Programming',
      };

      courseRepository.findOne.mockResolvedValue(mockCourse);
      courseRepository.save.mockResolvedValue({ ...mockCourse, name: 'Advanced Programming' } as any);

      const result = await service.update('course-1', updateDto);

      expect(result.subjectName).toBe('Advanced Programming');
    });

    it('should throw CourseException when course not found', async () => {
      courseRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow('Course not found');
    });

    it('should throw CommonException when database error occurs', async () => {
      courseRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.update('course-1', {})).rejects.toThrow(CommonException);
    });
  });

  describe('delete', () => {
    it('should delete course successfully', async () => {
      courseRepository.findOne.mockResolvedValue(mockCourse);
      courseRepository.remove.mockResolvedValue(mockCourse);

      await service.delete('course-1');

      expect(courseRepository.remove).toHaveBeenCalledWith(mockCourse);
    });

    it('should throw CourseException when course not found', async () => {
      courseRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow('Course not found');
    });

    it('should throw CommonException when database error occurs', async () => {
      courseRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('course-1')).rejects.toThrow(CommonException);
    });
  });

  describe('bulkInit', () => {
    it('should bulk initialize courses successfully', async () => {
      const courses = [
        {
          year: 2024,
          semester: '1학기',
          department: 'Computer Science',
          courseCode: 'CS101',
          subjectName: 'Programming 1',
          grade: '1학년',
          credit: 3,
        },
      ];

      courseRepository.delete.mockResolvedValue({ affected: 5 } as any);
      courseRepository.create.mockReturnValue(mockCourse);
      courseRepository.save.mockResolvedValue(mockCourse);

      const result = await service.bulkInit(2024, '1학기', courses);

      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(0);
    });

    it('should throw CommonException when database error occurs', async () => {
      const courses = [
        {
          year: 2024,
          semester: '1학기',
          department: 'Computer Science',
          courseCode: 'CS101',
          subjectName: 'Programming 1',
          grade: '1학년',
          credit: 3,
        },
      ];

      courseRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.bulkInit(2024, '1학기', courses)).rejects.toThrow(CommonException);
    });
  });

  describe('uploadFromFile', () => {
    it('should upload courses from CSV file successfully', async () => {
      const csvContent = 'year,semester,department,code,name\n2024,1학기,Computer Science,CS101,Programming';
      const buffer = Buffer.from(csvContent, 'utf-8');

      courseRepository.create.mockReturnValue(mockCourse);
      courseRepository.save.mockResolvedValue(mockCourse);

      const result = await service.uploadFromFile(buffer, 'courses.csv');

      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(0);
    });

    it('should throw CourseException for non-CSV files', async () => {
      const buffer = Buffer.from('test', 'utf-8');

      await expect(service.uploadFromFile(buffer, 'courses.txt')).rejects.toThrow('CSV 형식의 파일만 업로드할 수 있습니다');
    });

    it('should throw CourseException for invalid CSV format', async () => {
      const csvContent = 'header only';
      const buffer = Buffer.from(csvContent, 'utf-8');

      await expect(service.uploadFromFile(buffer, 'courses.csv')).rejects.toThrow('헤더 행이 하나 이상이어야 합니다');
    });

    it('should handle errors during CSV processing', async () => {
      const csvContent = 'year,semester,department,code,name\n2024,1학기,Computer Science,CS101,Programming';
      const buffer = Buffer.from(csvContent, 'utf-8');

      courseRepository.create.mockReturnValue(mockCourse);
      courseRepository.save.mockRejectedValue(new Error('Database error'));

      const result = await service.uploadFromFile(buffer, 'courses.csv');

      expect(result.successCount).toBe(0);
      expect(result.failureCount).toBe(1);
      expect(result.errors[0]).toContain('Database error');
    });
  });

  describe('toResponse (private method testing through public methods)', () => {
    it('should convert course entity to response DTO correctly', async () => {
      const freshMockCourse = {
        id: 'course-1',
        year: 2024,
        semester: '1학기',
        department: 'Computer Science',
        code: 'CS101',
        name: 'Introduction to Programming',
        englishName: 'Introduction to Programming',
        grade: '1학년',
        credit: 3,
        time: '월1,2 수3,4',
        instructor: 'Dr. Kim',
        classroom: 'IT Building 301',
        courseType: '전공필수',
        syllabusUrl: 'https://example.com/syllabus.pdf',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      } as any;
      
      courseRepository.findOne.mockResolvedValue(freshMockCourse);

      const result = await service.findOne('course-1');

      expect(result).toEqual({
        id: 'course-1',
        year: 2024,
        semester: '1학기',
        department: 'Computer Science',
        courseCode: 'CS101',
        subjectName: 'Introduction to Programming',
        englishName: 'Introduction to Programming',
        grade: '1학년',
        credit: 3,
        classTime: '월1,2 수3,4',
        instructor: 'Dr. Kim',
        classroom: 'IT Building 301',
        courseType: '전공필수',
        syllabusUrl: 'https://example.com/syllabus.pdf',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      });
    });
  });
});
