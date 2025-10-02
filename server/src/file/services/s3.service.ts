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
    this.bucketName = process.env.S3_BUCKET;

    // 프로덕션 환경에서만 실제 S3 클라이언트 초기화
    if (this.isProduction && this.bucketName) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION || 'ap-southeast-2',
        // IAM 역할 사용 시 credentials 생략 (EC2에서 자동 인식)
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
    // 개발 환경에서는 Mock URL 반환
    if (!this.isProduction || !this.bucketName) {
      return `http://localhost:3001/api/files/mock-upload/${encodeURIComponent(fileKey)}?contentType=${encodeURIComponent(contentType)}`;
    }

    // 프로덕션에서는 실제 S3 Presigned URL
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async deleteObject(fileKey: string): Promise<void> {
    if (!this.isProduction || !this.bucketName) {
      // 개발 환경에서는 로컬 파일 삭제 (MockS3Service에서 처리)
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileKey,
    });

    await this.s3Client.send(command);
  }

  getFileUrl(fileKey: string): string {
    if (!this.isProduction || !this.bucketName) {
      return `http://localhost:3001/api/files/mock-download/${encodeURIComponent(fileKey)}`;
    }

    return `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
  }
}
