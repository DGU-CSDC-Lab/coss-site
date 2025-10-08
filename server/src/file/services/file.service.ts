import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File, OwnerType, FileStatus } from '../entities';
import {
  PresignRequest,
  PresignResponse,
} from '../dto/file.dto';
import { S3Service } from './s3.service';
import { randomUUID } from 'crypto';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private fileRepository: Repository<File>,
    private s3Service: S3Service,
  ) {}

  async generatePresignedUrl(
    request: PresignRequest,
    userId: string,
  ): Promise<PresignResponse> {
    // Validate file type
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

    if (!allowedTypes.includes(request.contentType)) {
      throw new BadRequestException('Unsupported file type');
    }

    // Validate file size (10MB limit)
    if (request.fileSize && request.fileSize > 10 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    // Generate unique file key
    const fileExtension = this.getFileExtension(request.fileName);
    const fileKey = `uploads/${Date.now()}-${randomUUID()}${fileExtension}`;

    // Generate real presigned URL
    const uploadUrl = await this.s3Service.generatePresignedUploadUrl(
      fileKey,
      request.contentType,
    );

    const fileUrl = this.s3Service.getFileUrl(fileKey);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    return {
      uploadUrl,
      fileUrl,
      fileKey,
      expiresIn: 3600,
      expiresAt: expiresAt.toISOString(),
    };
  }

  async getFile(fileKey: string): Promise<File> {
    const file = await this.fileRepository.findOne({
      where: { fileKey, status: FileStatus.ACTIVE },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async deleteFile(fileKey: string, _userId: string): Promise<void> {
    const file = await this.fileRepository.findOne({ where: { fileKey } });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    // Mark as deleted in database
    file.status = FileStatus.DELETED;
    await this.fileRepository.save(file);

    // Delete from S3
    try {
      await this.s3Service.deleteObject(fileKey);
    } catch (error) {
      console.error('Failed to delete file from S3:', error);
    }
  }

  async getFilesByOwner(ownerType: string, ownerId: string): Promise<File[]> {
    return this.fileRepository.find({
      where: {
        ownerType: ownerType as OwnerType,
        ownerId,
        status: FileStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  private getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot !== -1 ? fileName.substring(lastDot) : '';
  }
}
