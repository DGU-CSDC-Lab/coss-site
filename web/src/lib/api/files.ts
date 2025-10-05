import { api } from '../apiClient'

export interface PresignRequest {
  fileName: string
  fileType: string
  contentType: string
  fileSize?: number
  ownerType?: string
  ownerId?: string
}

export interface PresignResponse {
  uploadUrl: string
  fileUrl: string
  fileKey: string
  expiresIn: number
  expiresAt: string
}

export interface FileCompleteRequest {
  fileKey: string
  ownerType?: string
  ownerId?: string
}

// 파일 API 함수들
export const filesApi = {
  // Presigned URL 생성 (관리자)
  getPresignedUrl: (data: PresignRequest): Promise<PresignResponse> =>
    api.auth.post('/files/presign', data),

  // 파일 업로드 완료 처리
  completeUpload: (
    data: FileCompleteRequest
  ): Promise<{ fileKey: string; fileUrl: string }> =>
    api.auth.post('/files/complete', data),

  // 파일 업로드 (Presigned URL 사용)
  uploadFile: async (file: File, uploadUrl: string): Promise<void> => {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Upload error:', errorText)
      throw new Error(`Upload failed: ${response.status}`)
    }
  },

  // 파일 업로드 전체 플로우 (Presigned URL 생성 + 업로드 + 완료 처리)
  uploadFileComplete: async (
    file: File,
    ownerType?: string,
    ownerId?: string
  ): Promise<{
    fileKey: string
    fileUrl: string
    originalName: string
    fileSize: number
    mimeType: string
  }> => {
    // 1. Presigned URL 생성
    const presignData = await filesApi.getPresignedUrl({
      fileName: file.name,
      fileType: file.type,
      contentType: file.type,
      fileSize: file.size,
      ownerType,
      ownerId,
    })

    // 2. S3에 파일 업로드
    await filesApi.uploadFile(file, presignData.uploadUrl)

    // 3. 업로드 완료 처리
    const completeData = await filesApi.completeUpload({
      fileKey: presignData.fileKey,
      ownerType,
      ownerId,
    })

    // 4. 파일 정보 반환
    return {
      fileKey: completeData.fileKey,
      fileUrl: completeData.fileUrl,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }
  },

  // 파일 정보 조회
  getFile: (fileKey: string) => api.get(`/files/${fileKey}`),

  // 파일 삭제 (관리자)
  deleteFile: (fileKey: string) => api.auth.delete(`/files/${fileKey}`),

  // 소유자별 파일 목록
  getFilesByOwner: (ownerType: string, ownerId: string) =>
    api.get(`/files?ownerType=${ownerType}&ownerId=${ownerId}`),
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
]
