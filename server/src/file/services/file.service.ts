import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { File, FileStatus, OwnerType } from '@/file/entities/file.entity';
import { S3Service } from '@/file/services/s3.service';
import {
  PresignedUrlRequest,
  PresignedUrlResponse,
  RegisterFileRequest,
  FileInfoResponse,
  GetFilesByOwnerRequest,
  GetFileRequest,
  DeleteFileRequest,
} from '@/file/dto/file.dto';
import { PagedResponse } from '@/common';
import { CommonException, FileException } from '@/common/exceptions';

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);

  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private s3Service: S3Service,
  ) {}

  // 파일 소유자 업데이트 (temp -> 실제 ID)
  async updateOwner(
    tempId: string,
    realId: string,
    ownerType: OwnerType,
  ): Promise<void> {
    try {
      this.logger.log(
        `Updating file owner from ${tempId} to ${realId} for type ${ownerType}`,
      );

      const result = await this.fileRepository.update(
        { ownerId: tempId, ownerType },
        { ownerId: realId },
      );

      this.logger.debug(`Updated ${result.affected} files`);
    } catch (error) {
      this.logger.error('Error updating file owner', error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  // 10.1. Presigned URL 발급
  async generatePresignedUrl(
    request: PresignedUrlRequest,
    userId: string,
  ): Promise<PresignedUrlResponse> {
    try {
      this.logger.log(
        `Generating presigned URL for file: ${request.fileName}, user: ${userId}`,
      );

      // 1. MIME 타입 검증
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      // MIME 타입 검증
      if (!allowedTypes.includes(request.mimeType)) {
        this.logger.warn(
          `Unsupported file type: ${request.mimeType} for file: ${request.fileName}`,
        );
        throw FileException.invalidMimeType(request.mimeType);
      }

      // 2. 파일 크기 제한 (10MB)
      if (request.fileSize > 10 * 1024 * 1024) {
        this.logger.warn(
          `File size exceeds limit: ${request.fileSize} bytes for file: ${request.fileName}`,
        );
        throw FileException.toHighFileSize(request.fileSize);
      }

      // 3. 파일 키 생성 (S3 경로)
      const ext = this.getFileExtension(request.fileName); // 파일 확장자 추출
      const fileKey = `uploads/${Date.now()}-${randomUUID()}${ext}`; // S3 object key 생성
      this.logger.debug(`Generated file key: ${fileKey}`);

      // 4. Presigned URL 발급
      const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
        fileKey,
        request.mimeType,
      );

      // 5. DB에 PENDING 상태로 메타데이터 임시 생성
      const file = this.fileRepository.create({
        fileKey,
        mimeType: request.mimeType,
        fileSize: request.fileSize,
        fileName: request.fileName,
        ownerType: request.ownerType,
        ownerId: request.ownerId,
        createdById: userId,
        status: FileStatus.PENDING,
      });

      // DB에 파일 메타데이터 저장
      await this.fileRepository.save(file);
      this.logger.log(`Created PENDING file record with key: ${fileKey}`);

      // 6. public URL 계산
      const publicUrl = this.s3Service.getFileUrl(fileKey);

      return { uploadUrl, fileKey, publicUrl };
    } catch (error) {
      this.logger.error(`Error generating presigned URL`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  // 10.2. 파일 등록 (메타데이터 최종 확정)
  async registerFile(
    request: RegisterFileRequest,
    userId: string,
  ): Promise<FileInfoResponse> {
    try {
      this.logger.log(`Registering file: ${request.fileKey}, user: ${userId}`);

      // 기존 파일 조회 (PENDING 상태 포함)
      const existing = await this.fileRepository.findOne({
        where: { fileKey: request.fileKey },
      });

      let saved: File;

      if (existing && existing.status === FileStatus.PENDING) {
        // PENDING 상태의 파일을 ACTIVE로 업데이트
        this.logger.log(`Updating PENDING file to ACTIVE: ${request.fileKey}`);
        existing.status = FileStatus.ACTIVE;
        saved = await this.fileRepository.save(existing);
      } else if (existing && existing.status === FileStatus.ACTIVE) {
        // 기존 ACTIVE 파일 업데이트
        this.logger.log(`Updating existing ACTIVE file: ${request.fileKey}`);
        existing.mimeType = request.mimeType;
        existing.fileSize = request.fileSize;
        existing.fileName = request.fileName;
        existing.ownerType = request.ownerType as OwnerType;
        existing.ownerId = request.ownerId;
        existing.createdById = userId;
        saved = await this.fileRepository.save(existing);
      } else {
        // 새로운 파일 생성
        this.logger.log(`Creating new ACTIVE file: ${request.fileKey}`);
        const file = this.fileRepository.create({
          fileKey: request.fileKey,
          mimeType: request.mimeType,
          fileSize: request.fileSize,
          fileName: request.fileName,
          ownerType: request.ownerType as OwnerType,
          ownerId: request.ownerId,
          createdById: userId,
          status: FileStatus.ACTIVE,
        });
        saved = await this.fileRepository.save(file);
      }

      this.logger.log(
        `File registered successfully: ${saved.fileKey}, id: ${saved.id}`,
      );

      return {
        id: saved.id,
        fileKey: saved.fileKey,
        fileName: saved.fileName,
        mimeType: saved.mimeType,
        fileSize: saved.fileSize,
        publicUrl: this.s3Service.getFileUrl(saved.fileKey),
        ownerType: saved.ownerType,
        ownerId: saved.ownerId,
        createdById: saved.createdById,
      };
    } catch (error) {
      this.logger.error(`Error registering file`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  // 10.3. 특정 리소스(게시글 등)에 연결된 파일 목록 조회
  async getFilesByOwner(
    request: GetFilesByOwnerRequest,
  ): Promise<PagedResponse<FileInfoResponse>> {
    try {
      this.logger.log(
        `Getting files by owner: ${request.ownerType}:${request.ownerId}`,
      );

      const files = await this.fileRepository.find({
        where: {
          ownerType: request.ownerType,
          ownerId: request.ownerId,
          status: FileStatus.ACTIVE,
        },
        order: { createdAt: 'DESC' },
      });

      this.logger.debug(
        `Found ${files.length} files for owner: ${request.ownerType}:${request.ownerId}`,
      );

      const items = files.map(file => ({
        id: file.id,
        fileKey: file.fileKey,
        fileName: file.fileName,
        mimeType: file.mimeType,
        fileSize: file.fileSize,
        publicUrl: this.s3Service.getFileUrl(file.fileKey),
        ownerType: file.ownerType,
        ownerId: file.ownerId,
        createdById: file.createdById,
      }));

      return new PagedResponse(items, 1, items.length, items.length);
    } catch (error) {
      this.logger.error(`Error getting files by owner`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  // 10.4. 단일 파일 정보 조회
  async getFile(request: GetFileRequest): Promise<File> {
    try {
      this.logger.log(`Getting file: ${request.fileId}`);

      const file = await this.fileRepository.findOne({
        where: { id: request.fileId, status: FileStatus.ACTIVE },
      });

      if (!file) {
        this.logger.warn(`File not found: ${request.fileId}`);
        throw FileException.fileNotFound(request.fileId);
      }

      this.logger.debug(`File found: ${file.fileKey}, id: ${file.id}`);
      return file;
    } catch (error) {
      this.logger.error(`Error getting file`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  // 10.5. 파일 삭제 (논리 삭제 + S3 삭제)
  async deleteFile(request: DeleteFileRequest): Promise<void> {
    try {
      this.logger.log(`Deleting file: ${request.fileId}`);

      // 파일 메타데이터 조회
      const file = await this.fileRepository.findOne({
        where: { id: request.fileId },
      });
      if (!file) {
        this.logger.warn(`File not found for deletion: ${request.fileId}`);
        throw FileException.fileNotFound(request.fileId);
      }

      this.logger.log(
        `Soft deleting file: ${file.fileKey}, id: ${file.id}`,
      );
      await this.fileRepository.softRemove(file);

      try {
        await this.s3Service.deleteObject(file.fileKey);
        this.logger.log(`Successfully deleted file from S3: ${file.fileKey}`);
      } catch (error) {
        this.logger.error(
          `Failed to delete file from S3: ${file.fileKey}`,
          error.stack,
        );
        throw FileException.failedDeleteS3Object(error.stack);
      }
    } catch (error) {
      this.logger.error(`Error deleting file`, error.stack);
      throw CommonException.internalServerError(error.message);
    }
  }

  // 헬퍼: 파일 확장자 추출 (.jpg, .png)
  private getFileExtension(fileName: string): string {
    const dot = fileName.lastIndexOf('.');
    return dot !== -1 ? fileName.substring(dot) : '';
  }

  // 파일 키를 CloudFront URL로 변환
  getFileUrl(fileKey: string): string {
    if (!fileKey) return null;
    return this.s3Service.getFileUrl(fileKey);
  }
}
