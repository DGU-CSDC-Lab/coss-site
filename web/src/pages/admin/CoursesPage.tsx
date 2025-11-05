import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { coursesApi, CourseOffering } from '@/lib/api/courses'
import { PagedResponse } from '@/lib/apiClient'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'

export default function CoursesPage() {
  const [courses, setCourses] = useState<PagedResponse<CourseOffering> | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedSemester, setSelectedSemester] = useState('1학기')
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const alert = useAlert()

  const semesterOptions = [
    { value: '1학기', label: '1학기' },
    { value: '1학기', label: '1학기' },
    { value: '2학기', label: '2학기' },
    { value: '여름학기', label: '여름학기' },
    { value: '겨울학기', label: '겨울학기' },
  ]

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i
    return { value: year.toString(), label: `${year}년` }
  })

  useEffect(() => {
    fetchCourses()
  }, [selectedYear, selectedSemester, currentPage])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await coursesApi.getOfferings({
        year: selectedYear,
        semester: selectedSemester,
        name: keyword || undefined,
        page: currentPage,
        size: 20,
      })
      setCourses(response)
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCourses()
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 과목을 삭제하시겠습니까?`)) return

    try {
      await coursesApi.deleteOffering(id)
      alert.success('과목이 삭제되었습니다.')
      fetchCourses()
    } catch (error) {
      alert.error('삭제 중 오류가 발생했습니다.')
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <Title>개설과목 관리</Title>
        <div className="flex gap-3">
          <Link to="/admin/courses/bulk-upload">
            <Button variant="cancel" radius="md" size="md">일괄 등록</Button>
          </Link>
          <Link to="/admin/courses/create">
            <Button variant="info" radius="md" size="md">새 과목 추가</Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체{' '}
          <span className="text-pri-500">
            {courses?.meta.totalElements || 0}
          </span>{' '}
          건
        </div>

        <div className="flex flex-wrap gap-2">
          <Dropdown
            options={yearOptions}
            value={selectedYear.toString()}
            onChange={value => setSelectedYear(parseInt(value))}
            size="md"
            className="w-24"
          />
          <Dropdown
            options={semesterOptions}
            value={selectedSemester}
            onChange={setSelectedSemester}
            size="md"
            className="w-24"
          />
          <Input
            type="text"
            placeholder="과목명, 학수번호 검색"
            value={keyword}
            onChange={setKeyword}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className="w-full sm:w-60"
            size="md"
          />
          <Button
            variant="point_2"
            radius="md"
            size="md"
            onClick={handleSearch}
          >
            검색
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-info-100">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-info-50 border-b border-info-100">
            <tr>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                학수번호
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                과목명
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                학과
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                학년
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                학점
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                교수명
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                강의실
              </th>
              <th className="px-4 py-3 text-center font-body-18-medium text-gray-900">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-info-100">
            {courses?.items.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center font-caption-14 text-gray-600"
                >
                  {selectedYear}년 {selectedSemester}에 등록된 과목이 없습니다.
                </td>
              </tr>
            ) : (
              courses?.items.map(course => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-body-14-medium text-gray-600">
                    {course.courseCode}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-body-14-medium text-gray-900">
                        {course.subjectName}
                      </div>
                      {course.englishName && (
                        <div className="font-caption-14 text-gray-600">
                          {course.englishName}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-body-14-medium text-gray-600">
                    {course.department}
                  </td>
                  <td className="px-4 py-3 font-body-14-medium text-gray-600">
                    {course.grade || '-'}
                  </td>
                  <td className="px-4 py-3 font-body-14-medium text-gray-600">
                    {course.credit || '-'}
                  </td>
                  <td className="px-4 py-3 font-body-14-medium text-gray-600">
                    {course.instructor || '-'}
                  </td>
                  <td className="px-4 py-3 font-body-14-medium text-gray-600">
                    {course.classroom || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Link to={`/admin/courses/${course.id}`}>
                        <Button variant="unstyled" size="sm" radius="md">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="delete"
                        size="sm"
                        radius="md"
                        onClick={() =>
                          handleDelete(course.id, course.subjectName)
                        }
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-2 mt-8">
        {/* 이전 버튼 */}
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
        >
          <img
            src="/assets/icon/chevron_left.svg"
            alt="이전"
            width={16}
            height={16}
          />
        </button>

        {/* 페이지 번호 */}
        {courses &&
          Array.from(
            { length: Math.min(5, courses.meta.totalPages || 1) },
            (_, i) => {
              const pageNum = i + 1
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 font-caption-14 rounded ${
                    currentPage === pageNum
                      ? 'text-pri-500 font-semibold'
                      : 'text-gray-900 hover:text-pri-500'
                  }`}
                >
                  {pageNum}
                </button>
              )
            }
          )}

        {/* 마지막 페이지 생략 처리 */}
        {courses && courses.meta.totalPages > 5 && (
          <>
            <span className="px-2 text-gray-900">...</span>
            <button
              onClick={() => setCurrentPage(courses.meta.totalPages)}
              className="px-3 py-2 font-caption-14 text-text hover:text-pri-500"
            >
              {courses.meta.totalPages}
            </button>
          </>
        )}

        {/* 다음 버튼 */}
        <button
          onClick={() =>
            setCurrentPage(
              Math.min(courses?.meta.totalPages || 1, currentPage + 1)
            )
          }
          disabled={currentPage === (courses?.meta.totalPages || 1)}
          className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
        >
          <img
            src="/assets/icon/chevron_right.svg"
            alt="다음"
            width={16}
            height={16}
          />
        </button>
      </div>
    </div>
  )
}
