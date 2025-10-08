import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { coursesApi, CreateCourseRequest, UpdateCourseRequest, Course } from '@/lib/api/courses'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import Label from '@/components/common/Label'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import ExitWarningModal from '@/components/common/ExitWarningModal'
import { useAlert } from '@/hooks/useAlert'

export default function AdminCoursesCreatePage() {
  const navigate = useNavigate()
  const params = useParams()
  const isEdit = !!params.id
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [course, setCourse] = useState<Course | null>(null)
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

  const [originalData, setOriginalData] = useState(formData)

  useEffect(() => {
    if (isEdit && params.id) {
      fetchCourse(params.id)
    }
  }, [isEdit, params.id])

  const fetchCourse = async (id: string) => {
    try {
      setInitialLoading(true)
      const courseData = await coursesApi.getCourse(id)
      setCourse(courseData)
      const data = {
        subjectName: courseData.subjectName,
        englishName: courseData.englishName || '',
        courseCode: courseData.courseCode,
        department: courseData.department,
        grade: courseData.grade?.toString() || '',
        year: courseData.year,
        semester: courseData.semester,
        instructor: courseData.instructor || '',
        classroom: courseData.classroom || '',
        courseType: courseData.courseType || '',
        credit: courseData.credit,
      }
      setFormData(data)
      setOriginalData(data)
    } catch (error) {
      console.error('Failed to fetch course:', error)
      alert.error('과목 정보를 불러올 수 없습니다.')
      navigate('/admin/courses')
    } finally {
      setInitialLoading(false)
    }
  }

  // Check if there are unsaved changes
  const hasChanges = Object.entries(formData).some(([key, value]) => {
    if (typeof value === 'string') return value.trim() !== ''
    if (key === 'credit') return value !== 3
    if (key === 'year') return value !== new Date().getFullYear()
    return false
  })

  const {
    showExitModal,
    handleExit,
    confirmExit,
    cancelExit,
  } = useUnsavedChanges({ hasChanges })

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
      alert.error('과목명을 입력해주세요.')
      return
    }

    if (!formData.courseCode.trim()) {
      alert.error('학수번호를 입력해주세요.')
      return
    }

    setLoading(true)

    try {
      if (isEdit && params.id) {
        const courseData: UpdateCourseRequest = {
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

        await coursesApi.updateCourse(params.id, courseData)
        alert.success('과목이 수정되었습니다.')
      } else {
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
        alert.success('과목이 생성되었습니다.')
      }
      navigate('/admin/courses')
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} course:`, error)
      alert.error(`과목 ${isEdit ? '수정' : '생성'} 중 오류가 발생했습니다.`)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <>
      <div className="w-full h-screen flex flex-col">
        <div className="flex items-center justify-between gap-4 p-6">
          <Title>{isEdit ? '과목 수정' : '새 과목 추가'}</Title>
        <Button 
          variant="delete" 
          size="md" 
          radius="md"
          onClick={() => handleExit(() => navigate('/admin/courses'))}
        >
          나가기
        </Button>
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
              {loading ? (isEdit ? '수정 중...' : '생성 중...') : (isEdit ? '과목 수정' : '과목 생성')}
            </Button>
          </div>
        </form>
      </div>
    </div>

    <ExitWarningModal
      isOpen={showExitModal}
      onClose={cancelExit}
      onConfirmExit={confirmExit}
      showDraftOption={false}
    />
    </>
  )
}
