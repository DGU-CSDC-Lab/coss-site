import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileController } from '@/file/controllers/file.controller';
import { FileService } from '@/file/services/file.service';
import { AdminGuard } from '@/auth/guards/admin.guard';
import { User } from '@/auth/entities';
import {
  PresignedUrlRequest,
  PresignedUrlResponse,
  RegisterFileRequest,
  FileInfoResponse,
} from '@/file/dto/file.dto';
import { PagedResponse } from '@/common';
import { File, OwnerType } from '@/file/entities/file.entity';

describe('FileController', () => {
  let controller: FileController;
  let fileService: FileService;

  const mockFileService = {
    generatePresignedUrl: jest.fn(),
    registerFile: jest.fn(),
    getFilesByOwner: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
  };

  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockAdminGuard = {
    canActivate: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileController],
      providers: [
        {
          provide: FileService,
          useValue: mockFileService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    })
      .overrideGuard(AdminGuard)
      .useValue(mockAdminGuard)
      .compile();

    controller = module.get<FileController>(FileController);
    fileService = module.get<FileService>(FileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePresignedUrl', () => {
    it('should generate presigned URL successfully', async () => {
      const request: PresignedUrlRequest = {
        fileName: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        ownerType: OwnerType.POST,
        ownerId: 'post-123',
      };

      const expectedResult: PresignedUrlResponse = {
        uploadUrl: 'https://s3.amazonaws.com/bucket/presigned-url',
        fileKey: 'uploads/test-key.jpg',
        publicUrl: 'https://s3.amazonaws.com/bucket/test-key.jpg',
      };

      const mockRequest = { user: { id: 'user-123' } };
      mockFileService.generatePresignedUrl.mockResolvedValue(expectedResult);

      const result = await controller.generatePresignedUrl(request, mockRequest);

      expect(fileService.generatePresignedUrl).toHaveBeenCalledWith(request, 'user-123');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('registerFile', () => {
    it('should register file successfully', async () => {
      const request: RegisterFileRequest = {
        fileKey: 'uploads/test-key.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        ownerType: OwnerType.POST,
        ownerId: 'post-123',
      };

      const expectedResult: FileInfoResponse = {
        id: 'file-123',
        fileKey: 'uploads/test-key.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        publicUrl: 'https://s3.amazonaws.com/bucket/test-key.jpg',
        ownerType: 'POST',
        ownerId: 'post-123',
        createdById: 'user-123',
      };

      const mockRequest = { user: { id: 'user-123' } };
      mockFileService.registerFile.mockResolvedValue(expectedResult);

      const result = await controller.registerFile(request, mockRequest);

      expect(fileService.registerFile).toHaveBeenCalledWith(request, 'user-123');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getFilesByOwner', () => {
    it('should get files by owner successfully', async () => {
      const ownerType = 'POST';
      const ownerId = 'post-123';

      const expectedResult = new PagedResponse(
        [
          {
            id: 'file-123',
            fileKey: 'uploads/test-key.jpg',
            fileName: 'test.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            publicUrl: 'https://s3.amazonaws.com/bucket/test-key.jpg',
            ownerType: 'POST',
            ownerId: 'post-123',
            createdById: 'user-123',
          },
        ],
        1,
        1,
        1,
      );

      mockFileService.getFilesByOwner.mockResolvedValue(expectedResult);

      const result = await controller.getFilesByOwner(ownerType, ownerId);

      expect(fileService.getFilesByOwner).toHaveBeenCalledWith({
        ownerType: ownerType as any,
        ownerId,
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getFile', () => {
    it('should get file successfully', async () => {
      const fileId = 'file-123';
      const expectedResult = {
        id: 'file-123',
        fileKey: 'uploads/test-key.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        ownerType: OwnerType.POST,
        ownerId: 'post-123',
        createdById: 'user-123',
      } as File;

      mockFileService.getFile.mockResolvedValue(expectedResult);

      const result = await controller.getFile(fileId);

      expect(fileService.getFile).toHaveBeenCalledWith({ fileId });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const fileId = 'file-123';
      mockFileService.deleteFile.mockResolvedValue(undefined);

      const result = await controller.deleteFile(fileId);

      expect(fileService.deleteFile).toHaveBeenCalledWith({ fileId });
      expect(result).toBeUndefined();
    });
  });
});
