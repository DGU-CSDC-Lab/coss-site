import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { coursesApi, CreateCourseRequest } from '@/lib/api/courses'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import Label from '@/components/common/Label'

export default function AdminCoursesCreatePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    subjectName: '',
    englishName: '',
    courseCode: '',
    department: '',
    grade: '',
    year: new Date().getFullYear(),
    semester: '1학기',
    instructor: '',
    classroom: '',
    courseType: '',
    credit: 3,
  })

  const semesterOptions = [
    { value: '1학기', label: '1학기' },
    { value: '2학기', label: '2학기' },
    { value: '여름학기', label: '여름학기' },
    { value: '겨울학기', label: '겨울학기' },
  ]

  const gradeOptions = [
    { value: '', label: '학년 선택' },
    { value: '1학년', label: '1학년' },
    { value: '2학년', label: '2학년' },
    { value: '3학년', label: '3학년' },
    { value: '4학년', label: '4학년' },
    { value: '1,2학년', label: '1,2학년' },
    { value: '2,3학년', label: '2,3학년' },
    { value: '3,4학년', label: '3,4학년' },
    { value: '전학년', label: '전학년' },
  ]

  const courseTypeOptions = [
    { value: '', label: '과목유형 선택' },
    { value: '전공필수', label: '전공필수' },
    { value: '전공선택', label: '전공선택' },
    { value: '교양필수', label: '교양필수' },
    { value: '교양선택', label: '교양선택' },
    { value: '공통기초', label: '공통기초' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subjectName.trim()) {
      alert('과목명을 입력해주세요.')
      return
    }

    if (!formData.courseCode.trim()) {
      alert('학수번호를 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      const courseData: CreateCourseRequest = {
        subjectName: formData.subjectName,
        englishName: formData.englishName || undefined,
        courseCode: formData.courseCode,
        department: formData.department,
        grade: formData.grade,
        year: formData.year,
        semester: formData.semester,
        instructor: formData.instructor || undefined,
        classroom: formData.classroom || undefined,
        courseType: formData.courseType || undefined,
        credit: formData.credit,
      }

      await coursesApi.createCourse(courseData)
      alert('과목이 생성되었습니다.')
      navigate('/admin/courses')
    } catch (error) {
      console.error('Failed to create course:', error)
      alert('과목 생성 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex items-center justify-between gap-4 p-6">
        <Title>새 과목 추가</Title>
        <Link to="/admin/courses">
          <Button variant="delete" size="md" radius="md">
            나가기
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label required={true} className="mb-2">
                  과목명
                </Label>
                <Input
                  type="text"
                  value={formData.subjectName}
                  onChange={value => setFormData({ ...formData, subjectName: value })}
                  placeholder="과목명을 입력하세요"
                  className="w-full"
                  size="lg"
                  required
                />
              </div>

              <div>
                <Label className="mb-2">영문명</Label>
                <Input
                  type="text"
                  value={formData.englishName}
                  onChange={value =>
                    setFormData({ ...formData, englishName: value })
                  }
                  placeholder="영문 과목명을 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label required={true} className="mb-2">
                  학수번호
                </Label>
                <Input
                  type="text"
                  value={formData.courseCode}
                  onChange={value => setFormData({ ...formData, courseCode: value })}
                  placeholder="예: IOT101-01"
                  className="w-full"
                  size="lg"
                  required
                />
              </div>

              <div>
                <Label className="mb-2">학과</Label>
                <Input
                  type="text"
                  value={formData.department}
                  onChange={value =>
                    setFormData({ ...formData, department: value })
                  }
                  placeholder="학과명을 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <Label className="mb-2">년도</Label>
                <Input
                  type="number"
                  value={formData.year.toString()}
                  onChange={value =>
                    setFormData({
                      ...formData,
                      year: parseInt(value) || new Date().getFullYear(),
                    })
                  }
                  min="2000"
                  max="2100"
                  className="w-full"
                  size="lg"
                />
              </div>

              <div>
                <Label className="mb-2">학기</Label>
                <Dropdown
                  options={semesterOptions}
                  value={formData.semester}
                  onChange={value =>
                    setFormData({ ...formData, semester: value })
                  }
                  size="lg"
                  className="w-full"
                />
              </div>

              <div>
                <Label className="mb-2">학점</Label>
                <Input
                  type="number"
                  value={formData.credit.toString()}
                  onChange={value =>
                    setFormData({ ...formData, credit: parseFloat(value) || 0 })
                  }
                  min="0"
                  max="10"
                  step="0.5"
                  className="w-full"
                  size="lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2">수강학년</Label>
                <Dropdown
                  options={gradeOptions}
                  value={formData.grade}
                  onChange={value => setFormData({ ...formData, grade: value })}
                  placeholder="학년 선택"
                  size="lg"
                  className="w-full"
                />
              </div>

              <div>
                <Label className="mb-2">과목유형</Label>
                <Dropdown
                  options={courseTypeOptions}
                  value={formData.courseType}
                  onChange={value =>
                    setFormData({ ...formData, courseType: value })
                  }
                  placeholder="과목유형 선택"
                  size="lg"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Label className="mb-2">담당교수</Label>
                <Input
                  type="text"
                  value={formData.instructor}
                  onChange={value =>
                    setFormData({ ...formData, instructor: value })
                  }
                  placeholder="담당교수명을 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>

              <div>
                <Label className="mb-2">강의실</Label>
                <Input
                  type="text"
                  value={formData.classroom}
                  onChange={value =>
                    setFormData({ ...formData, classroom: value })
                  }
                  placeholder="강의실을 입력하세요"
                  className="w-full"
                  size="lg"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-end pt-4">
            <Link to="/admin/courses">
              <Button variant="cancel" radius="md" size="md">
                취소
              </Button>
            </Link>
            <Button
              type="submit"
              variant="info"
              radius="md"
              size="md"
              disabled={loading}
            >
              {loading ? '생성 중...' : '과목 생성'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
