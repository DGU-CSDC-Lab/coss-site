import { filesApi, SUPPORTED_FILE_TYPES } from '@/lib/api/files'

export interface UploadOptions {
  onProgress?: (progress: number) => void
  maxSize?: number // bytes
  allowedTypes?: string[]
  ownerType: 'post' | 'popup' | 'faculty'
  ownerId: string
}

export interface UploadResult {
  fileKey: string
  fileId?: string // 등록 후 받는 DB ID
  originalName: string
  fileSize: number
  mimeType: string
  publicUrl?: string
}

export class FileUploadError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message)
    this.name = 'FileUploadError'
  }
}

// 파일 검증
export const validateFile = (file: File, options: Partial<UploadOptions> = {}): void => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB 기본값
    allowedTypes = SUPPORTED_FILE_TYPES,
  } = options

  // 파일 크기 검증
  if (file.size > maxSize) {
    throw new FileUploadError(
      `파일 크기가 너무 큽니다. 최대 ${Math.round(maxSize / 1024 / 1024)}MB까지 업로드 가능합니다.`,
      'FILE_TOO_LARGE'
    )
  }

  // 파일 타입 검증
  if (!allowedTypes.includes(file.type)) {
    throw new FileUploadError(
      '지원하지 않는 파일 형식입니다.',
      'UNSUPPORTED_FILE_TYPE'
    )
  }
}

// 단일 파일 업로드 (presigned URL + 메타데이터 등록)
export const uploadFile = async (
  file: File,
  options: UploadOptions
): Promise<UploadResult> => {
  const { onProgress, ownerType, ownerId } = options

  try {
    // 파일 검증
    validateFile(file, options)

    // 진행률 시작
    onProgress?.(0)

    // 1. Presigned URL 생성
    const presignData = await filesApi.getPresignedUrl({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      ownerType,
      ownerId,
    })

    onProgress?.(30)

    // 2. S3에 파일 업로드
    await filesApi.uploadFile(file, presignData.uploadUrl)

    onProgress?.(70)

    // 3. 파일 메타데이터 등록
    const fileInfo = await filesApi.registerFile({
      fileKey: presignData.fileKey,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      ownerType,
      ownerId,
    })

    // 진행률 완료
    onProgress?.(100)

    return {
      fileKey: presignData.fileKey,
      fileId: fileInfo.id,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      publicUrl: fileInfo.publicUrl,
    }
  } catch (error) {
    if (error instanceof FileUploadError) {
      throw error
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : '파일 업로드 중 오류가 발생했습니다.'

    throw new FileUploadError(errorMessage, 'UPLOAD_FAILED')
  }
}

// 다중 파일 업로드
export const uploadMultipleFiles = async (
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> => {
  const { onProgress } = options
  const results: UploadResult[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]

    try {
      const result = await uploadFile(file, {
        ...options,
        onProgress: fileProgress => {
          const totalProgress = ((i + fileProgress / 100) / files.length) * 100
          onProgress?.(Math.round(totalProgress))
        },
      })

      results.push(result)
    } catch (error) {
      throw new FileUploadError(
        `파일 "${file.name}" 업로드 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        'MULTIPLE_UPLOAD_FAILED'
      )
    }
  }

  return results
}

// 이미지 파일만 업로드
export const uploadImage = async (
  file: File,
  options: Omit<UploadOptions, 'allowedTypes'>
): Promise<UploadResult> => {
  return uploadFile(file, {
    ...options,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  })
}

// 문서 파일만 업로드
export const uploadDocument = async (
  file: File,
  options: Omit<UploadOptions, 'allowedTypes'>
): Promise<UploadResult> => {
  return uploadFile(file, {
    ...options,
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
    ],
  })
}

// S3만 업로드 (DB 등록 없음) - 기존 imageUpload.ts 대체
export const uploadFileToS3Only = async (
  file: File,
  ownerType: 'post' | 'popup' | 'faculty',
  ownerId: string,
  options: Partial<UploadOptions> = {}
): Promise<UploadResult> => {
  const { onProgress } = options

  try {
    // 파일 검증
    validateFile(file, options)

    onProgress?.(0)

    // 1. Presigned URL 생성
    const presignData = await filesApi.getPresignedUrl({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      ownerType,
      ownerId,
    })

    onProgress?.(50)

    // 2. S3에 파일 업로드만
    await filesApi.uploadFile(file, presignData.uploadUrl)

    onProgress?.(100)

    return {
      fileKey: presignData.fileKey,
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      publicUrl: presignData.publicUrl,
    }
  } catch (error) {
    if (error instanceof FileUploadError) {
      throw error
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : '파일 업로드 중 오류가 발생했습니다.'

    throw new FileUploadError(errorMessage, 'UPLOAD_FAILED')
  }
}

// 이미지 파일만 S3 업로드
export const uploadImageToS3Only = async (
  file: File,
  ownerType: 'post' | 'popup' | 'faculty',
  ownerId: string,
  options: Partial<UploadOptions> = {}
): Promise<UploadResult> => {
  return uploadFileToS3Only(file, ownerType, ownerId, {
    ...options,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  })
}

// 파일 크기 포맷팅 유틸
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 파일 확장자 추출
export const getFileExtension = (fileName: string): string => {
  return fileName.slice(((fileName.lastIndexOf('.') - 1) >>> 0) + 2)
}
