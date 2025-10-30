import { useState, useEffect } from 'react'
import { PagedResponse } from '@/lib/apiClient'
import { coursesApi, Course } from '@/lib/api/courses'
import Tabs from '@/components/tabs/Tabs'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import Title from '@/components/common/title/Title'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import EmptyState from '@/components/common/EmptyState'
import { useAlert } from '@/hooks/useAlert'

export default function SemesterSubjectsPage() {
  const [courses, setCourses] = useState<PagedResponse<Course> | null>(null)
  const [loading, setLoading] = useState(false)

  const alert = useAlert()

  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedSemester, setSelectedSemester] = useState('1학기')
  const [searchType, setSearchType] = useState('name')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [selectedYear, selectedSemester])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await coursesApi.getCourses({
        year: parseInt(selectedYear),
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

  const yearSemesterOptions = [
    { value: '2025-1학기', label: '2025년 1학기' },
    { value: '2025-2학기', label: '2025년 2학기' },
    { value: '2024-1학기', label: '2024년 1학기' },
    { value: '2024-2학기', label: '2024년 2학기' },
  ]

  const searchTypeOptions = [
    { value: 'name', label: '과목명' },
    { value: 'department', label: '학과' },
    { value: 'code', label: '학수번호' },
    { value: 'grade', label: '수강학년' },
  ]

  const getPlaceholder = () => {
    const typeLabel = searchTypeOptions.find(
      opt => opt.value === searchType
    )?.label
    return `${typeLabel}을 입력해주세요.`
  }

  const handleYearSemesterChange = (value: string) => {
    const [year, semester] = value.split('-')
    setSelectedYear(year)
    setSelectedSemester(semester)
    fetchCourses()
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

      <Title className="mb-4">개설 과목</Title>

      <div className="flex justify-end items-start md:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <Dropdown
            options={yearSemesterOptions}
            value={`${selectedYear}-${selectedSemester}`}
            onChange={handleYearSemesterChange}
            placeholder="년도/학기 선택"
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
          {/* 여기서 헤더(thea d)는 고정, tbody만 스크롤 */}
          <div className="max-h-[460px] overflow-y-auto">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead className="bg-info-50 border-b border-info-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[80px]">
                    개설년도
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[60px]">
                    개설학기
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[100px]">
                    개설학과
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[100px]">
                    학수번호
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[160px]">
                    과목명
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[80px]">
                    수강학년
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[60px]">
                    학점
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[140px]">
                    강의시간
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[80px]">
                    담당교수
                  </th>
                  <th className="px-4 py-3 text-body-14-medium text-info-700 w-[100px]">
                    강의계획서
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {courses?.items.length ? (
                  courses.items.map(course => (
                    <tr key={course.id} className="border-t border-info-100">
                      <td className="px-2 py-1 text-caption-14 text-gray-700 text-center">
                        {course.year}
                      </td>
                      <td className="px-2 py-1 text-caption-14 text-gray-700 text-center">
                        {course.semester}
                      </td>
                      <td className="px-2 py-1 text-caption-14 text-gray-700 text-center">
                        {course.department}
                      </td>
                      <td className="px-2 py-1 text-caption-14 text-gray-700 text-center">
                        {course.courseCode}
                      </td>
                      <td className="px-3 py-1 text-caption-14 text-gray-700 text-center truncate">
                        {course.subjectName}
                      </td>
                      <td className="px-1 py-1 text-caption-14 text-gray-700 text-center">
                        {course.grade || '-'}
                      </td>
                      <td className="px-1 py-1 text-caption-14 text-gray-700 text-center">
                        {course.credit || '-'}
                      </td>
                      <td className="px-4 py-1 text-caption-14 text-gray-700 text-center whitespace-pre-line">
                        {course.classTime || '-'}
                      </td>
                      <td className="px-2 py-2.5 text-sm text-gray-700 text-center">
                        {course.instructor || '-'}
                      </td>
                      <td className="px-2 py-2.5 text-sm text-blue-600 text-center">
                        {course.syllabusUrl ? (
                          <a
                            href={course.syllabusUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            보기
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-0">
                      <EmptyState />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
