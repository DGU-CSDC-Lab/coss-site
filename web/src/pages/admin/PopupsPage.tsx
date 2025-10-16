import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { popupsApi, PopupResponse } from '@/lib/api/popups'
import { PagedResponse } from '@/lib/apiClient'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import ConfirmModal from '@/components/common/ConfirmModal'
import { useAlert } from '@/hooks/useAlert'

export default function PopupsPage() {
  const [popups, setPopups] = useState<PagedResponse<PopupResponse> | null>(null)
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [isActiveFilter, setIsActiveFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; popup: PopupResponse | null }>({
    isOpen: false,
    popup: null,
  })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const alert = useAlert()

  const activeOptions = [
    { value: '', label: '전체 상태' },
    { value: 'true', label: '활성' },
    { value: 'false', label: '비활성' },
  ]

  useEffect(() => {
    fetchPopups()
  }, [currentPage])

  const fetchPopups = async () => {
    try {
      setLoading(true)
      const response = await popupsApi.getPopups({
        isActive: isActiveFilter ? isActiveFilter === 'true' : undefined,
        page: currentPage,
        size: 20,
      })
      setPopups(response as PagedResponse<PopupResponse>)
    } catch (error) {
      alert.error('팝업 목록을 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPopups()
  }

  const handleDelete = async () => {
    if (!deleteModal.popup) return

    try {
      setDeleteLoading(true)
      await popupsApi.deletePopup(deleteModal.popup.id)
      alert.success('팝업이 삭제되었습니다.')
      setDeleteModal({ isOpen: false, popup: null })
      fetchPopups()
    } catch (error) {
      alert.error('팝업 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const toggleActive = async (popup: PopupResponse) => {
    try {
      await popupsApi.updatePopup(popup.id, { isActive: !popup.isActive })
      alert.success(`팝업이 ${!popup.isActive ? '활성화' : '비활성화'}되었습니다.`)
      fetchPopups()
    } catch (error) {
      alert.error('상태 변경 중 오류가 발생했습니다.')
    }
  }

  const totalPages = popups ? Math.ceil((popups.meta?.totalElements || 0) / 20) : 0

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title>팝업 관리</Title>
        <Link to="/admin/popups/create">
          <Button variant="info" radius="md" size="md">새 팝업 추가</Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체{' '}
          <span className="text-pri-500">{popups?.meta?.totalElements || 0}</span>{' '}
          건
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            type="text"
            placeholder="팝업 제목 검색"
            value={keyword}
            onChange={(value) => setKeyword(value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full sm:w-60"
            size="md"
          />
          <Dropdown
            value={isActiveFilter}
            onChange={setIsActiveFilter}
            options={activeOptions}
            size="md"
            className="w-24"
          />
          <Button
            variant="point_2"
            radius="md"
            size="md"
            onClick={handleSearch}
          >
            검색
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-info-100">
        <table className="w-full min-w-[800px]">
          <thead className="bg-info-50 border-b border-info-100">
            <tr>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                제목
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                기간
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
            {popups && popups.items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center font-caption-14 text-gray-600"
                >
                  등록된 팝업이 없습니다.
                </td>
              </tr>
            ) : (
              popups?.items.map((popup) => (
                <tr key={popup.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-body-14-medium text-gray-900">
                      {popup.title}
                    </div>
                    {popup.content && (
                      <div className="font-caption-14 text-gray-600 line-clamp-1">
                        {popup.content}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {new Date(popup.startDate).toLocaleDateString()} ~{' '}
                    {new Date(popup.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                        popup.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {popup.isActive ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {new Date(popup.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => toggleActive(popup)}
                        className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                          popup.isActive
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {popup.isActive ? '비활성화' : '활성화'}
                      </button>
                      <Link to={`/admin/popups/${popup.id}`}>
                        <Button variant="unstyled" size="sm" radius="md">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="delete"
                        size="sm"
                        radius="md"
                        onClick={() => setDeleteModal({ isOpen: true, popup })}
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
        onClose={() => setDeleteModal({ isOpen: false, popup: null })}
        onConfirm={handleDelete}
        title="팝업 삭제"
        message={`"${deleteModal.popup?.title}" 팝업을 삭제하시겠습니까?`}
        warningMessage="삭제된 데이터는 복구할 수 없습니다."
        confirmText="삭제"
        loading={deleteLoading}
      />
    </div>
  )
}
