import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import {
  coursesApi,
  CreateCourseOfferingRequest,
  UpdateCourseOfferingRequest,
  CourseMaster,
  CourseOffering,
} from '@/lib/api/courses'
import { SEMESTER_OPTIONS } from '@/config/courseConfig'
import Button from '@/components/common/Button'
import Title from '@/components/common/title/Title'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import SearchableDropdown from '@/components/common/SearchableDropdown'
import Label from '@/components/common/Label'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges'
import ExitWarningModal from '@/components/common/ExitWarningModal'
import FileUpload from '@/components/admin/FileUpload'
import { UploadResult } from '@/utils/fileUpload'

export default function AdminCourseOfferingCreatePage() {
  const navigate = useNavigate()
  const params = useParams()
  const alert = useAlert()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(false)
  const [course, setCourse] = useState<CourseOffering | null>(null)
  const [masters, setMasters] = useState<CourseMaster[]>([])
  const [masterLoading, setMasterLoading] = useState(false)
  const [files, setFiles] = useState<UploadResult[]>([])
  const isEdit = !!params.id

  const [formData, setFormData] = useState({
    masterId: '',
    year: new Date().getFullYear(),
    semester: '1학기',
    classTime: '',
    instructor: '',
    classroom: '',
    syllabusUrl: '',
  })

  const [originalData, setOriginalData] = useState(formData)
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
  const exitWarning = useUnsavedChanges({ hasChanges })

  useEffect(() => {
    if (isEdit && params.id) {
      fetchCourse(params.id)
    }
  }, [isEdit, params.id])

  const searchMasters = async (query: string) => {
    try {
      setMasterLoading(true)
      const response = await coursesApi.getMasters({
        subjectName: query || undefined,
        page: 1,
        size: 10,
      })
      setMasters(response.items)
    } catch (error) {
      alert.error('마스터 교과목 검색에 실패했습니다.')
    } finally {
      setMasterLoading(false)
    }
  }

  const fetchCourse = async (id: string) => {
    try {
      setInitialLoading(true)
      const courseData = await coursesApi.getOffering(id)
      setCourse(courseData)

      const data = {
        masterId: '', // API에서 masterId를 제공하지 않는 경우 빈 값
        year: courseData.year,
        semester: courseData.semester,
        classTime: courseData.classTime || '',
        instructor: courseData.instructor || '',
        classroom: courseData.classroom || '',
        syllabusUrl: courseData.syllabusUrl || '',
      }

      setFormData(data)
      setOriginalData(data)
    } catch (error) {
      alert.error('개설 교과목 정보를 불러올 수 없습니다.')
      navigate('/admin/courses/offering')
    } finally {
      setInitialLoading(false)
    }
  }

  const semesterOptions = SEMESTER_OPTIONS

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isEdit && !formData.masterId) {
      alert.error('마스터 교과목을 선택해주세요.')
      return
    }

    setLoading(true)

    try {
      if (isEdit && params.id) {
        const courseData: UpdateCourseOfferingRequest = {
          year: formData.year,
          semester: formData.semester,
          classTime: formData.classTime || undefined,
          instructor: formData.instructor || undefined,
          classroom: formData.classroom || undefined,
          syllabusUrl:
            files.length > 0 ? files[0].publicUrl || formData.syllabusUrl || undefined : formData.syllabusUrl || undefined,
        }

        await coursesApi.updateOffering(params.id, courseData)
        alert.success('개설 교과목이 수정되었습니다.')
      } else {
        const courseData: CreateCourseOfferingRequest = {
          masterId: formData.masterId,
          year: formData.year,
          semester: formData.semester,
          classTime: formData.classTime || undefined,
          instructor: formData.instructor || undefined,
          classroom: formData.classroom || undefined,
          syllabusUrl:
            files.length > 0 ? files[0].publicUrl || formData.syllabusUrl || undefined : formData.syllabusUrl || undefined,
        }

        await coursesApi.createOffering(courseData)
        alert.success('개설 교과목이 생성되었습니다.')
      }
      navigate('/admin/courses/offering')
    } catch (error) {
      alert.error(
        `개설 교과목 ${isEdit ? '수정' : '생성'} 중 오류가 발생했습니다. \n ${error instanceof Error ? error.message : ''}`
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
          <Title>{isEdit ? '개설 교과목 수정' : '새 개설 교과목 추가'}</Title>
          <Link to="/admin/courses/offering">
            <Button variant="delete" size="md" radius="md">
              나가기
            </Button>
          </Link>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {!isEdit && (
                  <div>
                    <Label required={true} className="mb-2">
                      마스터 교과목
                    </Label>
                    <SearchableDropdown
                      options={masters.map(master => ({
                        value: master.id,
                        label: `${master.courseCode} - ${master.subjectName}`,
                      }))}
                      value={formData.masterId}
                      onChange={value =>
                        setFormData({ ...formData, masterId: value })
                      }
                      onSearch={searchMasters}
                      placeholder="교과목명 또는 코드로 검색하세요"
                      loading={masterLoading}
                      size="lg"
                    />
                  </div>
                )}

                <div>
                  <Label required={true} className="mb-2">
                    개설년도
                  </Label>
                  <Input
                    type="number"
                    value={formData.year.toString()}
                    onChange={value =>
                      setFormData({
                        ...formData,
                        year: parseInt(value) || new Date().getFullYear(),
                      })
                    }
                    placeholder="개설년도를 입력하세요"
                    className="w-full"
                    size="lg"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label className="mb-2" optional={true}>
                    수업시간
                  </Label>
                  <Input
                    type="text"
                    value={formData.classTime}
                    onChange={value =>
                      setFormData({ ...formData, classTime: value })
                    }
                    placeholder="예: 월 09:00-12:00"
                    className="w-full"
                    size="lg"
                  />
                </div>

                <div>
                  <Label className="mb-2" optional={true}>
                    담당교원
                  </Label>
                  <Input
                    type="text"
                    value={formData.instructor}
                    onChange={value =>
                      setFormData({ ...formData, instructor: value })
                    }
                    placeholder="담당교원명을 입력하세요"
                    className="w-full"
                    size="lg"
                  />
                </div>

                <div>
                  <Label className="mb-2" optional={true}>
                    강의실
                  </Label>
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

                <div>
                  <Label className="mb-2" optional={true}>
                    강의계획서 파일
                  </Label>
                  <FileUpload
                    initialFiles={files}
                    onFilesChange={setFiles}
                    maxFiles={1}
                    maxSize={10 * 1024 * 1024}
                    ownerType="course"
                    ownerId={'course-temp'}
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex gap-4 justify-end p-6 bg-white flex-shrink-0">
          <Link to="/admin/courses/offering">
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
            {loading ? (
              <LoadingSpinner size="md" />
            ) : isEdit ? (
              '개설 교과목 수정'
            ) : (
              '개설 교과목 생성'
            )}
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
