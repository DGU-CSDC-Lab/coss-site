import { useState } from 'react'
import { 
  uploadFile, 
  uploadFileToS3Only,
  UploadResult, 
  FileUploadError,
  UploadOptions 
} from '@/utils/fileUpload'

interface UseFileUploadOptions {
  ownerType: 'post' | 'popup' | 'faculty' | 'header' | 'feedback' | 'course'
  ownerId: string
  onSuccess?: (result: UploadResult, file: File) => void
  onError?: (error: Error) => void
  uploadOptions?: Partial<UploadOptions>
}

export const useFileUpload = (options: UseFileUploadOptions) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<UploadResult | null>(null)

  const upload = async (file: File, fullUpload = true) => {
    setUploading(true)
    setProgress(0)

    try {
      const uploadResult = fullUpload 
        ? await uploadFile(file, {
            ...options.uploadOptions,
            ownerType: options.ownerType,
            ownerId: options.ownerId,
            onProgress: setProgress,
          })
        : await uploadFileToS3Only(file, options.ownerType, options.ownerId, {
            ...options.uploadOptions,
            onProgress: setProgress,
          })

      setResult(uploadResult)
      options.onSuccess?.(uploadResult, file)
      return uploadResult
    } catch (error) {
      const uploadError = error instanceof FileUploadError ? error : new FileUploadError(
        error instanceof Error ? error.message : '업로드 실패',
        'UPLOAD_FAILED'
      )
      options.onError?.(uploadError)
      throw uploadError
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setProgress(0)
    setUploading(false)
  }

  return {
    upload,
    uploading,
    progress,
    result,
    reset,
  }
}

// 이미지 전용 훅 (기존 useImageUpload 대체)
export const useImageUpload = (options: {
  ownerType?: 'post' | 'popup' | 'faculty' | 'header' | 'feedback' | 'course'
  ownerId?: string
  onSuccess?: (result: UploadResult, file: File) => void
  onError?: (error: Error) => void
  uploadOptions?: Omit<Partial<UploadOptions>, 'allowedTypes'>
}) => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [fileKey, setFileKey] = useState<string>('')

  const fileUpload = useFileUpload({
    ownerType: options.ownerType || 'post',
    ownerId: options.ownerId || 'temp',
    uploadOptions: {
      ...options.uploadOptions,
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    },
    onSuccess: (result, file) => {
      setImageUrl(result.publicUrl || '')
      setFileName(file.name)
      setFileKey(result.fileKey)
      options.onSuccess?.(result, file)
    },
    onError: options.onError
  })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 미리보기 설정
    const previewUrl = URL.createObjectURL(file)
    setImageUrl(previewUrl)
    setFileName(file.name)

    try {
      const result = await fileUpload.upload(file, false) // S3만 업로드
      setImageUrl(result.publicUrl || '')
      setFileKey(result.fileKey)
      URL.revokeObjectURL(previewUrl)
    } catch (error) {
      // 에러 시 미리보기 제거
      setImageUrl('')
      setFileName('')
      URL.revokeObjectURL(previewUrl)
      throw error
    } finally {
      // 같은 파일 재선택을 위해 input value 초기화
      e.target.value = ''
    }
  }

  return {
    imageUrl,
    fileName,
    fileKey,
    uploading: fileUpload.uploading,
    progress: fileUpload.progress,
    handleImageChange,
    reset: () => {
      setImageUrl('')
      setFileName('')
      setFileKey('')
      fileUpload.reset()
    }
  }
}

// 다중 파일 업로드 훅
export const useMultipleFileUpload = (options: UseFileUploadOptions) => {
  const [files, setFiles] = useState<UploadResult[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const uploadFiles = async (fileList: File[], fullUpload = true) => {
    setUploading(true)
    setProgress(0)
    const results: UploadResult[] = []

    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i]
        
        const result = fullUpload
          ? await uploadFile(file, {
              ...options.uploadOptions,
              ownerType: options.ownerType,
              ownerId: options.ownerId,
              onProgress: (fileProgress) => {
                const totalProgress = ((i + fileProgress / 100) / fileList.length) * 100
                setProgress(Math.round(totalProgress))
              },
            })
          : await uploadFileToS3Only(file, options.ownerType, options.ownerId, {
              ...options.uploadOptions,
              onProgress: (fileProgress) => {
                const totalProgress = ((i + fileProgress / 100) / fileList.length) * 100
                setProgress(Math.round(totalProgress))
              },
            })

        results.push(result)
      }

      setFiles(prev => [...prev, ...results])
      return results
    } catch (error) {
      const uploadError = error instanceof FileUploadError ? error : new FileUploadError(
        error instanceof Error ? error.message : '업로드 실패',
        'UPLOAD_FAILED'
      )
      options.onError?.(uploadError)
      throw uploadError
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const reset = () => {
    setFiles([])
    setProgress(0)
    setUploading(false)
  }

  return {
    files,
    uploadFiles,
    removeFile,
    uploading,
    progress,
    reset,
  }
}
