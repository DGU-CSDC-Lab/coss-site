import { filesApi } from '@/lib/api/files'

export interface ImageUploadResult {
  fileUrl: string
  fileKey: string
}

export const uploadImageFile = async (file: File): Promise<ImageUploadResult> => {
  // 1. Presigned URL 생성
  const presignData = await filesApi.getPresignedUrl({
    fileName: file.name,
    fileType: file.type,
    contentType: file.type,
    fileSize: file.size,
  })

  // 2. S3에 파일 업로드
  await filesApi.uploadFile(file, presignData.uploadUrl)

  return {
    fileUrl: presignData.fileUrl,
    fileKey: presignData.fileKey,
  }
}

export const insertImageToEditor = (
  editorRef: React.RefObject<HTMLDivElement>,
  imageResult: ImageUploadResult
) => {
  if (!editorRef.current) return

  const editor = editorRef.current
  editor.focus()

  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    
    // 이미지 요소 생성
    const img = document.createElement('img')
    img.src = imageResult.fileUrl
    img.alt = '업로드된 이미지'
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.margin = '10px 0'
    img.setAttribute('data-file-key', imageResult.fileKey)
    
    // 현재 커서 위치에 이미지 삽입
    range.deleteContents()
    range.insertNode(img)
    
    // 이미지 뒤에 커서 위치 설정
    range.setStartAfter(img)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  } else {
    // 선택 영역이 없으면 에디터 끝에 추가
    const img = document.createElement('img')
    img.src = imageResult.fileUrl
    img.alt = '업로드된 이미지'
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.margin = '10px 0'
    img.setAttribute('data-file-key', imageResult.fileKey)
    
    editor.appendChild(img)
  }
}
