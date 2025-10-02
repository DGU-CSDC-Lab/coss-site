'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { headerAssetsApi, HeaderAsset } from '@/lib/api/headerAssets'
import Button from '@/components/common/Button'
import Title from '@/components/common/Title'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'

export default function HeaderAssetsPage() {
  const [assets, setAssets] = useState<HeaderAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<
    'all' | 'logo' | 'banner' | 'background' | 'announcement'
  >('all')

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await headerAssetsApi.getHeaderAssets({ size: 50 })
      setAssets(response.items)
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await headerAssetsApi.updateHeaderAsset(id, { isActive: !isActive })
      fetchAssets()
    } catch (error) {
      console.error('Failed to toggle asset:', error)
    }
  }

  const deleteAsset = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      try {
        await headerAssetsApi.deleteHeaderAsset(id)
        fetchAssets()
      } catch (error) {
        console.error('Failed to delete asset:', error)
      }
    }
  }

  const filteredAssets =
    selectedType === 'all'
      ? assets
      : assets.filter(asset => asset.type === selectedType)

  const typeLabels = {
    logo: '로고',
    banner: '배너',
    background: '배경',
    announcement: '공지',
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title>헤더 에셋 관리</Title>
          <p className="font-caption-14 text-gray-600 mt-1">
            홈페이지 헤더 요소들을 관리하세요
          </p>
        </div>
        <Link href="/admin/header-assets/create">
          <Button variant="info">
            <PlusIcon className="w-5 h-5 mr-2" />새 에셋 추가
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {(
            ['all', 'logo', 'banner', 'background', 'announcement'] as const
          ).map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-md font-body-18-medium transition-colors ${
                selectedType === type
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type === 'all' ? '전체' : typeLabels[type]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-body-18-medium text-gray-900 mb-2">
            에셋이 없습니다
          </h3>
          <p className="font-caption-14 text-gray-600 mb-6">
            첫 번째 헤더 에셋을 추가해보세요.
          </p>
          <Link href="/admin/header-assets/create">
            <Button variant="info">에셋 추가하기</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map(asset => (
            <div
              key={asset.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative">
                {asset.imageUrl ? (
                  <Image
                    src={asset.imageUrl}
                    alt={asset.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <div className="text-center text-gray-600">
                      <h3 className="font-body-18-medium">{asset.title}</h3>
                      {asset.textContent && (
                        <p className="font-caption-14 mt-1">
                          {asset.textContent}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-1 font-caption-14 rounded-full ${
                      asset.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {asset.isActive ? '활성' : '비활성'}
                  </span>
                </div>

                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 font-caption-14 bg-blue-100 text-blue-800 rounded-full">
                    {typeLabels[asset.type]}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-body-18-medium text-gray-900 mb-1 truncate">
                  {asset.title}
                </h3>
                <p className="font-caption-14 text-gray-600 mb-3">
                  순서: {asset.displayOrder}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(asset.id, asset.isActive)}
                      className={`p-1.5 rounded-md transition-colors ${
                        asset.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={asset.isActive ? '비활성화' : '활성화'}
                    >
                      {asset.isActive ? (
                        <EyeIcon className="w-4 h-4" />
                      ) : (
                        <EyeSlashIcon className="w-4 h-4" />
                      )}
                    </button>

                    <Link href={`/admin/header-assets/${asset.id}/edit`}>
                      <button
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="수정"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                    </Link>

                    <button
                      onClick={() => deleteAsset(asset.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="삭제"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="font-caption-14 text-gray-600">
                    {new Date(asset.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
