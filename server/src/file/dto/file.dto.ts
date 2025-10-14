import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OwnerType } from '@/file/entities/file.entity';

// 파일 업로드를 위한 Presign URL 요청 DTO
export class PresignedUrlRequest {
  @ApiProperty({
    description: '원본 파일명',
    example: 'document.pdf',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: 234523,
    description:
      '파일 크기(Byte 단위). 클라이언트에서 업로드 전 `file.size`를 통해 계산하여 전달합니다. (예: 234523 → 약 229KB)',
  })
  @IsNumber()
  fileSize: number;

  @ApiProperty({
    description: '파일 타입 (MIME type)',
    example: 'image/png',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    example: OwnerType.POST,
    description: '파일 소유자 타입',
    enum: OwnerType,
  })
  @IsString()
  ownerType: OwnerType;

  @ApiProperty({
    description: '파일 소유자 ID (post, popup 등 객체의 id)',
    example: '1234',
  })
  @IsString()
  ownerId: string;
}

// 파일 업로드를 위한 Presign URL 응답 DTO
export class PresignedUrlResponse {
  @ApiProperty({
    description: 'S3 업로드용 Presigned URL',
    example: 'https://s3.amazonaws.com/bucket/file.pdf?X-Amz-Algorithm=...',
  })
  uploadUrl: string;

  @ApiProperty({
    description: 'S3 Object Key',
    example: 'uploads/2024/03/15/uuid-1234-5678-9012.pdf',
  })
  fileKey: string;

  @ApiProperty({
    description: '공개 접근용 URL (optional)',
    example: 'https://s3.amazonaws.com/bucket/file.pdf',
  })
  publicUrl?: string;
}

// S3 업로드 완료 후, 파일 메타데이터를 서버 DB에 저장하기 위한 DTO
export class RegisterFileRequest {
  @ApiProperty({
    example: 'uploads/faculty/2025/10/profile-abc.png',
    description:
      'S3 Object Key — 업로드된 파일의 고유 경로. presigned URL 발급 시 함께 전달받은 값으로, S3 내 실제 파일 위치를 식별합니다.',
  })
  @IsString()
  fileKey: string;

  @ApiProperty({
    example: 'image/png',
    description:
      '파일의 MIME 타입 (예: image/png, application/pdf 등). 클라이언트에서 File 객체의 type 속성으로 전달됩니다.',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    example: 234523,
    description:
      '파일 크기(Byte 단위). 클라이언트에서 업로드 전 `file.size`를 통해 계산하여 전달합니다. (예: 234523 → 약 229KB)',
  })
  @IsNumber()
  fileSize: number;

  @ApiProperty({
    example: 'profile.png',
    description:
      '업로드 전 원본 파일명. 사용자가 업로드한 실제 파일의 이름으로, 확장자 포함 문자열입니다.',
  })
  @IsString()
  fileName: string;

  @ApiProperty({
    example: OwnerType.POST,
    description: '파일 소유자 타입',
    enum: OwnerType,
  })
  @IsString()
  ownerType: OwnerType;

  @ApiProperty({
    example: 'f001',
    description: '파일 소유자 ID (post, popup 등 객체의 id)',
  })
  @IsString()
  ownerId: string;
}

export class FileInfoResponse {
  @ApiProperty({
    example: 'uuid-1234',
    description:
      '서버 DB에 저장된 파일의 고유 식별자(ID). 파일 수정, 삭제 등 후속 작업 시 참조되는 기본 키입니다.',
  })
  id: string;

  @ApiProperty({
    example: 'uploads/faculty/2025/10/profile-abc.png',
    description:
      'S3 Object Key — S3 내부에서 파일을 식별하는 경로입니다. presigned URL 발급 시 함께 생성된 값입니다.',
  })
  fileKey: string;

  @ApiProperty({
    example: 'profile.png',
    description:
      '사용자가 업로드한 원본 파일 이름. 확장자를 포함하며, UI 등에서 표시용으로 사용됩니다.',
  })
  fileName: string;

  @ApiProperty({
    example: 234523,
    description:
      '파일 크기 (Byte 단위). 클라이언트 업로드 시 전달된 값이며, 약 229KB에 해당합니다.',
  })
  fileSize: number;

  @ApiProperty({
    example: 'image/png',
    description:
      '파일의 MIME 타입. 예: image/png, application/pdf, video/mp4 등. 콘텐츠 유형 식별용입니다.',
  })
  mimeType: string;

  @ApiProperty({
    example: 'https://cdn.school.ac.kr/uploads/faculty/2025/10/profile-abc.png',
    description:
      'S3 혹은 CloudFront에서 접근 가능한 파일의 공개 URL입니다. 클라이언트가 파일을 직접 표시하거나 다운로드할 때 사용됩니다.',
  })
  publicUrl: string;

  @ApiProperty({
    example: 'faculty',
    description:
      '파일이 속한 리소스의 타입. 예: post(게시글), popup(팝업), faculty(교수) 등. File 엔티티의 ownerType과 동일합니다.',
  })
  ownerType: string;

  @ApiProperty({
    example: 'f001',
    description:
      '파일이 연결된 엔티티의 고유 ID. 예: 게시글 ID, 교수 ID 등. File 엔티티의 ownerId와 동일합니다.',
  })
  ownerId: string;

  @ApiProperty({
    example: 'admin-001',
    description:
      '해당 파일을 업로드한 사용자의 고유 ID. 파일 업로드 추적 및 감사 로그 등에 활용할 수 있습니다.',
  })
  createdById: string;
}

// 특정 리소스(게시글 등)에 연결된 파일 목록 요청 DTO
export class GetFilesByOwnerRequest {
  @ApiProperty({
    example: OwnerType.POST,
    description: '파일 소유자 타입',
    enum: OwnerType,
  })
  @IsString()
  ownerType: OwnerType;

  @ApiProperty({
    example: '1234',
    description: '파일 소유자 ID (post, popup 등 객체의 id)',
  })
  @IsString()
  ownerId: string;
}

// 단일 파일 조회 요청
export class GetFileRequest {
  @ApiProperty({
    example: 'file-1234',
    description: '삭제할 파일의 id',
  })
  @IsString()
  fileId: string;
}

// 파일 삭제 요청 DTO
export class DeleteFileRequest {
  @ApiProperty({
    example: 'file-1234',
    description: '삭제할 파일의 id',
  })
  @IsString()
  fileId: string;
}
