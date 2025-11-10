import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { coursesApi, CreateCourseMasterRequest, UpdateCourseMasterRequest, CourseMaster } from '@/lib/api/courses'
import { GRADE_OPTIONS, COURSE_TYPE_OPTIONS, SEMESTER_OPTIONS } from '@/config/courseConfig'
import Button from '@/components/common/Button'
import Title from '@/components/common/title/Title'
import Input from '@/components/common/Input'
import Textarea from '@/components/common/Textarea'
import Dropdown from '@/components/common/Dropdown'
import Label from '@/components/common/Label'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import ExitWarningModal from '@/components/common/ExitWarningModal'

export default function AdminCourseMasterCreatePage() {
  const navigate = useNavigate()
  const params = useParams()
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [course, setCourse] = useState<CourseMaster | null>(null)
  const isEdit = !!params.id

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

  const [originalData, setOriginalData] = useState(formData)
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
  const exitWarning = useUnsavedChanges({ hasChanges })

  useEffect(() => {
    if (isEdit && params.id) {
      fetchCourse(params.id)
    }
  }, [isEdit, params.id])

  const fetchCourse = async (id: string) => {
    try {
      setInitialLoading(true)
      const courseData = await coursesApi.getMasters({ page: 1, size: 1 }) // API에 단일 조회가 없어서 임시
      // 실제로는 coursesApi.getMaster(id) 같은 API가 필요
      setCourse(courseData.items[0])
      const data = {
        semester: courseData.items[0].semester,
        department: courseData.items[0].department,
        courseCode: courseData.items[0].courseCode,
        subjectName: courseData.items[0].subjectName,
        englishName: courseData.items[0].englishName || '',
        description: courseData.items[0].description,
        grade: courseData.items[0].grade || '',
        credit: courseData.items[0].credit || 3,
        courseType: courseData.items[0].courseType || '',
      }
      setFormData(data)
      setOriginalData(data)
    } catch (error) {
      alert.error('마스터 교과목 정보를 불러올 수 없습니다.')
      navigate('/admin/courses/master')
    } finally {
      setInitialLoading(false)
    }
  }

  const semesterOptions = SEMESTER_OPTIONS

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subjectName.trim()) {
      alert.error('교과목명을 입력해주세요.')
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
      if (isEdit && params.id) {
        const courseData: UpdateCourseMasterRequest = {
          semester: formData.semester,
          department: formData.department,
          courseCode: formData.courseCode,
          subjectName: formData.subjectName,
          englishName: formData.englishName || undefined,
          description: formData.description,
          grade: formData.grade || undefined,
          credit: formData.credit,
          courseType: formData.courseType || undefined,
        }

        await coursesApi.updateMaster(params.id, courseData)
        alert.success('마스터 교과목이 수정되었습니다.')
      } else {
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
      }
      navigate('/admin/courses/master')
    } catch (error) {
      alert.error(
        `마스터 교과목 ${isEdit ? '수정' : '생성'} 중 오류가 발생했습니다. \n ${error instanceof Error ? error.message : ''}`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleButtonSubmit = () => {
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
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
          <Title>{isEdit ? '마스터 교과목 수정' : '새 마스터 교과목 추가'}</Title>
          <Link to="/admin/courses/master">
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
                    학기
                  </Label>
                  <Dropdown
                    options={semesterOptions}
                    value={formData.semester}
                    onChange={value =>
                      setFormData({ ...formData, semester: value })
                    }
                    placeholder="학기를 선택해주세요."
                    size="lg"
                  />
                </div>

                <div>
                  <Label required={true} className="mb-2">
                    학과
                  </Label>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label required={true} className="mb-2">
                    교과목 코드
                  </Label>
                  <Input
                    type="text"
                    value={formData.courseCode}
                    onChange={value =>
                      setFormData({ ...formData, courseCode: value })
                    }
                    placeholder="교과목 코드를 입력하세요"
                    className="w-full"
                    size="lg"
                  />
                </div>

                <div>
                  <Label required={true} className="mb-2">
                    교과목명
                  </Label>
                  <Input
                    type="text"
                    value={formData.subjectName}
                    onChange={value => setFormData({ ...formData, subjectName: value })}
                    placeholder="교과목명을 입력하세요"
                    className="w-full"
                    size="lg"
                  />
                </div>

                <div>
                  <Label className="mb-2" optional={true}>
                    교과목 영문명
                  </Label>
                  <Input
                    type="text"
                    value={formData.englishName}
                    onChange={value =>
                      setFormData({ ...formData, englishName: value })
                    }
                    placeholder="교과목 영문명을 입력하세요"
                    className="w-full"
                    size="lg"
                  />
                </div>

                <div>
                  <Label className="mb-2" optional={true}>
                    수강학년
                  </Label>
                  <Dropdown
                    options={GRADE_OPTIONS}
                    value={formData.grade}
                    onChange={value =>
                      setFormData({ ...formData, grade: value })
                    }
                    placeholder="수강학년을 선택하세요"
                    size="lg"
                  />
                </div>

                <div>
                  <Label className="mb-2" optional={true}>
                    학점
                  </Label>
                  <Input
                    type="number"
                    value={formData.credit.toString()}
                    onChange={value =>
                      setFormData({ ...formData, credit: parseInt(value) || 0 })
                    }
                    placeholder="학점을 입력하세요"
                    className="w-full"
                    size="lg"
                  />
                </div>

                <div>
                  <Label className="mb-2" optional={true}>
                    강의유형
                  </Label>
                  <Dropdown
                    options={COURSE_TYPE_OPTIONS}
                    value={formData.courseType}
                    onChange={value =>
                      setFormData({ ...formData, courseType: value })
                    }
                    placeholder="강의유형을 선택하세요"
                    size="lg"
                  />
                </div>
              </div>

              <div>
                <Label required={true} className="mb-2">
                  교과목 설명
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={value =>
                    setFormData({ ...formData, description: value })
                  }
                  placeholder="교과목 설명을 입력하세요"
                  rows={4}
                  size="lg"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="flex gap-4 justify-end p-6 bg-white flex-shrink-0">
          <Link to="/admin/courses/master">
            <Button variant="cancel" size="lg" radius="md">
              취소
            </Button>
          </Link>
          <Button
            onClick={handleButtonSubmit}
            variant="info"
            size="lg"
            radius="md"
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="md" /> : isEdit ? '마스터 교과목 수정' : '마스터 교과목 생성'}
          </Button>
        </div>
      </div>

      <ExitWarningModal
        isOpen={exitWarning.showExitModal}
        onClose={exitWarning.cancelExit}
        onConfirmExit={exitWarning.confirmExit}
        onSaveDraft={exitWarning.saveDraftAndExit}
        showDraftOption={true}
      />
    </>
  )
}
