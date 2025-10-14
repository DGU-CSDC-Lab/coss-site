import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileService } from '@/file/services/file.service';
import { S3Service } from '@/file/services/s3.service';
import { File, OwnerType, FileStatus } from '@/file/entities';
import { FileException, DatabaseException } from '@/common/exceptions';
import { PagedResponse } from '@/common';

describe('FileService', () => {
  let service: FileService;
  let fileRepository: any;
  let s3Service: any;

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
    fileRepository = module.get(getRepositoryToken(File));
    s3Service = module.get<S3Service>(S3Service);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePresignedUrl', () => {
    const validRequest = {
      fileName: 'test.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024,
      ownerType: OwnerType.POST,
      ownerId: 'post-1',
    };

    it('should generate presigned URL successfully', async () => {
      const mockFile = {
        id: '1',
        fileKey: 'uploads/123456-uuid.jpg',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
        createdById: 'user1',
        status: FileStatus.PENDING,
      };

      mockFileRepository.create.mockReturnValue(mockFile);
      mockFileRepository.save.mockResolvedValue(mockFile);
      mockS3Service.generatePresignedUploadUrl.mockResolvedValue(
        'https://presigned-url',
      );
      mockS3Service.getFileUrl.mockReturnValue('https://public-url');

      const result = await service.generatePresignedUrl(validRequest, 'user1');

      expect(result.uploadUrl).toBe('https://presigned-url');
      expect(result.fileKey).toMatch(/^uploads\/\d+-[a-f0-9-]+\.jpg$/);
      expect(result.publicUrl).toBe('https://public-url');
      expect(fileRepository.create).toHaveBeenCalled();
      expect(fileRepository.save).toHaveBeenCalled();
    });

    it('should throw FileException.invalidMimeType for unsupported file type', async () => {
      const invalidRequest = {
        ...validRequest,
        mimeType: 'application/exe',
      };

      await expect(
        service.generatePresignedUrl(invalidRequest, 'user1'),
      ).rejects.toThrow();
    });

    it('should throw FileException.toHighFileSize for file size exceeding limit', async () => {
      const largeFileRequest = {
        ...validRequest,
        fileSize: 11 * 1024 * 1024, // 11MB
      };

      await expect(
        service.generatePresignedUrl(largeFileRequest, 'user1'),
      ).rejects.toThrow();
    });

    it('should throw CommonException.internalServerError on database error', async () => {
      mockFileRepository.create.mockImplementation(() => {
        throw DatabaseException.queryError('Database error');
      });

      await expect(
        service.generatePresignedUrl(validRequest, 'user1'),
      ).rejects.toThrow();
    });

    it('should throw CommonException.internalServerError on S3 error', async () => {
      const mockFile = {
        id: '1',
        fileKey: 'uploads/123456-uuid.jpg',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
        createdById: 'user1',
        status: FileStatus.PENDING,
      };

      mockFileRepository.create.mockReturnValue(mockFile);
      mockFileRepository.save.mockResolvedValue(mockFile);
      mockS3Service.generatePresignedUploadUrl.mockRejectedValue(
        FileException.failedGeneratePresignedUrl('S3 error'),
      );

      await expect(
        service.generatePresignedUrl(validRequest, 'user1'),
      ).rejects.toThrow();
    });
  });

  describe('registerFile', () => {
    const registerRequest = {
      fileKey: 'uploads/123456-uuid.jpg',
      fileName: 'test.jpg',
      mimeType: 'image/jpeg',
      fileSize: 1024,
      ownerType: OwnerType.POST,
      ownerId: 'post-1',
    };

    it('should register file successfully by updating PENDING to ACTIVE', async () => {
      const pendingFile = {
        id: '1',
        fileKey: 'uploads/123456-uuid.jpg',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
        createdById: 'user1',
        status: FileStatus.PENDING,
      };

      const activeFile = { ...pendingFile, status: FileStatus.ACTIVE };

      mockFileRepository.findOne.mockResolvedValue(pendingFile);
      mockFileRepository.save.mockResolvedValue(activeFile);
      mockS3Service.getFileUrl.mockReturnValue('https://public-url');

      const result = await service.registerFile(registerRequest, 'user1');

      expect(result).toEqual({
        id: activeFile.id,
        fileKey: activeFile.fileKey,
        fileName: activeFile.fileName,
        mimeType: activeFile.mimeType,
        fileSize: activeFile.fileSize,
        publicUrl: 'https://public-url',
        ownerType: activeFile.ownerType,
        ownerId: activeFile.ownerId,
        createdById: activeFile.createdById,
      });
    });

    it('should register file successfully by updating existing ACTIVE file', async () => {
      const existingFile = {
        id: '1',
        fileKey: 'uploads/123456-uuid.jpg',
        fileName: 'old.jpg',
        mimeType: 'image/png',
        fileSize: 512,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
        createdById: 'user1',
        status: FileStatus.ACTIVE,
      };

      const updatedFile = {
        ...existingFile,
        fileName: registerRequest.fileName,
        mimeType: registerRequest.mimeType,
        fileSize: registerRequest.fileSize,
      };

      mockFileRepository.findOne.mockResolvedValue(existingFile);
      mockFileRepository.save.mockResolvedValue(updatedFile);
      mockS3Service.getFileUrl.mockReturnValue('https://public-url');

      const result = await service.registerFile(registerRequest, 'user1');

      expect(result.fileName).toBe(registerRequest.fileName);
      expect(result.mimeType).toBe(registerRequest.mimeType);
    });

    it('should register file successfully by creating new file', async () => {
      const newFile = {
        id: '1',
        fileKey: 'uploads/123456-uuid.jpg',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
        createdById: 'user1',
        status: FileStatus.ACTIVE,
      };

      mockFileRepository.findOne.mockResolvedValue(null);
      mockFileRepository.create.mockReturnValue(newFile);
      mockFileRepository.save.mockResolvedValue(newFile);
      mockS3Service.getFileUrl.mockReturnValue('https://public-url');

      const result = await service.registerFile(registerRequest, 'user1');

      expect(result.id).toBe(newFile.id);
      expect(fileRepository.create).toHaveBeenCalled();
    });

    it('should throw CommonException.internalServerError on database error', async () => {
      mockFileRepository.findOne.mockRejectedValue(DatabaseException.queryError('Database error'));

      await expect(
        service.registerFile(registerRequest, 'user1'),
      ).rejects.toThrow();
    });
  });

  describe('getFilesByOwner', () => {
    const getFilesRequest = {
      ownerType: OwnerType.POST,
      ownerId: 'post-1',
    };

    it('should get files by owner successfully', async () => {
      const mockFiles = [
        {
          id: '1',
          fileKey: 'uploads/file1.jpg',
          fileName: 'file1.jpg',
          mimeType: 'image/jpeg',
          fileSize: 1024,
          ownerType: OwnerType.POST,
          ownerId: 'post-1',
          createdById: 'user1',
          status: FileStatus.ACTIVE,
        },
        {
          id: '2',
          fileKey: 'uploads/file2.png',
          fileName: 'file2.png',
          mimeType: 'image/png',
          fileSize: 2048,
          ownerType: OwnerType.POST,
          ownerId: 'post-1',
          createdById: 'user1',
          status: FileStatus.ACTIVE,
        },
      ];

      mockFileRepository.find.mockResolvedValue(mockFiles);
      mockS3Service.getFileUrl.mockReturnValue('https://public-url');

      const result = await service.getFilesByOwner(getFilesRequest);

      expect(result).toBeInstanceOf(PagedResponse);
      expect(result.items).toHaveLength(2);
      expect(result.meta.totalElements).toBe(2);
      expect(fileRepository.find).toHaveBeenCalledWith({
        where: {
          ownerType: OwnerType.POST,
          ownerId: 'post-1',
          status: FileStatus.ACTIVE,
        },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty result when no files found', async () => {
      mockFileRepository.find.mockResolvedValue([]);

      const result = await service.getFilesByOwner(getFilesRequest);

      expect(result.items).toHaveLength(0);
      expect(result.meta.totalElements).toBe(0);
    });

    it('should throw CommonException.internalServerError on database error', async () => {
      mockFileRepository.find.mockRejectedValue(DatabaseException.queryError('Database error'));

      await expect(service.getFilesByOwner(getFilesRequest)).rejects.toThrow();
    });
  });

  describe('getFile', () => {
    const getFileRequest = { fileId: 'file-1' };

    it('should get file successfully', async () => {
      const mockFile = {
        id: 'file-1',
        fileKey: 'uploads/test.jpg',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
        createdById: 'user1',
        status: FileStatus.ACTIVE,
      };

      mockFileRepository.findOne.mockResolvedValue(mockFile);

      const result = await service.getFile(getFileRequest);

      expect(result).toEqual(mockFile);
      expect(fileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-1', status: FileStatus.ACTIVE },
      });
    });

    it('should throw FileException.fileNotFound when file not found', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);

      await expect(service.getFile(getFileRequest)).rejects.toThrow();
    });

    it('should throw CommonException.internalServerError on database error', async () => {
      mockFileRepository.findOne.mockRejectedValue(DatabaseException.queryError('Database error'));

      await expect(service.getFile(getFileRequest)).rejects.toThrow();
    });
  });

  describe('deleteFile', () => {
    const deleteFileRequest = { fileId: 'file-1' };

    it('should delete file successfully', async () => {
      const mockFile = {
        id: 'file-1',
        fileKey: 'uploads/test.jpg',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
        createdById: 'user1',
        status: FileStatus.ACTIVE,
      };

      const deletedFile = { ...mockFile, status: FileStatus.DELETED };

      mockFileRepository.findOne.mockResolvedValue(mockFile);
      mockFileRepository.save.mockResolvedValue(deletedFile);
      mockS3Service.deleteObject.mockResolvedValue(undefined);

      await service.deleteFile(deleteFileRequest);

      expect(fileRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'file-1' },
      });
      expect(fileRepository.save).toHaveBeenCalledWith(deletedFile);
      expect(s3Service.deleteObject).toHaveBeenCalledWith('uploads/test.jpg');
    });

    it('should throw FileException.fileNotFound when file not found', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteFile(deleteFileRequest)).rejects.toThrow();
    });

    it('should throw FileException.failedDeleteS3Object when S3 deletion fails', async () => {
      const mockFile = {
        id: 'file-1',
        fileKey: 'uploads/test.jpg',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
        createdById: 'user1',
        status: FileStatus.ACTIVE,
      };

      mockFileRepository.findOne.mockResolvedValue(mockFile);
      mockFileRepository.save.mockResolvedValue({
        ...mockFile,
        status: FileStatus.DELETED,
      });
      mockS3Service.deleteObject.mockRejectedValue(FileException.failedDeleteS3Object('S3 error'));

      await expect(service.deleteFile(deleteFileRequest)).rejects.toThrow();
    });

    it('should throw CommonException.internalServerError on database error', async () => {
      mockFileRepository.findOne.mockRejectedValue(DatabaseException.queryError('Database error'));

      await expect(service.deleteFile(deleteFileRequest)).rejects.toThrow();
    });
  });

  describe('getFileExtension (private method)', () => {
    it('should extract file extension correctly', async () => {
      // Test through generatePresignedUrl which uses getFileExtension
      const request = {
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
      };

      const mockFile = {
        id: '1',
        fileKey: 'uploads/123456-uuid.jpg',
        fileName: 'test.jpg',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
        createdById: 'user1',
        status: FileStatus.PENDING,
      };

      mockFileRepository.create.mockReturnValue(mockFile);
      mockFileRepository.save.mockResolvedValue(mockFile);
      mockS3Service.generatePresignedUploadUrl.mockResolvedValue(
        'https://presigned-url',
      );
      mockS3Service.getFileUrl.mockReturnValue('https://public-url');

      const result = await service.generatePresignedUrl(request, 'user1');

      expect(result.fileKey).toMatch(/\.jpg$/);
    });

    it('should handle files without extension', async () => {
      const request = {
        fileName: 'testfile',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
      };

      const mockFile = {
        id: '1',
        fileKey: 'uploads/123456-uuid',
        fileName: 'testfile',
        mimeType: 'image/jpeg',
        fileSize: 1024,
        ownerType: OwnerType.POST,
        ownerId: 'post-1',
        createdById: 'user1',
        status: FileStatus.PENDING,
      };

      mockFileRepository.create.mockReturnValue(mockFile);
      mockFileRepository.save.mockResolvedValue(mockFile);
      mockS3Service.generatePresignedUploadUrl.mockResolvedValue(
        'https://presigned-url',
      );
      mockS3Service.getFileUrl.mockReturnValue('https://public-url');

      const result = await service.generatePresignedUrl(request, 'user1');

      expect(result.fileKey).not.toMatch(/\./);
    });
  });
});
