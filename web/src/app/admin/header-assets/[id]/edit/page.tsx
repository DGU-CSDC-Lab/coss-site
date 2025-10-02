'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { headerAssetsApi, HeaderAsset, UpdateHeaderAssetRequest } from '@/lib/api/headerAssets'
import { uploadImage } from '@/utils/fileUpload'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
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
    logo: '로고',
    banner: '배너',
    background: '배경',
    announcement: '공지',
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/header-assets">
          <Button variant="secondary" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
        <Title>헤더 에셋 수정</Title>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <h2 className="font-body-18-medium text-gray-900">기본 정보</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                타입
              </label>
              <div className="px-4 py-3 bg-gray-100 rounded-md font-body-18-medium text-gray-900">
                {typeLabels[asset.type]}
              </div>
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                제목 *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="제목을 입력하세요"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                이미지
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
              />
              {imageUploading && (
                <p className="mt-2 font-caption-14 text-gray-600">업로드 중...</p>
              )}
              {formData.imageUrl && (
                <div className="mt-3">
                  <p className="font-caption-14 text-gray-600 mb-2">현재 이미지:</p>
                  <img
                    src={formData.imageUrl}
                    alt="현재 이미지"
                    className="w-full max-w-xs h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                링크 URL
              </label>
              <Input
                type="url"
                value={formData.linkUrl}
                onChange={e => setFormData({ ...formData, linkUrl: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                표시 순서
              </label>
              <Input
                type="number"
                value={formData.displayOrder}
                onChange={e => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                min="1"
              />
            </div>

            <div className="flex items-center gap-3 pt-8">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="font-body-18-medium text-gray-900">
                활성화
              </label>
            </div>
          </div>

          <div>
            <label className="block font-body-18-medium text-gray-900 mb-3">
              텍스트 내용
            </label>
            <textarea
              value={formData.textContent}
              onChange={e => setFormData({ ...formData, textContent: e.target.value })}
              placeholder="텍스트 내용을 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 resize-vertical"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                시작일
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900"
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                종료일
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Link href="/admin/header-assets">
            <Button variant="secondary">취소</Button>
          </Link>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? '수정 중...' : '에셋 수정'}
          </Button>
        </div>
      </form>
    </div>
  )
}
