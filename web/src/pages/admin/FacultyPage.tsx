import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { facultyApi, Faculty } from '@/lib/api/faculty'
import { PagedResponse } from '@/lib/apiClient'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<PagedResponse<Faculty> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const alert = useAlert()

  const size = 10

  useEffect(() => {
    fetchFaculty()
  }, [page])

  const fetchFaculty = async () => {
    try {
      setLoading(true)
      const response = await facultyApi.getFaculty({ page, size })
      setFaculty(response)
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 교원을 삭제하시겠습니까?`)) return

    try {
      await facultyApi.deleteFaculty(id)
      alert.success('교원이 삭제되었습니다.')
      fetchFaculty()
    } catch (error) {
      alert.error('삭제 중 오류가 발생했습니다.')
    }
  }

  const totalElements = faculty?.meta?.totalElements || 0
  const totalPages = faculty?.meta?.totalPages || 1
  const currentPage = page

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
        <Title>교원 관리</Title>
        <Link to="/admin/faculty/create">
          <Button variant="info" radius="md" size="md">새 교원 추가</Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체 <span className="text-pri-500">{totalElements}</span> 명
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-info-100">
        <table className="w-full min-w-[800px]">
          <thead className="bg-info-50 border-b border-info-100">
            <tr>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                이름
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                직책
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-48">
                이메일
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                전화번호
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-24">
                연구실
              </th>
              <th className="px-4 py-3 text-center font-body-18-medium text-gray-900 w-32">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-info-100">
            {faculty?.items?.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center font-caption-14 text-gray-600"
                >
                  등록된 교원이 없습니다.
                </td>
              </tr>
            ) : (
              faculty?.items?.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                        {member.profileImageUrl ? (
                          <img
                            src={member.profileImageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <span className="font-caption-14 text-gray-600">
                              사진
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="font-body-18-medium text-gray-900">
                        {member.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {member.jobTitle || '-'}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {member.email || '-'}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {member.phoneNumber || '-'}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {member.office || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Link to={`/admin/faculty/${member.id}`}>
                        <Button variant="unstyled" size="sm" radius="md">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="delete"
                        size="sm"
                        radius="md"
                        onClick={() => handleDelete(member.id, member.name)}
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
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
        >
          <img
            src="/assets/icon/chevron_left.svg"
            alt="이전"
            width={16}
            height={16}
          />
        </button>

        {/* 페이지 번호 */}
        {Array.from(
          { length: Math.min(5, totalPages || 1) },
          (_, i) => {
            const pageNum = i + 1
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 font-caption-14 rounded ${
                  page === pageNum
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
        {totalPages > 5 && (
          <>
            <span className="px-2 text-gray-900">...</span>
            <button
              onClick={() => setPage(totalPages)}
              className="px-3 py-2 font-caption-14 text-text hover:text-pri-500"
            >
              {totalPages}
            </button>
          </>
        )}

        {/* 다음 버튼 */}
        <button
          onClick={() => setPage(Math.min(totalPages || 1, page + 1))}
          disabled={page === (totalPages || 1)}
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
    </div>
  )
}
