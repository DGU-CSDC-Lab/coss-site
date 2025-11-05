import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  coursesApi,
  CreateCourseOfferingRequest,
  CourseMaster,
} from '@/lib/api/courses'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import Label from '@/components/common/Label'
import { useAlert } from '@/hooks/useAlert'

export default function AdminCourseOfferingCreatePage() {
  const navigate = useNavigate()
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [masters, setMasters] = useState<CourseMaster[]>([])
  const [formData, setFormData] = useState({
    masterId: '',
    year: new Date().getFullYear(),
    semester: '1학기',
    classTime: '',
    instructor: '',
    classroom: '',
    syllabusUrl: '',
  })

  useEffect(() => {
    fetchMasters()
  }, [])

  const fetchMasters = async () => {
    try {
      const response = await coursesApi.getMasters({ size: 1000 })
      setMasters(response.items)
    } catch (error) {
      alert.error('마스터 교과목 목록을 불러올 수 없습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.masterId) {
      alert.error('마스터 교과목을 선택해주세요.')
      return
    }

    setLoading(true)
    try {
      const courseData: CreateCourseOfferingRequest = {
        masterId: formData.masterId,
        year: formData.year,
        semester: formData.semester,
        classTime: formData.classTime || undefined,
        instructor: formData.instructor || undefined,
        classroom: formData.classroom || undefined,
        syllabusUrl: formData.syllabusUrl || undefined,
      }
      await coursesApi.createOffering(courseData)
      alert.success('개설 교과목이 생성되었습니다.')
      navigate('/admin/courses')
    } catch (error) {
      alert.error('교과목 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link to="/admin/courses" className="text-blue-600 hover:underline">
          ← 목록으로
        </Link>
        <Title className="mt-2">개설 교과목 생성</Title>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>마스터 교과목</Label>
            <Dropdown
              value={formData.masterId}
              onChange={(value) => handleInputChange('masterId', value)}
              options={masters.map(master => ({
                value: master.id,
                label: `${master.courseCode} - ${master.subjectName}`,
              }))}
              placeholder="마스터 교과목을 선택하세요"
            />
          </div>

          <div>
            <Label>개설년도</Label>
            <Input
              type="number"
              value={formData.year.toString()}
              onChange={(value) => handleInputChange('year', parseInt(value) || new Date().getFullYear())}
            />
          </div>

          <div>
            <Label>학기</Label>
            <Dropdown
              value={formData.semester}
              onChange={(value) => handleInputChange('semester', value)}
              options={[
                { value: '1학기', label: '1학기' },
                { value: '2학기', label: '2학기' },
                { value: '여름학기', label: '여름학기' },
                { value: '겨울학기', label: '겨울학기' },
              ]}
            />
          </div>

          <div>
            <Label>수업시간</Label>
            <Input
              value={formData.classTime}
              onChange={(value) => handleInputChange('classTime', value)}
              placeholder="예: 월 09:00-12:00"
            />
          </div>

          <div>
            <Label>담당교원</Label>
            <Input
              value={formData.instructor}
              onChange={(value) => handleInputChange('instructor', value)}
              placeholder="담당교원명을 입력하세요"
            />
          </div>

          <div>
            <Label>강의실</Label>
            <Input
              value={formData.classroom}
              onChange={(value) => handleInputChange('classroom', value)}
              placeholder="강의실을 입력하세요"
            />
          </div>
        </div>

        <div>
          <Label>강의계획서 URL</Label>
          <Input
            type="url"
            value={formData.syllabusUrl}
            onChange={(value) => handleInputChange('syllabusUrl', value)}
            placeholder="강의계획서 URL을 입력하세요"
          />
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            onClick={() => navigate('/admin/courses')}
            variant="cancel"
            disabled={loading}
          >
            취소
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? '생성 중...' : '생성'}
          </Button>
        </div>
      </form>
    </div>
  )
}
