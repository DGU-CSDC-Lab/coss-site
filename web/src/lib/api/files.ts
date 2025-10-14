import { api } from '@/lib/apiClient'
import { PagedResponse } from '@/lib/apiClient'

export interface OwnerData {
  ownerType: 'post' | 'popup' | 'faculty' | 'header'
  ownerId: string
}

export interface PresignedUrlRequest {
  fileName: string
  fileSize: number
  mimeType: string
  ownerType: 'post' | 'popup' | 'faculty' | 'header'
  ownerId: string
}

export interface PresignedUrlResponse {
  uploadUrl: string
  fileKey: string
  publicUrl?: string
}

export interface RegisterFileRequest {
  fileKey: string
  mimeType: string
  fileSize: number
  fileName: string
  ownerType: 'post' | 'popup' | 'faculty' | 'header'
  ownerId: string
}

export interface FileInfoResponse {
  id: string
  fileKey: string
  fileName: string
  fileSize: number
  mimeType: string
  publicUrl: string
  ownerType: string
  ownerId: string
  createdById: string
}

// 파일 API 함수들
export const filesApi = {
  // Presigned URL 생성 (관리자)
  getPresignedUrl: (data: PresignedUrlRequest): Promise<PresignedUrlResponse> =>
    api.auth.post('/files/presigned-url', data),

  // 파일 메타데이터 등록 (관리자)
  registerFile: (data: RegisterFileRequest): Promise<FileInfoResponse> =>
    api.auth.post('/files/register', data),

  // 파일 업로드 (Presigned URL 사용)
  uploadFile: async (file: File, uploadUrl: string): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!response.ok) {
      throw new Error(`파일 업로드에 실패 하였습니다. ${response.status}`)
    }
  },

  // 단일 파일 정보 조회
  getFile: (fileId: string): Promise<FileInfoResponse> =>
    api.get(`/files/${fileId}`),

  // 파일 삭제 (관리자)
  deleteFile: (fileId: string): Promise<void> =>
    api.auth.delete(`/files/${fileId}`),

  // 소유자별 파일 목록 조회
  getFilesByOwner: (ownerType: string, ownerId: string): Promise<PagedResponse<FileInfoResponse>> =>
    api.get(`/files/by-owner?ownerType=${ownerType}&ownerId=${ownerId}`),
}

// 지원되는 파일 타입
export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
]
