import { Test, TestingModule } from '@nestjs/testing';
import { HistoryController } from '@/history/controllers/history.controller';
import { HistoryService } from '@/history/services/history.service';
import { AdminGuard } from '@/auth/guards/admin.guard';

describe('HistoryController', () => {
  let controller: HistoryController;
  let service: jest.Mocked<HistoryService>;

  const mockHistoryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoryController],
      providers: [
        {
          provide: HistoryService,
          useValue: mockHistoryService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<HistoryController>(HistoryController);
    service = module.get(HistoryService);
    jest.clearAllMocks();
  });

  describe('getHistory', () => {
    it('should return paged history list', async () => {
      const query = { page: 1, size: 10 };
      const result = { items: [], meta: { page: 1, size: 10, totalElements: 0, totalPages: 0 } };
      service.findAll.mockResolvedValue(result);

      expect(await controller.getHistory(query)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getHistoryItem', () => {
    it('should return history by id', async () => {
      const id = '1';
      const result = { id: '1', year: 2024, month: 3, title: 'Test', description: 'Test description' };
      service.findOne.mockResolvedValue(result);

      expect(await controller.getHistoryItem(id)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('createHistory', () => {
    it('should create new history', async () => {
      const createDto = { year: 2024, month: 3, title: 'Test', description: 'Test description' };
      const result = { id: '1', ...createDto };
      service.create.mockResolvedValue(result);

      expect(await controller.createHistory(createDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateHistory', () => {
    it('should update history', async () => {
      const id = '1';
      const updateDto = { title: 'Updated' };
      const result = { id, year: 2024, month: 3, title: 'Updated', description: 'Test description' };
      service.update.mockResolvedValue(result);

      expect(await controller.updateHistory(id, updateDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('deleteHistory', () => {
    it('should delete history', async () => {
      const id = '1';
      service.delete.mockResolvedValue(undefined);

      await controller.deleteHistory(id);
      expect(service.delete).toHaveBeenCalledWith(id);
    });
  });
});
