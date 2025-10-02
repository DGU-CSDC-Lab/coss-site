import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CourseService } from './course.service';
import { Course } from '../entities';

describe('CourseService', () => {
  let service: CourseService;
  let repository: Repository<Course>;

  const mockQueryBuilder = {
    andWhere: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn(),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    repository = module.get<Repository<Course>>(getRepositoryToken(Course));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated courses', async () => {
      const mockCourses = [
        {
          id: '1',
          year: 2024,
          semester: '1학기',
          department: 'IoT Engineering',
          code: 'IOT101',
          name: 'Introduction to IoT',
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockCourses, 1]);

      const result = await service.findAll({ page: 1, size: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].subjectName).toBe('Introduction to IoT');
      expect(result.meta.totalElements).toBe(1);
    });

    it('should filter by year', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ year: 2024, page: 1, size: 20 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.year = :year', { year: 2024 });
    });

    it('should filter by semester', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ semester: '1학기', page: 1, size: 20 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('course.semester = :semester', { semester: '1학기' });
    });
  });

  describe('findOne', () => {
    it('should return course by id', async () => {
      const mockCourse = {
        id: '1',
        year: 2024,
        semester: '1학기',
        code: 'IOT101',
        name: 'Introduction to IoT',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockCourse);

      const result = await service.findOne('1');

      expect(result.subjectName).toBe('Introduction to IoT');
    });

    it('should throw NotFoundException when course not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create new course', async () => {
      const createDto = {
        year: 2024,
        semester: '1학기',
        department: 'IoT Engineering',
        courseCode: 'IOT101',
        subjectName: 'Introduction to IoT',
        grade: '1학년',
        credit: 3
      };

      const mockCourse = {
        id: '1',
        year: createDto.year,
        semester: createDto.semester,
        department: createDto.department,
        code: createDto.courseCode,
        name: createDto.subjectName,
        grade: createDto.grade,
        credit: createDto.credit,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockCourse);
      mockRepository.save.mockResolvedValue(mockCourse);

      const result = await service.create(createDto);

      expect(result.subjectName).toBe('Introduction to IoT');
    });
  });

  describe('update', () => {
    it('should update existing course', async () => {
      const updateDto = {
        subjectName: 'Advanced IoT',
        credit: 4
      };

      const mockCourse = {
        id: '1',
        year: 2024,
        semester: '1학기',
        code: 'IOT101',
        name: 'Introduction to IoT',
        credit: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockCourse);
      mockRepository.save.mockResolvedValue({ ...mockCourse, name: updateDto.subjectName, credit: updateDto.credit });

      const result = await service.update('1', updateDto);

      expect(result.subjectName).toBe('Advanced IoT');
    });

    it('should throw NotFoundException when updating non-existent course', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', { subjectName: 'Updated' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete course', async () => {
      const mockCourse = { id: '1', name: 'Introduction to IoT' };
      mockRepository.findOne.mockResolvedValue(mockCourse);

      await service.delete('1');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockCourse);
    });

    it('should throw NotFoundException when deleting non-existent course', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadFromFile', () => {
    it('should upload courses from CSV file', async () => {
      const csvContent = 'year,semester,department,courseCode,subjectName\n2024,1학기,IoT Engineering,IOT101,Introduction to IoT';
      const fileBuffer = Buffer.from(csvContent, 'utf-8');

      const mockCourse = {
        id: '1',
        year: 2024,
        semester: '1학기',
        department: 'IoT Engineering',
        code: 'IOT101',
        name: 'Introduction to IoT',
      };

      mockRepository.create.mockReturnValue(mockCourse);
      mockRepository.save.mockResolvedValue(mockCourse);

      const result = await service.uploadFromFile(fileBuffer, 'courses.csv');

      expect(result.successCount).toBe(1);
      expect(result.failureCount).toBe(0);
    });

    it('should throw BadRequestException for unsupported file type', async () => {
      const fileBuffer = Buffer.from('test', 'utf-8');

      await expect(service.uploadFromFile(fileBuffer, 'courses.txt')).rejects.toThrow(BadRequestException);
    });

    it('should handle errors for invalid data', async () => {
      const csvContent = 'year,semester\n2024,1학기';
      const fileBuffer = Buffer.from(csvContent, 'utf-8');

      const result = await service.uploadFromFile(fileBuffer, 'courses.csv');
      
      expect(result.failureCount).toBeGreaterThan(0);
    });
  });
});
