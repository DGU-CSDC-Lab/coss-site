import { useState } from 'react'
import { uploadImage, UploadResult } from '@/utils/fileUpload'

interface UseImageUploadOptions {
  ownerType?: string
  ownerId?: string
  onSuccess?: (result: UploadResult) => void
  onError?: (error: Error) => void
}

export const useImageUpload = (options: UseImageUploadOptions = {}) => {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string>('')
  const [fileKey, setFileKey] = useState<string>('')

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const previewUrl = URL.createObjectURL(file)
    setImageUrl(previewUrl)
    setUploading(true)

    try {
      const result = await uploadImage(file, {
        ownerType: options.ownerType,
        ownerId: options.ownerId,
      })

      setImageUrl(result.fileUrl)
      setFileKey(result.fileKey)
      URL.revokeObjectURL(previewUrl)
      
      options.onSuccess?.(result)
    } catch (error) {
      console.error('Image upload failed:', error)
      const uploadError = error instanceof Error ? error : new Error('업로드 실패')
      options.onError?.(uploadError)
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setImageUrl('')
    setFileName('')
    setFileKey('')
    setUploading(false)
  }

  return {
    imageUrl,
    uploading,
    fileName,
    fileKey,
    handleImageChange,
    reset,
  }
}
