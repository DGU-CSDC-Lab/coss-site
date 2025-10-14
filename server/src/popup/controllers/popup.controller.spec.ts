import { Test, TestingModule } from '@nestjs/testing';
import { PopupController } from '@/popup/controllers/popup.controller';
import { PopupService } from '@/popup/services/popup.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { PagedResponse } from '@/common/dto/response.dto';

describe('PopupController', () => {
  let controller: PopupController;
  let popupService: jest.Mocked<PopupService>;

  const mockPopupResponse = {
    id: 'popup-1',
    title: '중요 공지사항',
    content: '중요한 공지사항입니다.',
    imageUrl: 'https://example.com/popup.jpg',
    linkUrl: 'https://example.com/notice',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01T10:00:00.000Z'),
    isActive: true,
  };

  const mockPagedResponse = new PagedResponse([mockPopupResponse], 1, 10, 1);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PopupController],
      providers: [
        {
          provide: PopupService,
          useValue: {
            findAll: jest.fn(),
            findActive: jest.fn(),
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

    controller = module.get<PopupController>(PopupController);
    popupService = module.get(PopupService);
  });

  describe('getPopups', () => {
    it('should return paginated popups', async () => {
      popupService.findAll.mockResolvedValue(mockPagedResponse);

      const result = await controller.getPopups({ page: 1, size: 10 });

      expect(result).toBe(mockPagedResponse);
      expect(popupService.findAll).toHaveBeenCalledWith({ page: 1, size: 10 });
    });
  });

  describe('getActivePopups', () => {
    it('should return active popups', async () => {
      popupService.findActive.mockResolvedValue([mockPopupResponse]);

      const result = await controller.getActivePopups();

      expect(result).toEqual([mockPopupResponse]);
      expect(popupService.findActive).toHaveBeenCalled();
    });
  });

  describe('getPopup', () => {
    it('should return popup by id', async () => {
      popupService.findOne.mockResolvedValue(mockPopupResponse);

      const result = await controller.getPopup('popup-1');

      expect(result).toBe(mockPopupResponse);
      expect(popupService.findOne).toHaveBeenCalledWith('popup-1');
    });
  });

  describe('createPopup', () => {
    it('should create popup', async () => {
      const createDto = {
        title: '새로운 팝업',
        content: '새로운 팝업 내용',
        imageUrl: 'https://example.com/new.jpg',
        linkUrl: 'https://example.com/new',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        isActive: true,
        priority: 1,
      };
      const mockRequest = { user: { id: 'user-1' } };

      popupService.create.mockResolvedValue(mockPopupResponse);

      const result = await controller.createPopup(createDto, mockRequest);

      expect(result).toBe(mockPopupResponse);
      expect(popupService.create).toHaveBeenCalledWith(createDto, 'user-1');
    });
  });

  describe('updatePopup', () => {
    it('should update popup', async () => {
      const updateDto = {
        title: '수정된 팝업',
        content: '수정된 내용',
      };

      popupService.update.mockResolvedValue(mockPopupResponse);

      const result = await controller.updatePopup('popup-1', updateDto);

      expect(result).toBe(mockPopupResponse);
      expect(popupService.update).toHaveBeenCalledWith('popup-1', updateDto);
    });
  });

  describe('deletePopup', () => {
    it('should delete popup', async () => {
      popupService.delete.mockResolvedValue();

      await controller.deletePopup('popup-1');

      expect(popupService.delete).toHaveBeenCalledWith('popup-1');
    });
  });
});
