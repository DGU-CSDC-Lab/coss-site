import { useState } from 'react'
import { feedbackApi, CreateFeedbackRequest } from '@/lib/api/feedback'
import { useAlert } from '@/hooks/useAlert'
import { useImageUpload } from '@/hooks/useImageUpload'
import Label from '@/components/common/Label'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
import Dropdown from '@/components/common/Dropdown'
import Information from '@/components/common/Information'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import FileUpload from '@/components/admin/FileUpload'
import { UploadResult } from '@/utils/fileUpload'
import { Link } from 'react-router-dom'

const FEEDBACK_TYPES = [
  { value: 'BUG', label: '버그 신고' },
  { value: 'BUG', label: '버그 신고' },
  { value: 'FEATURE', label: '기능 요청' },
  { value: 'IMPROVEMENT', label: '개선 제안' },
  { value: 'OTHER', label: '기타' },
]

export default function FeedbackPage() {
  const [submitting, setSubmitting] = useState(false)
  const [files, setFiles] = useState<UploadResult[]>([])
  const [resetKey, setResetKey] = useState(0)
  const [formData, setFormData] = useState<CreateFeedbackRequest>({
    title: '',
    content: '',
    type: 'BUG',
    imageUrls: [],
  })

  const alert = useAlert()

  const {
    imageUrl,
    uploading: imageUploading,
    handleImageChange,
    reset: resetImage,
  } = useImageUpload({
    ownerType: 'feedback',
    ownerId: 'feedback-temp',
    onError: error => {
      alert.error('이미지 업로드 중 오류가 발생했습니다.')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.content.trim()) {
      alert.error('제목과 내용을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      await feedbackApi.create(formData)
      alert.success('건의사항이 개발자에게 전달되었습니다.')
      setFormData({ title: '', content: '', type: 'BUG', imageUrls: [] })
      setFiles([])
      setResetKey(prev => prev + 1)
    } catch (error) {
      alert.error('건의사항 전달에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls?.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-heading-24 text-text">개발자에게 건의</h1>

      <Information type="info">
        버그 신고, 기능 요청, 개선 제안 등 시스템 발전을 위한 소중한 의견을
        개발자에게 직접 전달할 수 있습니다.
      </Information>

      <div className="relative rounded-lg w-full max-w-2xl overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label required={true} className="mb-2">
              유형
            </Label>
            <Dropdown
              value={formData.type}
              onChange={value =>
                setFormData(prev => ({ ...prev, type: value as any }))
              }
              options={FEEDBACK_TYPES}
              size="lg"
            />
          </div>

          <div>
            <Label required={true} className="mb-2">
              제목
            </Label>
            <Input
              value={formData.title}
              onChange={value =>
                setFormData(prev => ({ ...prev, title: value }))
              }
              placeholder="건의사항 제목을 입력하세요"
              required
              size="lg"
              className="w-full"
            />
          </div>

          <div>
            <Label required={true} className="mb-2">
              내용
            </Label>
            <Textarea
              value={formData.content}
              onChange={value =>
                setFormData(prev => ({ ...prev, content: value }))
              }
              placeholder="건의사항 내용을 상세히 입력하세요"
              rows={6}
              required
              size="lg"
              className="w-full"
            />
          </div>

            <div className="space-y-2">
              <Label className="mb-2" optional={true}>
                파일 등록
              </Label>
              <FileUpload
                key={resetKey}
                initialFiles={files}
                onFilesChange={setFiles}
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
                ownerType="feedback"
                ownerId={'feeedback-temp'}
              />
              {formData.imageUrls && formData.imageUrls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`첨부 이미지 ${index + 1}`}
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          <div className="flex gap-2 pt-4">
            <Link to="/admin">
              <Button
                type="button"
                variant="cancel"
                className="flex-1"
                size="lg"
                radius="md"
              >
                취소
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={
                submitting ||
                formData.title.trim() === '' ||
                formData.content.trim() === ''
              }
              variant="info"
              className="flex-1"
              size="lg"
              radius="md"
            >
              {submitting ? <LoadingSpinner size="sm" /> : '건의'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
