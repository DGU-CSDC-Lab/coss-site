import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from '@/course/controllers/course.controller';
import { CourseService } from '@/course/services/course.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { PagedResponse } from '@/common/dto/response.dto';

describe('CourseController', () => {
  let controller: CourseController;
  let courseService: jest.Mocked<CourseService>;

  const mockCourseResponse = {
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
  };

  const mockPagedResponse = new PagedResponse([mockCourseResponse], 1, 20, 1);

  const mockUploadResult = {
    successCount: 1,
    failureCount: 0,
    errors: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        {
          provide: CourseService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            bulkInit: jest.fn(),
            uploadFromFile: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CourseController>(CourseController);
    courseService = module.get(CourseService);
  });

  describe('getCourses', () => {
    it('should return paginated courses', async () => {
      courseService.findAll.mockResolvedValue(mockPagedResponse);

      const result = await controller.getCourses({ page: 1, size: 20 });

      expect(result).toBe(mockPagedResponse);
      expect(courseService.findAll).toHaveBeenCalledWith({ page: 1, size: 20 });
    });
  });

  describe('getCourse', () => {
    it('should return course by id', async () => {
      courseService.findOne.mockResolvedValue(mockCourseResponse);

      const result = await controller.getCourse('course-1');

      expect(result).toBe(mockCourseResponse);
      expect(courseService.findOne).toHaveBeenCalledWith('course-1');
    });
  });

  describe('createCourse', () => {
    it('should create course', async () => {
      const createDto = {
        year: 2024,
        semester: '1학기',
        department: 'Computer Science',
        courseCode: 'CS101',
        subjectName: 'Introduction to Programming',
      };

      courseService.create.mockResolvedValue(mockCourseResponse);

      const result = await controller.createCourse(createDto);

      expect(result).toBe(mockCourseResponse);
      expect(courseService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateCourse', () => {
    it('should update course', async () => {
      const updateDto = {
        subjectName: 'Advanced Programming',
      };

      courseService.update.mockResolvedValue(mockCourseResponse);

      const result = await controller.updateCourse('course-1', updateDto);

      expect(result).toBe(mockCourseResponse);
      expect(courseService.update).toHaveBeenCalledWith('course-1', updateDto);
    });
  });

  describe('deleteCourse', () => {
    it('should delete course', async () => {
      courseService.delete.mockResolvedValue();

      await controller.deleteCourse('course-1');

      expect(courseService.delete).toHaveBeenCalledWith('course-1');
    });
  });

  describe('bulkInitCourses', () => {
    it('should bulk initialize courses', async () => {
      const request = {
        year: 2024,
        semester: '1학기',
        courses: [
          {
            year: 2024,
            semester: '1학기',
            department: 'Computer Science',
            courseCode: 'CS101',
            subjectName: 'Programming 1',
          },
        ],
      };

      courseService.bulkInit.mockResolvedValue(mockUploadResult);

      const result = await controller.bulkInitCourses(request);

      expect(result).toBe(mockUploadResult);
      expect(courseService.bulkInit).toHaveBeenCalledWith(2024, '1학기', request.courses);
    });
  });

  describe('uploadCourses', () => {
    it('should upload courses from file', async () => {
      const mockFile = {
        buffer: Buffer.from('test csv content'),
        originalname: 'courses.csv',
      } as Express.Multer.File;

      courseService.uploadFromFile.mockResolvedValue(mockUploadResult);

      const result = await controller.uploadCourses(mockFile);

      expect(result).toBe(mockUploadResult);
      expect(courseService.uploadFromFile).toHaveBeenCalledWith(mockFile.buffer, mockFile.originalname);
    });
  });
});
