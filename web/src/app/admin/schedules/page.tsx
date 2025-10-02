'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { schedulesApi, Schedule } from '@/lib/api/schedules'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    fetchSchedules()
  }, [selectedMonth])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const response = await schedulesApi.getSchedules({ month: selectedMonth })
      setSchedules(response)
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 일정을 삭제하시겠습니까?`)) return

    try {
      await schedulesApi.deleteSchedule(id)
      alert('일정이 삭제되었습니다.')
      fetchSchedules()
    } catch (error) {
      console.error('Failed to delete schedule:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

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
        <Title>학사일정 관리</Title>
        <Link href="/admin/schedules/create">
          <Button variant="primary">새 일정 추가</Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체 <span className="text-pri-500">{schedules.length}</span> 건
        </div>

        <div className="flex gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md font-body-18-medium text-gray-900"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                제목
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                시작일
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                종료일
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-24">
                종일
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                장소
              </th>
              <th className="px-4 py-3 text-center font-body-18-medium text-gray-900 w-32">
                관리
              </th>
            </tr>
          </thead>
          <tbody>
            {schedules.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center font-caption-14 text-gray-600">
                  해당 월에 일정이 없습니다.
                </td>
              </tr>
            ) : (
              schedules.map(schedule => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-body-18-medium text-gray-900 mb-1">
                        {schedule.title}
                      </div>
                      {schedule.description && (
                        <div className="font-caption-14 text-gray-600 line-clamp-2">
                          {schedule.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {new Date(schedule.startDate).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {schedule.endDate
                      ? new Date(schedule.endDate).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {schedule.isAllDay ? '종일' : '시간'}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {schedule.location || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Link href={`/admin/schedules/${schedule.id}/edit`}>
                        <Button variant="secondary" size="sm">수정</Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(schedule.id, schedule.title)}
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
    </div>
  )
}
