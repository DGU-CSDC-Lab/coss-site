'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { schedulesApi, CreateScheduleRequest } from '@/lib/api/schedules'
import Input from '@/components/common/Input'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import Dropdown from '@/components/common/Dropdown'

export default function CreateSchedulePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    category: '',
    isAllDay: false,
  })

  const categoryOptions = [
    { value: '', label: '카테고리 선택' },
    { value: 'academic', label: '학사' },
    { value: 'exam', label: '시험' },
    { value: 'event', label: '행사' },
    { value: 'holiday', label: '휴일' },
    { value: 'other', label: '기타' },
  ]

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
      const scheduleData: CreateScheduleRequest = {
        title: formData.title,
        description: formData.description || undefined,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        location: formData.location || undefined,
        category: formData.category || undefined,
        isAllDay: formData.isAllDay,
      }

      await schedulesApi.createSchedule(scheduleData)
      alert('일정이 생성되었습니다.')
      router.push('/admin/schedules')
    } catch (error) {
      console.error('Failed to create schedule:', error)
      alert('일정 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/schedules">
          <Button variant="secondary" size="sm">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
        <Title>새 일정 추가</Title>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-6">
          <h2 className="font-body-18-medium text-gray-900">기본 정보</h2>

          <div>
            <label className="block font-body-18-medium text-gray-900 mb-3">
              제목 *
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={value =>
                setFormData({ ...formData, title: value })
              }
              placeholder="일정 제목을 입력하세요"
              required
            />
          </div>

          <div>
            <label className="block font-body-18-medium text-gray-900 mb-3">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="일정에 대한 상세 설명을 입력하세요"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900 resize-vertical"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                카테고리
              </label>
              <Dropdown
                options={categoryOptions}
                value={formData.category}
                onChange={value =>
                  setFormData({ ...formData, category: value })
                }
                placeholder="카테고리 선택"
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                장소
              </label>
              <Input
                type="text"
                value={formData.location}
                onChange={value =>
                  setFormData({ ...formData, location: value })
                }
                placeholder="장소를 입력하세요"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-body-18-medium text-gray-900">날짜 및 시간</h2>

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
            <label
              htmlFor="isAllDay"
              className="font-body-18-medium text-gray-900"
            >
              종일 일정
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                시작일 *
              </label>
              <input
                type={formData.isAllDay ? 'date' : 'datetime-local'}
                value={formData.startDate}
                onChange={e =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block font-body-18-medium text-gray-900 mb-3">
                종료일
              </label>
              <input
                type={formData.isAllDay ? 'date' : 'datetime-local'}
                value={formData.endDate}
                onChange={e =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-md font-body-18-medium text-gray-900"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end pt-4">
          <Link href="/admin/schedules">
            <Button variant="secondary">취소</Button>
          </Link>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? '생성 중...' : '일정 생성'}
          </Button>
        </div>
      </form>
    </div>
  )
}
