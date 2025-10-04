import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
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
        region: process.env.MINIO_REGION,
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY,
          secretAccessKey: process.env.MINIO_SECRET_KEY,
        },
        forcePathStyle: true, // MinIO 필수 설정
      });
    } else if (this.bucketName) {
      // 프로덕션 환경에서는 실제 S3 사용
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION,
        ...(process.env.AWS_ACCESS_KEY_ID && {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        }),
      });
    }
  }

  async generatePresignedUploadUrl(
    fileKey: string,
    contentType: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized');
    }

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteObject(fileKey: string): Promise<void> {
    if (!this.s3Client) {
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    await this.s3Client.send(command);
  }

  getFileUrl(fileKey: string): string {
    if (!this.isProduction) {
      // 로컬 MinIO URL
      return `${process.env.MINIO_ENDPOINT}/${this.bucketName}/${fileKey}`;
    }

    // 프로덕션 S3 URL
    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  }
}
