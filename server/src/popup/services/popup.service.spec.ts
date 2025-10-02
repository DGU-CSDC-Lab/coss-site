import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PopupService } from './popup.service';
import { Popup } from '../entities';

describe('PopupService', () => {
  let service: PopupService;
  let repository: Repository<Popup>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getCount: jest.fn(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  };

  const mockRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PopupService,
        {
          provide: getRepositoryToken(Popup),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PopupService>(PopupService);
    repository = module.get<Repository<Popup>>(getRepositoryToken(Popup));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all popups', async () => {
      const mockPopups = [
        {
          id: '1',
          title: 'Test Popup',
          content: 'Test content',
          isActive: true,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPopups, 1]);

      const result = await service.findAll({});

      expect(result.items).toHaveLength(1);
      expect(result.items[0].title).toBe('Test Popup');
    });

    it('should filter by active status', async () => {
      mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ isActive: true });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'popup.isActive = :isActive',
        { isActive: true },
      );
    });
  });

  describe('findActive', () => {
    it('should return only active popups within date range', async () => {
      const mockPopups = [
        {
          id: '1',
          title: 'Active Popup',
          content: 'Active content',
          isActive: true,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-12-31'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockPopups);

      const result = await service.findActive();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Active Popup');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'popup.isActive = :active',
        { active: true },
      );
    });
  });

  describe('findOne', () => {
    it('should return popup by id', async () => {
      const mockPopup = {
        id: '1',
        title: 'Test Popup',
        content: 'Test content',
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockPopup);

      const result = await service.findOne('1');

      expect(result.title).toBe('Test Popup');
    });

    it('should throw NotFoundException when popup not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create new popup', async () => {
      const createDto = {
        title: 'New Popup',
        content: 'New content',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
      };

      const mockPopup = {
        id: '1',
        ...createDto,
        startDate: new Date(createDto.startDate),
        endDate: new Date(createDto.endDate),
        createdById: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockPopup);
      mockRepository.save.mockResolvedValue(mockPopup);

      const result = await service.create(createDto, 'user1');

      expect(result.title).toBe('New Popup');
    });
  });

  describe('update', () => {
    it('should update existing popup', async () => {
      const updateDto = {
        title: 'Updated Popup',
        content: 'Updated content',
      };

      const mockPopup = {
        id: '1',
        title: 'Old Popup',
        content: 'Old content',
        isActive: true,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockPopup);
      mockRepository.save.mockResolvedValue({ ...mockPopup, ...updateDto });

      const result = await service.update('1', updateDto);

      expect(result.title).toBe('Updated Popup');
    });

    it('should throw NotFoundException when updating non-existent popup', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { title: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should soft delete popup', async () => {
      const mockPopup = { id: '1', title: 'Test Popup' };
      mockRepository.findOne.mockResolvedValue(mockPopup);

      await service.delete('1');

      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockPopup);
    });

    it('should throw NotFoundException when deleting non-existent popup', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
