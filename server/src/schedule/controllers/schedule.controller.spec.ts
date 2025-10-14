import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from '@/schedule/controllers/schedule.controller';
import { ScheduleService } from '@/schedule/services/schedule.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { ScheduleCategory } from '@/schedule/entities';
import { PagedResponse } from '@/common/dto/response.dto';

describe('ScheduleController', () => {
  let controller: ScheduleController;
  let scheduleService: jest.Mocked<ScheduleService>;

  const mockScheduleResponse = {
    id: 'schedule-1',
    title: '중간고사',
    description: '2024년 1학기 중간고사',
    startDate: new Date('2024-04-15'),
    endDate: new Date('2024-04-19'),
    location: '각 강의실',
    category: ScheduleCategory.ACADEMIC,
  };

  const mockPagedResponse = new PagedResponse([mockScheduleResponse], 1, 10, 1);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        {
          provide: ScheduleService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ScheduleController>(ScheduleController);
    scheduleService = module.get(ScheduleService);
  });

  describe('getSchedules', () => {
    it('should return paginated schedules', async () => {
      scheduleService.findAll.mockResolvedValue(mockPagedResponse);

      const result = await controller.getSchedules({ page: 1, size: 10 });

      expect(result).toBe(mockPagedResponse);
      expect(scheduleService.findAll).toHaveBeenCalledWith({ page: 1, size: 10 });
    });
  });

  describe('getSchedule', () => {
    it('should return schedule by id', async () => {
      scheduleService.findOne.mockResolvedValue(mockScheduleResponse);

      const result = await controller.getSchedule('schedule-1');

      expect(result).toBe(mockScheduleResponse);
      expect(scheduleService.findOne).toHaveBeenCalledWith('schedule-1');
    });
  });

  describe('createSchedule', () => {
    it('should create schedule', async () => {
      const createDto = {
        title: '새로운 일정',
        description: '새로운 학사일정입니다',
        startDate: '2024-05-01',
        endDate: '2024-05-03',
        location: '강의실 101',
        category: ScheduleCategory.EVENT,
      };
      const mockRequest = { user: { id: 'user-1' } };

      scheduleService.create.mockResolvedValue(mockScheduleResponse);

      const result = await controller.createSchedule(createDto, mockRequest);

      expect(result).toBe(mockScheduleResponse);
      expect(scheduleService.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('updateSchedule', () => {
    it('should update schedule', async () => {
      const updateDto = {
        title: '수정된 일정',
        description: '수정된 설명',
      };

      scheduleService.update.mockResolvedValue(mockScheduleResponse);

      const result = await controller.updateSchedule('schedule-1', updateDto);

      expect(result).toBe(mockScheduleResponse);
      expect(scheduleService.update).toHaveBeenCalledWith('schedule-1', updateDto);
    });
  });

  describe('deleteSchedule', () => {
    it('should delete schedule', async () => {
      scheduleService.delete.mockResolvedValue();

      await controller.deleteSchedule('schedule-1');

      expect(scheduleService.delete).toHaveBeenCalledWith('schedule-1');
    });
  });
});
