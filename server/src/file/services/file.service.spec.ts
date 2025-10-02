import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FileService } from './file.service';
import { S3Service } from './s3.service';
import { File, OwnerType, FileStatus } from '../entities';

describe('FileService', () => {
  let service: FileService;
  let fileRepository: Repository<File>;
  let s3Service: S3Service;

  const mockFileRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockS3Service = {
    generatePresignedUploadUrl: jest.fn(),
    getFileUrl: jest.fn(),
    deleteObject: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        {
          provide: getRepositoryToken(File),
          useValue: mockFileRepository,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<FileService>(FileService);
    fileRepository = module.get<Repository<File>>(getRepositoryToken(File));
    s3Service = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePresignedUrl', () => {
    it('should generate presigned URL successfully', async () => {
      const request = {
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
        contentType: 'image/jpeg',
        fileSize: 1024,
      };

      const mockFile = {
        id: '1',
        fileKey: 'uploads/test-key.jpg',
        ownerType: OwnerType.POST,
        ownerId: 'temp',
        originalName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        status: FileStatus.PENDING,
        createdById: 'user1',
      };

      mockFileRepository.create.mockReturnValue(mockFile);
      mockFileRepository.save.mockResolvedValue(mockFile);
      mockS3Service.generatePresignedUploadUrl.mockResolvedValue(
        'https://presigned-url',
      );
      mockS3Service.getFileUrl.mockReturnValue('https://file-url');

      const result = await service.generatePresignedUrl(request, 'user1');

      expect(result).toHaveProperty('uploadUrl');
      expect(result).toHaveProperty('fileUrl');
      expect(result).toHaveProperty('fileKey');
      expect(mockFileRepository.create).toHaveBeenCalled();
      expect(mockFileRepository.save).toHaveBeenCalled();
    });

    it('should throw error for unsupported file type', async () => {
      const request = {
        fileName: 'test.exe',
        fileType: 'application/exe',
        contentType: 'application/exe',
      };

      await expect(
        service.generatePresignedUrl(request, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error for file size exceeding limit', async () => {
      const request = {
        fileName: 'test.jpg',
        fileType: 'image/jpeg',
        contentType: 'image/jpeg',
        fileSize: 11 * 1024 * 1024, // 11MB
      };

      await expect(
        service.generatePresignedUrl(request, 'user1'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeUpload', () => {
    it('should complete upload successfully', async () => {
      const request = {
        fileKey: 'uploads/test-key.jpg',
        ownerType: 'POST',
        ownerId: 'post1',
      };

      const mockFile = {
        fileKey: 'uploads/test-key.jpg',
        status: FileStatus.PENDING,
        ownerType: OwnerType.POST,
        ownerId: 'temp',
      };

      mockFileRepository.findOne.mockResolvedValue(mockFile);
      mockFileRepository.save.mockResolvedValue({
        ...mockFile,
        status: FileStatus.ACTIVE,
      });
      mockS3Service.getFileUrl.mockReturnValue('https://file-url');

      const result = await service.completeUpload(request);

      expect(result).toHaveProperty('fileKey');
      expect(result).toHaveProperty('fileUrl');
      expect(mockFileRepository.save).toHaveBeenCalled();
    });

    it('should throw error if file not found', async () => {
      const request = {
        fileKey: 'nonexistent',
      };

      mockFileRepository.findOne.mockResolvedValue(null);

      await expect(service.completeUpload(request)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete file successfully', async () => {
      const mockFile = {
        fileKey: 'uploads/test-key.jpg',
        status: FileStatus.ACTIVE,
      };

      mockFileRepository.findOne.mockResolvedValue(mockFile);
      mockFileRepository.save.mockResolvedValue({
        ...mockFile,
        status: FileStatus.DELETED,
      });
      mockS3Service.deleteObject.mockResolvedValue(undefined);

      await service.deleteFile('uploads/test-key.jpg', 'user1');

      expect(mockFileRepository.save).toHaveBeenCalled();
      expect(mockS3Service.deleteObject).toHaveBeenCalledWith(
        'uploads/test-key.jpg',
      );
    });

    it('should throw error if file not found', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteFile('nonexistent', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getFile', () => {
    it('should get file successfully', async () => {
      const mockFile = {
        fileKey: 'uploads/test-key.jpg',
        status: FileStatus.ACTIVE,
      };

      mockFileRepository.findOne.mockResolvedValue(mockFile);

      const result = await service.getFile('uploads/test-key.jpg');

      expect(result).toEqual(mockFile);
    });

    it('should throw error if file not found', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);

      await expect(service.getFile('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
