import { useState, useEffect } from 'react'
import { PagedResponse } from '@/lib/apiClient'
import { coursesApi, CourseMaster } from '@/lib/api/courses'
import Tabs from '@/components/tabs/Tabs'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import Title from '@/components/common/title/Title'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { useAlert } from '@/hooks/useAlert'

export default function MasterSubjectPage() {
  const [courses, setCourses] = useState<PagedResponse<CourseMaster> | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<CourseMaster | null>(null)
  const [showModal, setShowModal] = useState(false)

  const alert = useAlert()

  const [selectedSemester, setSelectedSemester] = useState('1학기')
  const [searchType, setSearchType] = useState('name')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [selectedSemester])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await coursesApi.getMasters({
        semester: selectedSemester,
        [searchType]: keyword || undefined,
        page: 1,
        size: 100,
      })
      setCourses(response)
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchCourses()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleCourseClick = (course: CourseMaster) => {
    setSelectedCourse(course)
    setShowModal(true)
  }

  const semesterOptions = [
    { value: '1학기', label: '1학기' },
    { value: '2학기', label: '2학기' },
    { value: '여름학기', label: '여름학기' },
    { value: '겨울학기', label: '겨울학기' },
  ]

  const searchTypeOptions = [
    { value: 'name', label: '과목명' },
    { value: 'department', label: '학과' },
    { value: 'code', label: '교과목 코드' },
    { value: 'grade', label: '수강학년' },
  ]

  const getPlaceholder = () => {
    const typeLabel = searchTypeOptions.find(
      opt => opt.value === searchType
    )?.label
    return `${typeLabel}을 입력해주세요.`
  }

  if (loading && !courses) {
    return (
      <div className="flex flex-col w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <Tabs />

      <Title className="mb-4">마스터 교과목</Title>

      <div className="flex justify-end items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Dropdown
            options={semesterOptions}
            value={selectedSemester}
            onChange={setSelectedSemester}
            placeholder="학기 선택"
          />
          <Dropdown
            options={searchTypeOptions}
            value={searchType}
            onChange={setSearchType}
            placeholder="검색 유형"
          />
          <Input
            type="text"
            value={keyword}
            onChange={setKeyword}
            onKeyPress={handleKeyPress}
            placeholder={getPlaceholder()}
          />
          <Button
            onClick={handleSearch}
            disabled={loading}
            size="md"
            radius="md"
            variant="point_2"
            className="w-full sm:w-auto"
          >
            검색
          </Button>
        </div>
      </div>

      <div className="h-4" />

      <div className="rounded-lg border border-info-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="max-h-[460px] overflow-y-auto">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead className="bg-info-50 border-b border-info-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[100px]">
                    교과목 코드
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[160px]">
                    교과목명
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[100px]">
                    학과
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[80px]">
                    수강학년
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[60px]">
                    학기
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[60px]">
                    학점
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[80px]">
                    강의유형
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {courses?.items.length ? (
                  courses.items.map(course => (
                    <tr key={course.id} className="border-t border-info-100">
                      <td className="px-2 py-1 text-caption-14 text-gray-700 text-center">
                        {course.courseCode}
                      </td>
                      <td 
                        className="px-3 py-1 text-caption-14 text-blue-600 text-center truncate cursor-pointer hover:underline"
                        onClick={() => handleCourseClick(course)}
                      >
                        {course.subjectName}
                      </td>
                      <td className="px-2 py-1 text-caption-14 text-gray-700 text-center">
                        {course.department}
                      </td>
                      <td className="px-1 py-1 text-caption-14 text-gray-700 text-center">
                        {course.grade || '-'}
                      </td>
                      <td className="px-1 py-1 text-caption-14 text-gray-700 text-center">
                        {course.semester}
                      </td>
                      <td className="px-1 py-1 text-caption-14 text-gray-700 text-center">
                        {course.credit || '-'}
                      </td>
                      <td className="px-1 py-1 text-caption-14 text-gray-700 text-center">
                        {course.courseType || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <EmptyState />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Description Modal */}
      {showModal && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-body-18-medium text-gray-900">
                  {selectedCourse.subjectName}
                </h2>
                <p className="text-caption-14 text-gray-500">
                  {selectedCourse.courseCode} | {selectedCourse.department}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-body-18-medium text-gray-900 leading-relaxed">
                  {selectedCourse.description || '설명이 없습니다.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <span className="text-caption-14 text-gray-500">학점:</span>
                  <span className="ml-2 text-caption-14 text-gray-900">{selectedCourse.credit || '-'}</span>
                </div>
                <div>
                  <span className="text-caption-14 text-gray-500">수강학년:</span>
                  <span className="ml-2 text-caption-14 text-gray-900">{selectedCourse.grade || '-'}</span>
                </div>
                <div>
                  <span className="text-caption-14 text-gray-500">강의유형:</span>
                  <span className="ml-2 text-caption-14 text-gray-900">{selectedCourse.courseType || '-'}</span>
                </div>
                <div>
                  <span className="text-caption-14 text-gray-500">학기:</span>
                  <span className="ml-2 text-caption-14 text-gray-900">{selectedCourse.semester}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowModal(false)}
                variant="cancel"
                size='md'
                radius='md'
              >
                닫기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
