import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { FacultyMember } from '../entities';

describe('FacultyService', () => {
  let service: FacultyService;

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
        FacultyService,
        {
          provide: getRepositoryToken(FacultyMember),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<FacultyService>(FacultyService);
    repository = module.get<Repository<FacultyMember>>(
      getRepositoryToken(FacultyMember),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated faculty members', async () => {
      const mockFaculty = [
        {
          id: '1',
          name: 'Dr. John Doe',
          jobTitle: 'Professor',
          email: 'john@iot.ac.kr',
          department: 'IoT Engineering',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockFaculty, 1]);

      const result = await service.findAll({ page: 1, size: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe('Dr. John Doe');
      expect(result.meta.totalElements).toBe(1);
    });

    it('should filter by name', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ name: 'John', page: 1, size: 20 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'faculty.name LIKE :name',
        { name: '%John%' },
      );
    });

    it('should filter by department', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ department: 'IoT', page: 1, size: 20 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'faculty.department LIKE :department',
        { department: '%IoT%' },
      );
    });
  });

  describe('findOne', () => {
    it('should return faculty member by id', async () => {
      const mockFaculty = {
        id: '1',
        name: 'Dr. John Doe',
        jobTitle: 'Professor',
        email: 'john@iot.ac.kr',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockFaculty);

      const result = await service.findOne('1');

      expect(result.name).toBe('Dr. John Doe');
    });

    it('should throw NotFoundException when faculty not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create new faculty member', async () => {
      const createDto = {
        name: 'Dr. Jane Smith',
        jobTitle: 'Associate Professor',
        email: 'jane@iot.ac.kr',
        department: 'IoT Engineering',
      };

      const mockFaculty = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null); // No existing faculty
      mockRepository.create.mockReturnValue(mockFaculty);
      mockRepository.save.mockResolvedValue(mockFaculty);

      const result = await service.create(createDto);

      expect(result.name).toBe('Dr. Jane Smith');
    });

    it('should throw ConflictException when faculty already exists', async () => {
      const createDto = {
        name: 'Dr. John Doe',
        email: 'john@iot.ac.kr',
      };

      const existingFaculty = {
        id: '1',
        name: 'Dr. John Doe',
        email: 'john@iot.ac.kr',
      };
      mockRepository.findOne.mockResolvedValue(existingFaculty);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update existing faculty member', async () => {
      const updateDto = {
        jobTitle: 'Full Professor',
        department: 'Advanced IoT',
      };

      const mockFaculty = {
        id: '1',
        name: 'Dr. John Doe',
        jobTitle: 'Associate Professor',
        email: 'john@iot.ac.kr',
        department: 'IoT Engineering',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockFaculty);
      mockRepository.save.mockResolvedValue({ ...mockFaculty, ...updateDto });

      const result = await service.update('1', updateDto);

      expect(result.jobTitle).toBe('Full Professor');
    });

    it('should throw NotFoundException when updating non-existent faculty', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete faculty member', async () => {
      const mockFaculty = { id: '1', name: 'Dr. John Doe' };
      mockRepository.findOne.mockResolvedValue(mockFaculty);

      await service.delete('1');

      expect(mockRepository.remove).toHaveBeenCalledWith(mockFaculty);
    });

    it('should throw NotFoundException when deleting non-existent faculty', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
