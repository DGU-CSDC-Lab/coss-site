import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileException } from '@/common/exceptions';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private s3Client: S3Client;
  private bucketName: string;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.bucketName = process.env.BUCKET_NAME;

    // 로컬 환경에서는 MinIO 사용
    if (!this.isProduction) {
      this.s3Client = new S3Client({
        endpoint: process.env.MINIO_ENDPOINT,
        region: process.env.REGION,
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY,
          secretAccessKey: process.env.MINIO_SECRET_KEY,
        },
        forcePathStyle: true, // MinIO 필수 설정
      });
      this.logger.log('S3Service initialized with MinIO for local environment');
    } else if (this.bucketName) {
      // 프로덕션 환경에서는 실제 S3 사용
      this.s3Client = new S3Client({
        region: process.env.REGION,
        ...(process.env.AWS_ACCESS_KEY_ID && {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        }),
      });
      this.logger.log('S3Service initialized with AWS S3 for production environment');
    } else {
      this.logger.error('S3Service initialized without bucket configuration');
    }
  }

  // Presigned URL 생성
  async generatePresignedUploadUrl(
    fileKey: string,
    mimeType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    if (!this.s3Client) {
      this.logger.error('S3 client not initialized');
      throw FileException.failedCreateS3Client();
    }

    // S3 업로드 명령 생성
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: mimeType,
    });

    try {
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      this.logger.log(`Presigned upload URL generated for file: ${fileKey}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for file: ${fileKey}`, error);
      throw FileException.failedGeneratePresignedUrl(error.stack);
    }
  }

  // S3 객체 삭제
  async deleteObject(fileKey: string): Promise<void> {
    if (!this.s3Client) {
      this.logger.error('S3 client not initialized');
      throw FileException.failedCreateS3Client();
    }

    // S3 삭제 명령 생성
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    try {
      await this.s3Client.send(command);
      this.logger.log(`File deleted successfully: ${fileKey}`);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${fileKey}`, error);
      throw FileException.failedDeleteS3Object(error.stack);
    }
  }

  // S3 객체 URL 생성
  getFileUrl(fileKey: string): string {
    if (!this.isProduction) {
      // 로컬 MinIO URL
      const url = `${process.env.MINIO_ENDPOINT}/${this.bucketName}/${fileKey}`;
      this.logger.debug(`Generated MinIO URL for file: ${fileKey}`);
      return url;
    }

    // 프로덕션 S3 URL
    const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
    this.logger.debug(`Generated S3 URL for file: ${fileKey}`);
    return url;
  }
}
