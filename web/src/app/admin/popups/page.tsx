'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { popupsApi, PopupResponse } from '@/lib/api/popups'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'

export default function PopupsPage() {
  const [popups, setPopups] = useState<PopupResponse[]>([])
  const [loading, setLoading] = useState(true)
  const alert = useAlert()

  const loadPopups = async () => {
    try {
      setLoading(true)
      const response = await popupsApi.getPopups()
      setPopups((response as any).items)
    } catch (error) {
      console.error('Failed to load popups:', error)
      alert.error('팝업 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      await popupsApi.deletePopup(id)
      alert.success('팝업이 삭제되었습니다.')
      loadPopups()
    } catch (error) {
      console.error('Failed to delete popup:', error)
      alert.error('팝업 삭제에 실패했습니다.')
    }
  }

  useEffect(() => {
    loadPopups()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between gap-4 p-6">
        <Title>팝업 관리</Title>
        <Link href="/admin/popups/create">
          <Button variant="info" size="md" radius="md">
            새 팝업 추가
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {popups.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">등록된 팝업이 없습니다.</p>
            <Link href="/admin/popups/create">
              <Button variant="info" size="md" radius="md">
                첫 번째 팝업 추가하기
              </Button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    제목
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    생성일
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {popups.map((popup) => (
                  <tr key={popup.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {popup.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(popup.startDate).toLocaleDateString()} ~{' '}
                        {new Date(popup.endDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          popup.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {popup.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(popup.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2 justify-end">
                        <Link href={`/admin/popups/${popup.id}/edit`}>
                          <Button variant="info" size="sm" radius="md">
                            수정
                          </Button>
                        </Link>
                        <Button
                          variant="delete"
                          size="sm"
                          radius="md"
                          onClick={() => handleDelete(popup.id)}
                        >
                          삭제
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
