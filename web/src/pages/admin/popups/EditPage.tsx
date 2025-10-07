import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { popupsApi, UpdatePopupRequest } from '@/lib/api/popups'
import { useImageUpload } from '@/hooks/useImageUpload'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
import Label from '@/components/common/Label'
import Checkbox from '@/components/common/Checkbox'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'

export default function AdminPopupsEditPage() {
  const params = useParams()
  const navigate = useNavigate()
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    linkUrl: '',
    startDate: '',
    endDate: '',
    isActive: true,
  })

  const {
    imageUrl,
    uploading: imageUploading,
    handleImageChange,
  } = useImageUpload({
    onError: (error) => {
      alert.error('이미지 업로드 중 오류가 발생했습니다.')
    }
  })

  useEffect(() => {
    if (params.id) {
      loadPopup()
    }
  }, [params.id])

  const loadPopup = async () => {
    try {
      setInitialLoading(true)
      const popup = await popupsApi.getPopup(params.id as string)
      setFormData({
        title: popup.title,
        content: popup.content,
        linkUrl: popup.linkUrl || '',
        startDate: popup.startDate,
        endDate: popup.endDate,
        isActive: popup.isActive,
      })
    } catch (error) {
      console.error('Failed to load popup:', error)
      alert.error('팝업 정보를 불러올 수 없습니다.')
      navigate('/admin/popups')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert.error('제목을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const popupData: UpdatePopupRequest = {
        title: formData.title,
        content: formData.content,
        imageUrl: imageUrl || undefined,
        linkUrl: formData.linkUrl || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate,
        isActive: formData.isActive,
      }

      await popupsApi.updatePopup(params.id as string, popupData)
      alert.success('팝업이 수정되었습니다.')
      navigate('/admin/popups')
    } catch (error) {
      console.error('Failed to update popup:', error)
      alert.error('팝업 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between gap-4 p-6">
        <Title>팝업 수정</Title>
        <Link to="/admin/popups">
          <Button variant="delete" size="md" radius="md">
            나가기
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label required={true} className="mb-2">
                  제목
                </Label>
                <Input
                  type="text"
                  value={formData.title}
                  onChange={value => setFormData({ ...formData, title: value })}
                  placeholder="팝업 제목을 입력하세요"
                  className="w-full"
                  size="lg"
                  required
                />
              </div>

              <div>
                <Label className="mb-2" optional={true}>
                  링크 URL
                </Label>
                <Input
                  type="url"
                  value={formData.linkUrl}
                  onChange={value => setFormData({ ...formData, linkUrl: value })}
                  placeholder="https://example.com"
                  className="w-full"
                  size="lg"
                />
              </div>
            </div>

            <div>
              <Label required={true} className="mb-2">
                내용
              </Label>
              <Textarea
                value={formData.content}
                onChange={value => setFormData({ ...formData, content: value })}
                placeholder="팝업 내용을 입력하세요"
                rows={6}
                size="lg"
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label required={true} className="mb-2">
                  시작일
                </Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={value => setFormData({ ...formData, startDate: value })}
                  className="w-full"
                  size="lg"
                  required
                />
              </div>

              <div>
                <Label required={true} className="mb-2">
                  종료일
                </Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={value => setFormData({ ...formData, endDate: value })}
                  className="w-full"
                  size="lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2" optional={true}>
                  이미지
                </Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                />
                {imageUploading && <p className="mt-2 text-sm text-gray-600">업로드 중...</p>}
              </div>

              <div className="flex items-center pt-8">
                <Checkbox
                  checked={formData.isActive}
                  onChange={checked => setFormData({ ...formData, isActive: checked })}
                  label="활성화"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Link to="/admin/popups">
              <Button variant="cancel" radius="md" size="md">취소</Button>
            </Link>
            <Button type="submit" variant="info" radius="md" size="md" disabled={loading}>
              {loading ? '수정 중...' : '팝업 수정'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
