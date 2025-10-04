import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MockS3Service {
  private uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    // uploads 디렉토리 생성
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async generatePresignedUploadUrl(
    fileKey: string,
  ): Promise<string> {
    // Mock presigned URL - 실제로는 로컬 업로드 엔드포인트
    return `http://localhost:3001/api/files/mock-upload/${encodeURIComponent(fileKey)}`;
  }

  async deleteObject(fileKey: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getFileUrl(fileKey: string): string {
    return `http://localhost:3001/api/files/mock-download/${encodeURIComponent(fileKey)}`;
  }

  // Mock 파일 업로드 처리
  async handleMockUpload(fileKey: string, buffer: Buffer): Promise<void> {
    const filePath = path.join(this.uploadDir, fileKey);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
  }

  // Mock 파일 다운로드 처리
  getMockFile(fileKey: string): Buffer | null {
    const filePath = path.join(this.uploadDir, fileKey);
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
    return null;
  }
}
