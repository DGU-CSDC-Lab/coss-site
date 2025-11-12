import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  headerAssetsApi,
  CreateHeaderAssetRequest,
  UpdateHeaderAssetRequest,
  HeaderAsset,
} from '@/lib/api/headerAssets'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Label from '@/components/common/Label'
import Checkbox from '@/components/common/Checkbox'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import ExitWarningModal from '@/components/common/ExitWarningModal'
import { useAlert } from '@/hooks/useAlert'

export default function AdminHeaderAssetsCreatePage() {
  const navigate = useNavigate()
  const params = useParams()
  const isEdit = !!params.id
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [headerAsset, setHeaderAsset] = useState<HeaderAsset | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    linkUrl: '',
    isActive: true,
  })

  const [originalData, setOriginalData] = useState(formData)
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
  const exitWarning = useUnsavedChanges({ hasChanges })

  useEffect(() => {
    if (isEdit && params.id) {
      fetchHeaderAsset(params.id)
    }
  }, [isEdit, params.id])

  const fetchHeaderAsset = async (id: string) => {
    try {
      setInitialLoading(true)
      const headerAssetData = await headerAssetsApi.getHeaderAsset(id)
      setHeaderAsset(headerAssetData)
      const data = {
        title: headerAssetData.title,
        linkUrl: headerAssetData.linkUrl || '',
        isActive: headerAssetData.isActive,
      }
      setFormData(data)
      setOriginalData(data)
    } catch (error) {
      alert.error('헤더 자산 정보를 불러올 수 없습니다.')
      navigate('/admin/header-assets')
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
    onError: (error) => {
      alert.error('이미지 업로드 중 오류가 발생했습니다.')
    }
  })

  // 수정 모드에서 기존 이미지 URL을 imageUrl에 설정
  const [displayImageUrl, setDisplayImageUrl] = useState('')
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    if (headerAsset?.imageUrl && !imageUrl) {
      setDisplayImageUrl(headerAsset.imageUrl)
      setFileName(headerAsset.title || '기존 이미지')
    } else if (imageUrl) {
      setDisplayImageUrl(imageUrl)
    }
  }, [headerAsset?.imageUrl, imageUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert.error('제목을 입력해주세요.')
      return
    }

    if (!imageUrl && !headerAsset?.imageUrl) {
      alert.error('이미지를 업로드해주세요.')
      return
    }

    if (!formData.linkUrl.trim()) {
      alert.error('링크 URL을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      if (isEdit && params.id) {
        const assetData: UpdateHeaderAssetRequest = {
          title: formData.title,
          imageUrl: imageUrl || headerAsset?.imageUrl || '',
          linkUrl: formData.linkUrl,
          isActive: formData.isActive,
        }

        await headerAssetsApi.updateHeaderAsset(params.id, assetData)
        alert.success('헤더 에셋이 수정되었습니다.')
      } else {
        const assetData: CreateHeaderAssetRequest = {
          title: formData.title,
          imageUrl: imageUrl,
          linkUrl: formData.linkUrl,
          isActive: formData.isActive,
        }

        await headerAssetsApi.createHeaderAsset(assetData)
        alert.success('헤더 에셋이 생성되었습니다.')
      }
      navigate('/admin/header-assets')
    } catch (error) {
      alert.error(`헤더 에셋 ${isEdit ? '수정' : '생성'} 중 오류가 발생했습니다.`)
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
          <Title>{isEdit ? '헤더 에셋 수정' : '새 헤더 에셋 추가'}</Title>
          <Link to="/admin/header-assets">
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
                  onChange={value =>
                    setFormData({ ...formData, title: value })
                  }
                  placeholder="제목을 입력하세요"
                  className="w-full"
                  size="lg"
                  required
                />
              </div>

              <div>
                <Label required={true} className="mb-2">
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
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label required={true} className="mb-2">
                  이미지
                </Label>
                <Input
                  type="file"
                  accept="image/*"
                  value={fileName}
                  fileUrl={displayImageUrl}
                  onFileChange={handleImageChange}
                  onChange={setFileName}
                  size="lg"
                  className="w-full"
                />
                {imageUploading && (
                  <p className="mt-2 text-caption-14 text-gray-600">
                    업로드 중...
                  </p>
                )}
                {displayImageUrl && (
                  <div className="mt-3">
                    <p className="text-caption-14 text-gray-600 mb-2">
                      {imageUrl ? '새 이미지 미리보기:' : '현재 이미지:'}
                    </p>
                    <img
                      src={displayImageUrl}
                      alt="미리보기"
                      className="w-full max-w-xs h-32 object-cover rounded-md border"
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
            <Link to="/admin/header-assets">
              <Button variant="cancel" radius="md" size="md">취소</Button>
            </Link>
            <Button type="submit" variant="info" radius="md" size="md" disabled={loading}>
              {loading ? (isEdit ? '수정 중...' : '생성 중...') : (isEdit ? '에셋 수정' : '에셋 생성')}
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
