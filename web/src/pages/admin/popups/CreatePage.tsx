import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { popupsApi, CreatePopupRequest, UpdatePopupRequest, Popup } from '@/lib/api/popups'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
import Label from '@/components/common/Label'
import Checkbox from '@/components/common/Checkbox'
import { useAlert } from '@/hooks/useAlert'
import DateInput from '@/components/common/DateInput'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import ExitWarningModal from '@/components/common/ExitWarningModal'

export default function AdminPopupsCreatePage() {
  const navigate = useNavigate()
  const params = useParams()
  const isEdit = !!params.id
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [popup, setPopup] = useState<Popup | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    linkUrl: '',
    startDate: '',
    endDate: '',
    isActive: true,
  })

  const [originalData, setOriginalData] = useState(formData)
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
  const exitWarning = useUnsavedChanges({ hasChanges })

  useEffect(() => {
    if (isEdit && params.id) {
      fetchPopup(params.id)
    }
  }, [isEdit, params.id])

  const fetchPopup = async (id: string) => {
    try {
      setInitialLoading(true)
      const popupData = await popupsApi.getPopup(id)
      setPopup(popupData)
      
      // 날짜를 datetime-local 형식으로 변환
      const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString)
        return date.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm 형식
      }
      
      const data = {
        title: popupData.title,
        content: popupData.content || '',
        linkUrl: popupData.linkUrl || '',
        startDate: formatDateForInput(popupData.startDate),
        endDate: formatDateForInput(popupData.endDate),
        isActive: popupData.isActive,
      }
      setFormData(data)
      setOriginalData(data)
      
      // 기존 이미지는 imageUrl state로 별도 관리
      // if (popupData.imageUrl) {
      //   setImageUrl(popupData.imageUrl)
      // }
    } catch (error) {
      alert.error('팝업 정보를 불러올 수 없습니다.')
      navigate('/admin/popups')
    } finally {
      setInitialLoading(false)
    }
  }

  const {
    imageUrl,
    uploading: imageUploading,
    handleImageChange,
    reset: resetImage,
  } = useImageUpload({
    ownerType: 'popup',
    ownerId: params.id || 'temp',
    onError: error => {
      alert.error('이미지 업로드 중 오류가 발생했습니다.')
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert.error('제목을 입력해주세요.')
      return
    }

    if (!formData.content.trim()) {
      alert.error('내용을 입력해주세요.')
      return
    }

    if (!formData.startDate) {
      alert.error('시작일을 선택해주세요.')
      return
    }

    if (!formData.endDate) {
      alert.error('종료일을 선택해주세요.')
      return
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      alert.error('종료일은 시작일보다 늦어야 합니다.')
      return
    }

    setLoading(true)

    try {
      if (isEdit && params.id) {
        const popupData: UpdatePopupRequest = {
          title: formData.title,
          content: formData.content,
          imageUrl: imageUrl || popup?.imageUrl || undefined,
          linkUrl: formData.linkUrl || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive,
        }

        await popupsApi.updatePopup(params.id, popupData)
        alert.success('팝업이 수정되었습니다.')
      } else {
        const popupData: CreatePopupRequest = {
          title: formData.title,
          content: formData.content,
          imageUrl: imageUrl || undefined,
          linkUrl: formData.linkUrl || undefined,
          startDate: formData.startDate,
          endDate: formData.endDate,
          isActive: formData.isActive,
        }

        await popupsApi.createPopup(popupData)
        alert.success('팝업이 생성되었습니다.')
      }
      navigate('/admin/popups')
    } catch (error) {
      alert.error(`팝업 ${isEdit ? '수정' : '생성'} 중 오류가 발생했습니다.`)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <div className="flex items-center justify-between gap-4 p-6">
          <Title>{isEdit ? '팝업 수정' : '새 팝업 추가'}</Title>
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
                  onChange={value =>
                    setFormData({ ...formData, linkUrl: value })
                  }
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
                <DateInput
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={value =>
                    setFormData({ ...formData, startDate: value })
                  }
                  className="w-full"
                  size="lg"
                  required
                />
              </div>

              <div>
                <Label required={true} className="mb-2">
                  종료일
                </Label>
                <DateInput
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={value =>
                    setFormData({ ...formData, endDate: value })
                  }
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-body-18-medium text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:text-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
                {imageUploading && (
                  <p className="mt-2 text-caption-14 text-gray-600">
                    업로드 중...
                  </p>
                )}
                {imageUrl && (
                  <div className="mt-3">
                    <p className="text-caption-14 text-gray-600 mb-2">
                      미리보기:
                    </p>
                    <img
                      src={imageUrl}
                      alt="미리보기"
                      className="w-full max-w-xs h-auto rounded-md border"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center pt-8 whitespace-nowrap">
                <Checkbox
                  checked={formData.isActive}
                  onChange={checked =>
                    setFormData({ ...formData, isActive: checked })
                  }
                  label="활성화"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Link to="/admin/popups">
              <Button variant="cancel" radius="md" size="md">
                취소
              </Button>
            </Link>
            <Button
              type="submit"
              variant="info"
              radius="md"
              size="md"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="md" /> : isEdit ? '팝업 수정' : '팝업 생성'}
            </Button>
          </div>
        </form>
      </div>
    </div>

    <ExitWarningModal
      isOpen={exitWarning.showExitModal}
      onClose={exitWarning.cancelExit}
      onConfirmExit={exitWarning.confirmExit}
      onSaveDraft={exitWarning.saveDraftAndExit}
      showDraftOption={true}
    />
    </>
  )
}
