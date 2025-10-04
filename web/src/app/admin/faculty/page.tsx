'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { facultyApi, Faculty } from '@/lib/api/faculty'
import { PagedResponse } from '@/lib/apiClient'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AdminFacultyPage() {
  const [faculty, setFaculty] = useState<PagedResponse<Faculty> | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
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
      console.error('Failed to fetch faculty:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 교원을 삭제하시겠습니까?`)) return

    try {
      await facultyApi.deleteFaculty(id)
      alert('교원이 삭제되었습니다.')
      fetchFaculty()
    } catch (error) {
      console.error('Failed to delete faculty:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const totalElements = faculty?.meta?.totalElements || 0
  const totalPages = faculty?.meta?.totalPages || 1
  const currentPage = faculty?.meta?.page || 0

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
        <Link href="/admin/faculty/create">
          <Button variant="primary">새 교원 추가</Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체 <span className="text-pri-500">{totalElements}</span> 명
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
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
          <tbody>
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
                        {member.profileImage ? (
                          <Image
                            src={member.profileImage}
                            alt={member.name}
                            width={48}
                            height={48}
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
                      <Link href={`/admin/faculty/${member.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
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
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPage(prev => Math.max(prev - 1, 0))}
          disabled={currentPage === 0}
        >
          이전
        </Button>

        {Array.from({ length: totalPages }, (_, idx) => (
          <Button
            key={idx}
            variant={idx === currentPage ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setPage(idx)}
          >
            {idx + 1}
          </Button>
        ))}

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
        >
          다음
        </Button>
      </div>
    </div>
  )
}
