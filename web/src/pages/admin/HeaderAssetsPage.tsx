import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { headerAssetsApi, HeaderAsset } from '@/lib/api/headerAssets'
import { PagedResponse } from '@/lib/apiClient'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Dropdown from '@/components/common/Dropdown'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useAlert } from '@/hooks/useAlert'

export default function HeaderAssetsPage() {
  const [assets, setAssets] = useState<PagedResponse<HeaderAsset> | null>(null)
  const [loading, setLoading] = useState(true)
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; asset: HeaderAsset | null }>({
    isOpen: false,
    asset: null,
  })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const alert = useAlert()

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
      alert.error('헤더 배너 목록을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteModal.asset) return

    try {
      setDeleteLoading(true)
      await headerAssetsApi.deleteHeaderAsset(deleteModal.asset.id)
      alert.success('헤더 배너가 삭제되었습니다.')
      setDeleteModal({ isOpen: false, asset: null })
      fetchAssets()
    } catch (error) {
      alert.error('헤더 배너 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const toggleActive = async (asset: HeaderAsset) => {
    try {
      await headerAssetsApi.updateHeaderAsset(asset.id, { isActive: !asset.isActive })
      alert.success(`헤더 배너가 ${!asset.isActive ? '활성화' : '비활성화'}되었습니다.`)
      fetchAssets()
    } catch (error) {
      alert.error('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const totalPages = assets ? Math.ceil((assets.meta?.totalElements || 0) / 20) : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title>헤더 배너 관리</Title>
        <Link to="/admin/header-assets/create">
          <Button variant="info" radius="md" size="md">새 배너 추가</Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체{' '}
          <span className="text-pri-500">{assets?.meta?.totalElements || 0}</span>{' '}
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
                링크 URL
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
                  colSpan={6}
                  className="px-4 py-8 text-center font-caption-14 text-gray-600"
                >
                  등록된 헤더 배너가 없습니다.
                </td>
              </tr>
            ) : (
              assets?.items.map((asset) => (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={asset.imageUrl}
                        alt={asset.title}
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
                    <div className="font-caption-14 text-gray-600 max-w-xs truncate">
                      {asset.linkUrl || '-'}
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
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {new Date(asset.createdAt).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => toggleActive(asset)}
                        className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                          asset.isActive
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {asset.isActive ? '비활성화' : '활성화'}
                      </button>
                      <Link to={`/admin/header-assets/${asset.id}`}>
                        <Button variant="unstyled" size="sm" radius="md">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="delete"
                        size="sm"
                        radius="md"
                        onClick={() => setDeleteModal({ isOpen: true, asset })}
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

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
          >
            <img
              src="/assets/icon/chevron_left.svg"
              alt="이전"
              width={16}
              height={16}
            />
          </button>

          {Array.from(
            { length: Math.min(5, totalPages || 1) },
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

          {totalPages > 5 && (
            <>
              <span className="px-2 text-gray-900">...</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-3 py-2 font-caption-14 text-text hover:text-pri-500"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages || 1, currentPage + 1))}
            disabled={currentPage === (totalPages || 1)}
            className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
          >
            <img
              src="/assets/icon/chevron_right.svg"
              alt="다음"
              width={16}
              height={16}
            />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, asset: null })}
        onConfirm={handleDelete}
        title="헤더 배너 삭제"
        message={`"${deleteModal.asset?.title}" 헤더 배너를 삭제하시겠습니까?`}
        warningMessage="삭제된 데이터는 복구할 수 없습니다."
        confirmText="삭제"
        loading={deleteLoading}
      />
    </div>
  )
}
