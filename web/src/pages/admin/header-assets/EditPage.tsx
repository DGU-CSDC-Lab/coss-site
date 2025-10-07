import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  headerAssetsApi,
  HeaderAsset,
  UpdateHeaderAssetRequest,
} from '@/lib/api/headerAssets'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Label from '@/components/common/Label'
import Checkbox from '@/components/common/Checkbox'
import Title from '@/components/common/Title'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'

export default function AdminHeaderAssetsEditPage() {
  const params = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [asset, setAsset] = useState<HeaderAsset | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    isActive: true,
  })

  useEffect(() => {
    if (params.id) {
      fetchAsset(params.id as string)
    }
  }, [params.id])

  const fetchAsset = async (id: string) => {
    try {
      setInitialLoading(true)
      const assetData = await headerAssetsApi.getHeaderAsset(id)
      setAsset(assetData)
      setFormData({
        title: assetData.title,
        imageUrl: assetData.imageUrl || '',
        linkUrl: assetData.linkUrl || '',
        isActive: assetData.isActive,
      })
    } catch (error) {
      console.error('Failed to fetch header asset:', error)
      alert('헤더 에셋 정보를 불러올 수 없습니다.')
      navigate('/admin/header-assets')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const assetData: UpdateHeaderAssetRequest = {
        title: formData.title,
        imageUrl: formData.imageUrl || undefined,
        linkUrl: formData.linkUrl || undefined,
        isActive: formData.isActive,
      }

      await headerAssetsApi.updateHeaderAsset(params.id as string, assetData)
      alert('헤더 에셋이 수정되었습니다.')
      navigate('/admin/header-assets')
    } catch (error) {
      console.error('Failed to update header asset:', error)
      alert('헤더 에셋 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <EmptyState message="헤더 에셋을 찾을 수 없습니다." />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/header-assets">
          <Button variant="cancel" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
        <Title>헤더 에셋 수정</Title>
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
                  value={formData.title}
                  onChange={value => setFormData({ ...formData, title: value })}
                  placeholder="헤더 에셋 제목을 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>

              <div>
                <Label className="mb-2">이미지 URL</Label>
                <Input
                  value={formData.imageUrl}
                  onChange={value =>
                    setFormData({ ...formData, imageUrl: value })
                  }
                  placeholder="이미지 URL을 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2">링크 URL</Label>
                <Input
                  value={formData.linkUrl}
                  onChange={value =>
                    setFormData({ ...formData, linkUrl: value })
                  }
                  placeholder="링크 URL을 입력하세요"
                  className="w-full"
                  size="lg"
                />
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
              <Button variant="cancel">취소</Button>
            </Link>
            <Button type="submit" variant="info" disabled={loading}>
              {loading ? '수정 중...' : '헤더 에셋 수정'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
