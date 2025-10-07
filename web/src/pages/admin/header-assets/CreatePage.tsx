import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  headerAssetsApi,
  CreateHeaderAssetRequest,
} from '@/lib/api/headerAssets'
import { useImageUpload } from '@/hooks/useImageUpload'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Label from '@/components/common/Label'
import Checkbox from '@/components/common/Checkbox'

export default function AdminHeaderAssetsCreatePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    linkUrl: '',
    isActive: true,
  })

  const {
    imageUrl,
    uploading: imageUploading,
    handleImageChange,
  } = useImageUpload({
    onError: (error) => {
      alert('이미지 업로드 중 오류가 발생했습니다.')
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (!imageUrl.trim()) {
      alert('이미지를 업로드해주세요.')
      return
    }

    if (!formData.linkUrl.trim()) {
      alert('링크 URL을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const assetData: CreateHeaderAssetRequest = {
        title: formData.title,
        imageUrl: imageUrl,
        linkUrl: formData.linkUrl,
        isActive: formData.isActive,
      }

      await headerAssetsApi.createHeaderAsset(assetData)
      alert('헤더 에셋이 생성되었습니다.')
      navigate('/admin/header-assets')
    } catch (error) {
      console.error('Failed to create header asset:', error)
      alert('헤더 에셋 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between gap-4 p-6">
        <Title>새 헤더 에셋 추가</Title>
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
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-body-18-medium text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:text-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                  required
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
                      className="w-full max-w-xs h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center pt-8">
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
              {loading ? '생성 중...' : '에셋 생성'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
