import { Test, TestingModule } from '@nestjs/testing';
import { HeaderAssetController } from '@/header-asset/controllers/header-asset.controller';
import { HeaderAssetService } from '@/header-asset/services/header-asset.service';
import { AdminGuard } from '@/auth/guards/admin.guard';

describe('HeaderAssetController', () => {
  let controller: HeaderAssetController;
  let service: jest.Mocked<HeaderAssetService>;

  const mockHeaderAssetService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HeaderAssetController],
      providers: [
        {
          provide: HeaderAssetService,
          useValue: mockHeaderAssetService,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<HeaderAssetController>(HeaderAssetController);
    service = module.get(HeaderAssetService);
    jest.clearAllMocks();
  });

  describe('getHeaderAssets', () => {
    it('should return paged header assets list', async () => {
      const query = { page: 1, size: 10 };
      const result = { items: [], meta: { page: 1, size: 10, totalElements: 0, totalPages: 0 } };
      service.findAll.mockResolvedValue(result);

      expect(await controller.getHeaderAssets(query)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('getHeaderAsset', () => {
    it('should return header asset by id', async () => {
      const id = '1';
      const result = { id: '1', title: 'Test Asset', imageUrl: '/test.jpg', linkUrl: '/', createdAt: new Date(), isActive: true };
      service.findOne.mockResolvedValue(result);

      expect(await controller.getHeaderAsset(id)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('createHeaderAsset', () => {
    it('should create new header asset', async () => {
      const createDto = { title: 'Test Asset', imageUrl: '/test.jpg', linkUrl: '/', createdAt: new Date(), isActive: true };
      const req = { user: { id: 'user1' } };
      const result = { id: '1', ...createDto };
      service.create.mockResolvedValue(result);

      expect(await controller.createHeaderAsset(createDto, req)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createDto, 'user1');
    });
  });

  describe('updateHeaderAsset', () => {
    it('should update header asset', async () => {
      const id = '1';
      const updateDto = { title: 'Updated Asset' };
      const result = { id, title: 'Updated Asset', imageUrl: '/test.jpg', linkUrl: '/', createdAt: new Date(), isActive: true };
      service.update.mockResolvedValue(result);

      expect(await controller.updateHeaderAsset(id, updateDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });
  });

  describe('deleteHeaderAsset', () => {
    it('should delete header asset', async () => {
      const id = '1';
      service.delete.mockResolvedValue(undefined);

      await controller.deleteHeaderAsset(id);
      expect(service.delete).toHaveBeenCalledWith(id);
    });
  });
});
