import { api } from '../apiClient'

export interface PresignRequest {
  fileName: string
  fileType: string
  contentType: string
  fileSize?: number
}

export interface PresignResponse {
  uploadUrl: string
  fileUrl: string
  fileKey: string
  expiresIn: number
  expiresAt: string
}

// 파일 API 함수들
export const filesApi = {
  // Presigned URL 생성 (관리자)
  getPresignedUrl: (data: PresignRequest): Promise<PresignResponse> =>
    api.auth.post('/files/presign', data),

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
