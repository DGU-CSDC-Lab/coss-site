import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from '../services/schedule.service';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { ScheduleCategory } from '../entities';

describe('ScheduleController', () => {
  let controller: ScheduleController;
  let service: ScheduleService;

  const mockScheduleService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        {
          provide: ScheduleService,
          useValue: mockScheduleService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<ScheduleController>(ScheduleController);
    service = module.get<ScheduleService>(ScheduleService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSchedules', () => {
    it('should return all schedules', async () => {
      const mockSchedules = [
        {
          id: '1',
          title: 'Test Schedule',
          startDate: new Date('2024-01-01'),
          category: ScheduleCategory.ACADEMIC,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      mockScheduleService.findAll.mockResolvedValue(mockSchedules);

      const result = await controller.getSchedules({});

      expect(result).toEqual(mockSchedules);
      expect(mockScheduleService.findAll).toHaveBeenCalledWith({});
    });

    it('should filter by month and category', async () => {
      mockScheduleService.findAll.mockResolvedValue([]);

      await controller.getSchedules({ month: '2024-01', category: ScheduleCategory.ADMISSION });

      expect(mockScheduleService.findAll).toHaveBeenCalledWith({ month: '2024-01', category: ScheduleCategory.ADMISSION });
    });
  });

  describe('getSchedule', () => {
    it('should return schedule by id', async () => {
      const mockSchedule = {
        id: '1',
        title: 'Test Schedule',
        startDate: new Date('2024-01-01'),
        category: ScheduleCategory.ACADEMIC,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockScheduleService.findOne.mockResolvedValue(mockSchedule);

      const result = await controller.getSchedule('1');

      expect(result).toEqual(mockSchedule);
    });
  });

  describe('createSchedule', () => {
    it('should create new schedule', async () => {
      const createDto = {
        title: 'New Schedule',
        startDate: '2024-01-01',
        category: ScheduleCategory.ACADEMIC
      };

      const mockSchedule = {
        id: '1',
        ...createDto,
        startDate: new Date(createDto.startDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockRequest = { user: { id: 'user1' } };

      mockScheduleService.create.mockResolvedValue(mockSchedule);

      const result = await controller.createSchedule(createDto, mockRequest);

      expect(result).toEqual(mockSchedule);
      expect(mockScheduleService.create).toHaveBeenCalledWith(createDto, 'user1');
    });
  });

  describe('updateSchedule', () => {
    it('should update existing schedule', async () => {
      const updateDto = {
        title: 'Updated Schedule'
      };

      const mockSchedule = {
        id: '1',
        title: 'Updated Schedule',
        startDate: new Date('2024-01-01'),
        category: ScheduleCategory.ACADEMIC,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockScheduleService.update.mockResolvedValue(mockSchedule);

      const result = await controller.updateSchedule('1', updateDto);

      expect(result).toEqual(mockSchedule);
    });
  });

  describe('deleteSchedule', () => {
    it('should delete schedule', async () => {
      mockScheduleService.delete.mockResolvedValue(undefined);

      await controller.deleteSchedule('1');

      expect(mockScheduleService.delete).toHaveBeenCalledWith('1');
    });
  });
});
