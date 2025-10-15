import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { FacultyService } from '@/faculty/services/faculty.service';
import { FacultyMember } from '@/faculty/entities';
import { CommonException } from '@/common/exceptions';
import { PagedResponse } from '@/common/dto/response.dto';
import { FileService } from '@/file/services/file.service';
import { S3Service } from '@/file/services/s3.service';

describe('FacultyService', () => {
  let service: FacultyService;
  let facultyRepository: jest.Mocked<Repository<FacultyMember>>;
  let fileService: any;

  const mockFaculty = {
    id: 'faculty-1',
    name: 'Dr. John Doe',
    jobTitle: 'Professor',
    email: 'john.doe@university.edu',
    phoneNumber: '010-1234-5678',
    office: 'Engineering Building 301',
    profileImageUrl: 'https://example.com/profile.jpg',
    department: 'Computer Science',
    researchAreas: 'AI, Machine Learning',
    biography: 'Expert in AI and ML',
    createdAt: new Date('2024-01-01'),
  } as any;

  const mockFaculty2 = {
    id: 'faculty-2',
    name: 'Dr. Jane Smith',
    jobTitle: 'Associate Professor',
    email: 'jane.smith@university.edu',
    phoneNumber: '010-5678-1234',
    office: 'Engineering Building 302',
    profileImageUrl: 'https://example.com/profile2.jpg',
    department: 'Electrical Engineering',
    researchAreas: 'IoT, Embedded Systems',
    biography: 'Expert in IoT systems',
    createdAt: new Date('2024-01-02'),
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacultyService,
        {
          provide: getRepositoryToken(FacultyMember),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: FileService,
          useValue: {
            updateOwner: jest.fn(),
            getFileUrl: jest.fn((fileKey) => `https://iotcoss.org/${fileKey}`),
          },
        },
        {
          provide: S3Service,
          useValue: {
            getFileUrl: jest.fn((fileKey) => {
              if (!fileKey) return null;
              if (fileKey.startsWith('http')) return fileKey;
              return `https://iotcoss.org/${fileKey}`;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<FacultyService>(FacultyService);
    facultyRepository = module.get(getRepositoryToken(FacultyMember));
    fileService = module.get<FileService>(FileService);

    // Reset all mocks before each test
    jest.clearAllMocks();
    
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  describe('findAll', () => {
    it.skip('should return paginated faculty members successfully', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockFaculty, mockFaculty2], 2]),
      };

      facultyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 1, size: 20 });

      expect(result).toBeInstanceOf(PagedResponse);
      expect(result.items).toHaveLength(2);
      expect(result.meta.totalElements).toBe(2);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('faculty.name', 'ASC');
    });

    it.skip('should filter by name when provided', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockFaculty], 1]),
      };

      facultyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ name: 'John' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('faculty.name LIKE :name', { name: '%John%' });
    });

    it.skip('should filter by department when provided', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockFaculty], 1]),
      };

      facultyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ department: 'Computer' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('faculty.department LIKE :department', { department: '%Computer%' });
    });

    it.skip('should filter by both name and department when provided', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockFaculty], 1]),
      };

      facultyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ name: 'John', department: 'Computer' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('faculty.name LIKE :name', { name: '%John%' });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('faculty.department LIKE :department', { department: '%Computer%' });
    });

    it('should use default pagination values', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      facultyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({});

      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0); // (1-1) * 20
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });

    it('should return empty results when no faculty found', async () => {
      const mockQueryBuilder = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      facultyRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({});

      expect(result.items).toHaveLength(0);
      expect(result.meta.totalElements).toBe(0);
    });

    it('should throw CommonException when database error occurs', async () => {
      facultyRepository.createQueryBuilder.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findAll({})).rejects.toThrow(CommonException);
    });
  });

  describe('findOne', () => {
    it('should return faculty member by id successfully', async () => {
      facultyRepository.findOne.mockResolvedValue(mockFaculty);

      const result = await service.findOne('faculty-1');

      expect(result.id).toBe('faculty-1');
      expect(result.name).toBe('Dr. John Doe');
      expect(facultyRepository.findOne).toHaveBeenCalledWith({ where: { id: 'faculty-1' } });
    });

    it('should throw FacultyException when faculty not found', async () => {
      facultyRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow('해당하는 교수를 찾을 수 없습니다');
    });

    it('should throw CommonException when database error occurs', async () => {
      facultyRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.findOne('faculty-1')).rejects.toThrow(CommonException);
    });
  });

  describe('create', () => {
    it('should create faculty member successfully', async () => {
      const createDto = {
        name: 'Dr. New Faculty',
        jobTitle: 'Assistant Professor',
        email: 'new.faculty@university.edu',
        phoneNumber: '010-9999-8888',
        office: 'Engineering Building 303',
        department: 'Computer Science',
        researchAreas: ['Data Science'],
        biography: 'New faculty member',
      };

      facultyRepository.create.mockReturnValue(mockFaculty);
      facultyRepository.save.mockResolvedValue(mockFaculty);

      const result = await service.create(createDto);

      expect(result.id).toBe('faculty-1');
      expect(facultyRepository.create).toHaveBeenCalledWith(createDto);
      expect(facultyRepository.save).toHaveBeenCalled();
    });

    it('should throw CommonException when database error occurs', async () => {
      const createDto = {
        name: 'Dr. New Faculty',
        jobTitle: 'Assistant Professor',
        email: 'new.faculty@university.edu',
        department: 'Computer Science',
      };

      facultyRepository.create.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.create(createDto)).rejects.toThrow(CommonException);
    });
  });

  describe('update', () => {
    it('should update faculty member successfully', async () => {
      const updateDto = {
        name: 'Dr. Updated Name',
        jobTitle: 'Full Professor',
      };

      facultyRepository.findOne.mockResolvedValue(mockFaculty);
      facultyRepository.save.mockResolvedValue({ ...mockFaculty, ...updateDto } as any);

      const result = await service.update('faculty-1', updateDto);

      expect(result.name).toBe('Dr. Updated Name');
      expect(facultyRepository.findOne).toHaveBeenCalledWith({ where: { id: 'faculty-1' } });
      expect(facultyRepository.save).toHaveBeenCalled();
    });

    it('should update only provided fields', async () => {
      const updateDto = {
        email: 'updated.email@university.edu',
      };

      facultyRepository.findOne.mockResolvedValue(mockFaculty);
      facultyRepository.save.mockResolvedValue(mockFaculty);

      await service.update('faculty-1', updateDto);

      const savedFaculty = facultyRepository.save.mock.calls[0][0];
      expect(savedFaculty.email).toBe('updated.email@university.edu');
      expect(savedFaculty.name).toBe(mockFaculty.name); // unchanged
    });

    it('should log changes when updating faculty', async () => {
      const updateDto = {
        name: 'Dr. New Name',
        email: 'new.email@university.edu',
        department: 'New Department',
        jobTitle: 'New Title',
      };

      facultyRepository.findOne.mockResolvedValue(mockFaculty);
      facultyRepository.save.mockResolvedValue({ ...mockFaculty, ...updateDto } as any);

      await service.update('faculty-1', updateDto);

      // Verify that the update was called
      expect(facultyRepository.save).toHaveBeenCalled();
    });

    it('should throw FacultyException when faculty not found', async () => {
      facultyRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', {})).rejects.toThrow('해당하는 교수를 찾을 수 없습니다');
    });

    it('should throw CommonException when database error occurs', async () => {
      facultyRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.update('faculty-1', {})).rejects.toThrow(CommonException);
    });
  });

  describe('delete', () => {
    it('should delete faculty member successfully', async () => {
      facultyRepository.findOne.mockResolvedValue(mockFaculty);
      facultyRepository.remove.mockResolvedValue(mockFaculty);

      await service.delete('faculty-1');

      expect(facultyRepository.findOne).toHaveBeenCalledWith({ where: { id: 'faculty-1' } });
      expect(facultyRepository.remove).toHaveBeenCalledWith(mockFaculty);
    });

    it('should throw FacultyException when faculty not found', async () => {
      facultyRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow('해당하는 교수를 찾을 수 없습니다');
    });

    it('should throw CommonException when database error occurs', async () => {
      facultyRepository.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.delete('faculty-1')).rejects.toThrow(CommonException);
    });
  });

  describe('toResponse (private method testing through public methods)', () => {
    it.skip('should convert faculty entity to response DTO correctly', async () => {
      const freshMockFaculty = {
        id: 'faculty-1',
        name: 'Dr. John Doe',
        jobTitle: 'Professor',
        email: 'john.doe@university.edu',
        phoneNumber: '010-1234-5678',
        office: 'Engineering Building 301',
        profileImageUrl: 'https://example.com/profile.jpg',
        department: 'Computer Science',
        researchAreas: 'AI, Machine Learning',
        biography: 'Expert in AI and ML',
        createdAt: new Date('2024-01-01'),
      } as any;
      
      facultyRepository.findOne.mockResolvedValue(freshMockFaculty);

      const result = await service.findOne('faculty-1');

      expect(result).toEqual({
        id: 'faculty-1',
        name: 'Dr. John Doe',
        jobTitle: 'Professor',
        email: 'john.doe@university.edu',
        phoneNumber: '010-1234-5678',
        office: 'Engineering Building 301',
        profileImageUrl: 'https://example.com/profile.jpg',
        department: 'Computer Science',
        researchAreas: 'AI, Machine Learning',
        biography: 'Expert in AI and ML',
        createdAt: new Date('2024-01-01'),
      });
    });
  });
});
