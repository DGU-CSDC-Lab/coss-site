import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { coursesApi, CreateCourseMasterRequest } from '@/lib/api/courses'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import Label from '@/components/common/Label'
import { useAlert } from '@/hooks/useAlert'

export default function AdminCourseMasterCreatePage() {
  const navigate = useNavigate()
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    semester: '1학기',
    department: '',
    courseCode: '',
    subjectName: '',
    englishName: '',
    description: '',
    grade: '',
    credit: 3,
    courseType: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subjectName.trim()) {
      alert.error('과목명을 입력해주세요.')
      return
    }

    if (!formData.courseCode.trim()) {
      alert.error('교과목 코드를 입력해주세요.')
      return
    }

    if (!formData.description.trim()) {
      alert.error('교과목 설명을 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const courseData: CreateCourseMasterRequest = {
        semester: formData.semester,
        department: formData.department,
        courseCode: formData.courseCode,
        subjectName: formData.subjectName,
        englishName: formData.englishName,
        description: formData.description,
        grade: formData.grade,
        credit: formData.credit,
        courseType: formData.courseType,
      }
      await coursesApi.createMaster(courseData)
      alert.success('마스터 교과목이 생성되었습니다.')
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
        <Title className="mt-2">마스터 교과목 생성</Title>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label>학과</Label>
            <Input
              value={formData.department}
              onChange={(value) => handleInputChange('department', value)}
              placeholder="학과명을 입력하세요"
            />
          </div>

          <div>
            <Label>교과목 코드</Label>
            <Input
              value={formData.courseCode}
              onChange={(value) => handleInputChange('courseCode', value)}
              placeholder="교과목 코드를 입력하세요"
            />
          </div>

          <div>
            <Label>교과목명</Label>
            <Input
              value={formData.subjectName}
              onChange={(value) => handleInputChange('subjectName', value)}
              placeholder="교과목명을 입력하세요"
            />
          </div>

          <div>
            <Label>교과목 영문명</Label>
            <Input
              value={formData.englishName}
              onChange={(value) => handleInputChange('englishName', value)}
              placeholder="교과목 영문명을 입력하세요"
            />
          </div>

          <div>
            <Label>수강학년</Label>
            <Input
              value={formData.grade}
              onChange={(value) => handleInputChange('grade', value)}
              placeholder="수강학년을 입력하세요"
            />
          </div>

          <div>
            <Label>학점</Label>
            <Input
              type="number"
              value={formData.credit.toString()}
              onChange={(value) => handleInputChange('credit', parseFloat(value) || 0)}
            />
          </div>

          <div>
            <Label>강의유형</Label>
            <Input
              value={formData.courseType}
              onChange={(value) => handleInputChange('courseType', value)}
              placeholder="강의유형을 입력하세요"
            />
          </div>
        </div>

        <div>
          <Label>교과목 설명</Label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="교과목 설명을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
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
