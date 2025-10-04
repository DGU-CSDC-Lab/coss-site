'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  schedulesApi,
  Schedule,
  UpdateScheduleRequest,
} from '@/lib/api/schedules'

export default function EditSchedulePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    category: '',
    isAllDay: false,
  })

  useEffect(() => {
    if (params.id) {
      fetchSchedule(params.id as string)
    }
  }, [params.id])

  const fetchSchedule = async (id: string) => {
    try {
      setInitialLoading(true)
      const scheduleData = await schedulesApi.getSchedule(id)
      setSchedule(scheduleData)

      // 날짜 형식 변환
      const formatDateTime = (dateStr: string, isAllDay: boolean) => {
        const date = new Date(dateStr)
        if (isAllDay) {
          return date.toISOString().split('T')[0]
        } else {
          return date.toISOString().slice(0, 16)
        }
      }

      setFormData({
        title: scheduleData.title,
        description: scheduleData.description || '',
        startDate: formatDateTime(
          scheduleData.startDate,
          scheduleData.isAllDay || false
        ),
        endDate: scheduleData.endDate
          ? formatDateTime(scheduleData.endDate, scheduleData.isAllDay || false)
          : '',
        location: scheduleData.location || '',
        category: scheduleData.category || '',
        isAllDay: scheduleData.isAllDay || false,
      })
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
      alert('일정을 불러올 수 없습니다.')
      router.push('/admin/schedules')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }

    if (!formData.startDate) {
      alert('시작일을 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      const scheduleData: UpdateScheduleRequest = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        location: formData.location || undefined,
        category: formData.category || undefined,
        isAllDay: formData.isAllDay,
      }

      await schedulesApi.updateSchedule(params.id as string, scheduleData)
      alert('일정이 수정되었습니다.')
      router.push('/admin/schedules')
    } catch (error) {
      console.error('Failed to update schedule:', error)
      alert('일정 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return <div className="flex justify-center py-8">로딩 중...</div>
  }

  if (!schedule) {
    return <div className="text-center py-8">일정을 찾을 수 없습니다.</div>
  }

  return (
    <div className="w-full max-w-full px-4 sm:px-6 py-8 overflow-x-hidden">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/schedules"
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-caption-14 hover:bg-gray-200"
        >
          ← 목록으로
        </Link>
        <h1 className="font-heading-32 text-text">일정 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <div className="bg-white border border-surface rounded-lg p-8 space-y-6">
          <h2 className="font-heading-24 text-text">기본 정보</h2>

          <div>
            <label className="block font-body-16-medium text-text mb-3">
              제목 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="일정 제목을 입력하세요"
              className="w-full px-4 py-3 border border-surface rounded-md font-body-18-regular"
              required
            />
          </div>

          <div>
            <label className="block font-body-16-medium text-text mb-3">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="일정에 대한 상세 설명을 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border border-surface rounded-md font-body-16-regular resize-vertical"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-16-medium text-text mb-3">
                카테고리
              </label>
              <select
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border border-surface rounded-md font-body-16-regular"
              >
                <option value="">카테고리 선택</option>
                <option value="academic">학사</option>
                <option value="exam">시험</option>
                <option value="event">행사</option>
                <option value="holiday">휴일</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div>
              <label className="block font-body-16-medium text-text mb-3">
                장소
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={e =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="장소를 입력하세요"
                className="w-full px-4 py-3 border border-surface rounded-md font-body-16-regular"
              />
            </div>
          </div>
        </div>

        {/* 날짜 및 시간 */}
        <div className="bg-white border border-surface rounded-lg p-8 space-y-6">
          <h2 className="font-heading-24 text-text">날짜 및 시간</h2>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="isAllDay"
              checked={formData.isAllDay}
              onChange={e =>
                setFormData({ ...formData, isAllDay: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label htmlFor="isAllDay" className="font-body-16-medium text-text">
              종일 일정
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-16-medium text-text mb-3">
                시작일 *
              </label>
              <input
                type={formData.isAllDay ? 'date' : 'datetime-local'}
                value={formData.startDate}
                onChange={e =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-surface rounded-md font-body-16-regular"
                required
              />
            </div>

            <div>
              <label className="block font-body-16-medium text-text mb-3">
                종료일
              </label>
              <input
                type={formData.isAllDay ? 'date' : 'datetime-local'}
                value={formData.endDate}
                onChange={e =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-surface rounded-md font-body-16-regular"
              />
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-4 justify-end pt-4">
          <Link
            href="/admin/schedules"
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-md font-body-16-medium hover:bg-gray-200"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-pri-500 text-white rounded-md font-body-16-medium hover:bg-pri-600 disabled:opacity-50"
          >
            {loading ? '수정 중...' : '일정 수정'}
          </button>
        </div>
      </form>
    </div>
  )
}
