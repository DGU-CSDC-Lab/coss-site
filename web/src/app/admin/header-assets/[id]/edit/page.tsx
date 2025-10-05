'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  headerAssetsApi,
  HeaderAsset,
  UpdateHeaderAssetRequest,
  HeaderAssetType,
} from '@/lib/api/headerAssets'
import { uploadImage } from '@/utils/fileUpload'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Label from '@/components/common/Label'
import Textarea from '@/components/common/Textarea'
import Checkbox from '@/components/common/Checkbox'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function EditHeaderAssetPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [asset, setAsset] = useState<HeaderAsset | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkUrl: '',
    textContent: '',
    isActive: true,
    displayOrder: 1,
    startDate: '',
    endDate: '',
  })
  const [imageUploading, setImageUploading] = useState(false)

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
        textContent: assetData.textContent || '',
        isActive: assetData.isActive,
        displayOrder: assetData.displayOrder,
        startDate: assetData.startDate ? assetData.startDate.slice(0, 16) : '',
        endDate: assetData.endDate ? assetData.endDate.slice(0, 16) : '',
      })
    } catch (error) {
      console.error('Failed to fetch header asset:', error)
      alert('헤더 에셋 정보를 불러올 수 없습니다.')
      router.push('/admin/header-assets')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageUploading(true)
    try {
      const result = await uploadImage(file)
      setFormData({ ...formData, imageUrl: result.fileUrl })
    } catch (error) {
      console.error('Image upload failed:', error)
      alert('이미지 업로드 중 오류가 발생했습니다.')
    } finally {
      setImageUploading(false)
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
        textContent: formData.textContent || undefined,
        isActive: formData.isActive,
        displayOrder: formData.displayOrder,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
      }

      await headerAssetsApi.updateHeaderAsset(params.id as string, assetData)
      alert('헤더 에셋이 수정되었습니다.')
      router.push('/admin/header-assets')
    } catch (error) {
      console.error('Failed to update header asset:', error)
      alert('헤더 에셋 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="w-full">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  if (!asset) {
    return (
      <div className="w-full">
        <div className="text-center py-8 font-caption-14 text-gray-600">
          헤더 에셋을 찾을 수 없습니다.
        </div>
      </div>
    )
  }

  const typeLabels = {
    [HeaderAssetType.LOGO]: '로고',
    [HeaderAssetType.BANNER]: '배너',
    [HeaderAssetType.BACKGROUND]: '배경',
    [HeaderAssetType.ANNOUNCEMENT]: '공지사항',
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between gap-4 p-6">
        <Title>헤더 에셋 수정</Title>
        <Link href="/admin/header-assets">
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
                <Label className="mb-2">
                  타입
                </Label>
                <div className="px-4 py-3 bg-gray-100 rounded-md font-body-18-medium text-gray-900">
                  {typeLabels[asset.type]}
                </div>
              </div>

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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2">
                  이미지
                </Label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                />
                {imageUploading && (
                  <p className="mt-2 font-caption-14 text-gray-600">
                    업로드 중...
                  </p>
                )}
                {formData.imageUrl && (
                  <div className="mt-3">
                    <p className="font-caption-14 text-gray-600 mb-2">
                      미리보기:
                    </p>
                    <Image
                      src={formData.imageUrl}
                      alt="미리보기"
                      width={320}
                      height={128}
                      className="w-full max-w-xs h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-2">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2">
                  표시 순서
                </Label>
                <Input
                  type="number"
                  value={formData.displayOrder.toString()}
                  onChange={value =>
                    setFormData({
                      ...formData,
                      displayOrder: parseInt(value) || 1,
                    })
                  }
                  min="1"
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

            <div>
              <Label className="mb-2">
                텍스트 내용
              </Label>
              <Textarea
                value={formData.textContent}
                onChange={value =>
                  setFormData({ ...formData, textContent: value })
                }
                placeholder="텍스트 내용을 입력하세요"
                rows={4}
                className="w-full"
                size="lg"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2">
                  시작일
                </Label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={e =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900"
                />
              </div>

              <div>
                <Label className="mb-2">
                  종료일
                </Label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={e =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Link href="/admin/header-assets">
              <Button variant="cancel" radius="md" size="md">취소</Button>
            </Link>
            <Button type="submit" variant="info" radius="md" size="md" disabled={loading}>
              {loading ? '수정 중...' : '에셋 수정'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
