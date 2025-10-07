import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { schedulesApi, Schedule, UpdateScheduleRequest } from '@/lib/api/schedules'
import Input from '@/components/common/Input'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Dropdown from '@/components/common/Dropdown'
import Label from '@/components/common/Label'
import DateInput from '@/components/common/DateInput'
import Textarea from '@/components/common/Textarea'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'
import EmptyState from '@/components/common/EmptyState'

export default function AdminSchedulesEditPage() {
  const params = useParams()
  const navigate = useNavigate()
  const alert = useAlert()
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
  })

  const categoryOptions = [
    { value: '카테고리 선택', label: '카테고리 선택' },
    { value: 'academic', label: '학사' },
    { value: 'exam', label: '시험' },
    { value: 'event', label: '행사' },
    { value: 'holiday', label: '휴일' },
    { value: 'other', label: '기타' },
  ]

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
      setFormData({
        title: scheduleData.title,
        description: scheduleData.description || '',
        startDate: scheduleData.startDate,
        endDate: scheduleData.endDate || '',
        location: scheduleData.location || '',
        category: scheduleData.category || '',
      })
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
      alert.error('일정 정보를 불러올 수 없습니다.')
      navigate('/admin/schedules')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert.error('제목을 입력해주세요.')
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
      }

      await schedulesApi.updateSchedule(params.id as string, scheduleData)
      alert.success('일정이 수정되었습니다.')
      navigate('/admin/schedules')
    } catch (error) {
      console.error('Failed to update schedule:', error)
      alert.error('일정 수정 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!schedule) {
    return (
      <EmptyState message="일정을 찾을 수 없습니다." />
    )
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
        <Title>일정 수정</Title>
        <Link to="/admin/schedules">
          <Button variant="info" size="md" radius="md">
            목록으로
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div>
              <Label required={true} className="mb-2">
                제목
              </Label>
              <Input
                type="text"
                value={formData.title}
                onChange={value => setFormData({ ...formData, title: value })}
                placeholder="일정 제목을 입력하세요"
                required
                className="w-full"
                size="lg"
              />
            </div>

            <div>
              <Label className="mb-2" optional={true}>
                설명
              </Label>
              <Textarea
                value={formData.description}
                onChange={value =>
                  setFormData({ ...formData, description: value })
                }
                placeholder="일정에 대한 상세 설명을 입력하세요"
                rows={4}
                size="lg"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2" required={true}>
                  카테고리
                </Label>
                <Dropdown
                  options={categoryOptions}
                  value={formData.category}
                  onChange={value =>
                    setFormData({ ...formData, category: value })
                  }
                  placeholder="카테고리 선택"
                  className="w-full"
                  size="lg"
                />
              </div>

              <div>
                <Label className="mb-2" optional={true}>
                  장소
                </Label>
                <Input
                  type="text"
                  value={formData.location}
                  onChange={value =>
                    setFormData({ ...formData, location: value })
                  }
                  placeholder="장소를 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2" required={true}>
                  시작일
                </Label>
                <DateInput
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={value =>
                    setFormData({ ...formData, startDate: value })
                  }
                  size="md"
                />
              </div>

              <div>
                <Label className="mb-2" optional={true}>
                  종료일
                </Label>
                <DateInput
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={value =>
                    setFormData({ ...formData, endDate: value })
                  }
                  size="md"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="flex gap-4 justify-end p-6 border-t bg-white flex-shrink-0">
        <Link to="/admin/schedules">
          <Button variant="cancel" radius="md" size="lg">
            취소
          </Button>
        </Link>
        <Button
          onClick={handleSubmit}
          variant="info"
          radius="md"
          size="lg"
          disabled={loading}
        >
          {loading ? <LoadingSpinner size="md" /> : '일정 수정'}
        </Button>
      </div>
    </div>
  )
}
