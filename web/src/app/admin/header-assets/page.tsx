'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { headerAssetsApi, HeaderAsset } from '@/lib/api/headerAssets'
import { PagedResponse } from '@/lib/apiClient'
import Button from '@/components/common/Button'
import Title from '@/components/common/Title'
import Dropdown from '@/components/common/Dropdown'
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
  const [assets, setAssets] = useState<PagedResponse<HeaderAsset> | null>(null)
  const [loading, setLoading] = useState(true)
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const activeOptions = [
    { value: '', label: '전체 상태' },
    { value: 'true', label: '활성' },
    { value: 'false', label: '비활성' },
  ]

  useEffect(() => {
    fetchAssets()
  }, [currentPage, isActiveFilter])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await headerAssetsApi.getHeaderAssets({
        isActive: isActiveFilter ? isActiveFilter === 'true' : undefined,
        page: currentPage,
        size: 20,
      })
      setAssets(response)
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
      alert('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const deleteAsset = async (id: string, title: string) => {
    if (confirm(`"${title}" 에셋을 삭제하시겠습니까?`)) {
      try {
        await headerAssetsApi.deleteHeaderAsset(id)
        alert('에셋이 삭제되었습니다.')
        fetchAssets()
      } catch (error) {
        console.error('Failed to delete asset:', error)
        alert('삭제 중 오류가 발생했습니다.')
      }
    }
  }

  const typeLabels = {}

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title>헤더 에셋 관리</Title>
        <Link href="/admin/header-assets/create">
          <Button variant="info" radius="md" size="md">새 에셋 추가</Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체{' '}
          <span className="text-pri-500">{assets?.meta.totalElements || 0}</span>{' '}
          건
        </div>

        <div className="flex flex-wrap gap-2">
          <Dropdown
            value={isActiveFilter}
            onChange={setIsActiveFilter}
            options={activeOptions}
            size="md"
            className="w-24"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-info-100">
        <table className="w-full min-w-[800px]">
          <thead className="bg-info-50 border-b border-info-100">
            <tr>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                미리보기
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                제목
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                상태
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                생성일
              </th>
              <th className="px-4 py-3 text-center font-body-18-medium text-gray-900">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-info-100">
            {assets?.items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center font-caption-14 text-gray-600"
                >
                  헤더 에셋이 없습니다.
                </td>
              </tr>
            ) : (
              assets?.items.map(asset => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                      <Image
                        src={asset.imageUrl}
                        alt={asset.title}
                        width={64}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-body-14-medium text-gray-900">
                      {asset.title}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        asset.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {asset.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-body-14-medium text-gray-600">
                    {new Date(asset.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
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
                        <Button variant="unstyled" size="sm" radius="md">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="delete"
                        size="sm"
                        radius="md"
                        onClick={() => deleteAsset(asset.id, asset.title)}
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-2 mt-8">
        {/* 이전 버튼 */}
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
        >
          <Image
            src="/assets/icon/chevron_left.svg"
            alt="이전"
            width={16}
            height={16}
          />
        </button>

        {/* 페이지 번호 */}
        {assets &&
          Array.from(
            { length: Math.min(5, assets.meta.totalPages || 1) },
            (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 font-caption-14 rounded ${
                    currentPage === pageNum
                      ? 'text-pri-500 font-semibold'
                      : 'text-gray-900 hover:text-pri-500'
                  }`}
                >
                  {pageNum}
                </button>
              )
            }
          )}

        {/* 마지막 페이지 생략 처리 */}
        {assets && assets.meta.totalPages > 5 && (
          <>
            <span className="px-2 text-gray-900">...</span>
            <button
              onClick={() => setCurrentPage(assets.meta.totalPages)}
              className="px-3 py-2 font-caption-14 text-text hover:text-pri-500"
            >
              {assets.meta.totalPages}
            </button>
          </>
        )}

        {/* 다음 버튼 */}
        <button
          onClick={() =>
            setCurrentPage(
              Math.min(assets?.meta.totalPages || 1, currentPage + 1)
            )
          }
          disabled={currentPage === (assets?.meta.totalPages || 1)}
          className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
        >
          <Image
            src="/assets/icon/chevron_right.svg"
            alt="다음"
            width={16}
            height={16}
          />
        </button>
      </div>
    </div>
  )
}
