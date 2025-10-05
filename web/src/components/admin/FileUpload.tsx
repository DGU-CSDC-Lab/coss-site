'use client'

import { useState, useRef } from 'react'
import {
  uploadFile,
  UploadResult,
  FileUploadError,
  formatFileSize,
} from '@/utils/fileUpload'
import Button from '../common/Button'

interface FileUploadProps {
  onFilesChange: (files: UploadResult[]) => void
  maxFiles?: number
  accept?: string
  maxSize?: number
}

export default function FileUpload({
  onFilesChange,
  maxFiles = 5,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024,
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadResult[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (selectedFiles: FileList) => {
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`)
      return
    }

    setUploading(true)
    setProgress(0)

    try {
      const newFiles: UploadResult[] = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]

        try {
          const result = await uploadFile(file, {
            maxSize,
            onProgress: fileProgress => {
              const totalProgress =
                ((i + fileProgress / 100) / selectedFiles.length) * 100
              setProgress(Math.round(totalProgress))
            },
          })

          newFiles.push(result)
        } catch (error) {
          if (error instanceof FileUploadError) {
            alert(`${file.name}: ${error.message}`)
          } else {
            alert(`${file.name}: 업로드 실패`)
          }
        }
      }

      const updatedFiles = [...files, ...newFiles]
      setFiles(updatedFiles)
      onFilesChange(updatedFiles)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  /**
   *
   * @param index 삭제할 파일의 인덱스
   */
  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  /**
   *
   * @param e 드래그 앤 드롭 이벤트
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  /**
   *
   * @param e 드래그 오버 이벤트 (파일이 드래그되어 올라올 때)
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  /**
   *
   * @param e 드래그 리브 이벤트 (파일이 드래그되어 올라왔다가 나갈 때)
   */
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  return (
    <div>
      {/* 업로드 영역 */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-pri-500 bg-pri-50'
            : 'border-surface hover:border-pri-300'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={e => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="space-y-2">
          <div className="font-body-16-medium text-text">
            파일을 드래그하거나 클릭하여 업로드
          </div>
          <div className="font-caption-14 text-text-light">
            최대 {maxFiles}개, {formatFileSize(maxSize)} 이하
          </div>
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || files.length >= maxFiles}
            size="sm"
            variant="point_2"
            radius="md"
          >
            파일 선택
          </Button>
        </div>
      </div>

      {/* 업로드 진행률 */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between font-caption-14 text-text">
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pri-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* 업로드된 파일 목록 */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="font-body-16-medium text-text">
            업로드된 파일 ({files.length})
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-surface rounded"
              >
                <div className="flex-1">
                  <div className="font-caption-14 text-text">
                    {file.originalName}
                  </div>
                  <div className="font-caption-12 text-text-light">
                    {formatFileSize(file.fileSize)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded font-caption-12"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
