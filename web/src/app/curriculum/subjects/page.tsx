'use client'

import { useState, useEffect } from 'react'
import { PagedResponse } from '@/lib/apiClient'
import { coursesApi, Course } from '@/lib/api/courses'
import Tabs from '@/components/tabs/Tabs'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import Title from '@/components/common/Title'
import Image from 'next/image'

export default function SubjectsPage() {
  const [courses, setCourses] = useState<PagedResponse<Course> | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // 검색 조건
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedSemester, setSelectedSemester] = useState('1학기')
  const [searchType, setSearchType] = useState('name')
  const [keyword, setKeyword] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [currentPage, selectedYear, selectedSemester])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await coursesApi.getCourses({
        year: parseInt(selectedYear),
        semester: selectedSemester,
        [searchType]: keyword || undefined,
        page: currentPage,
        size: 10,
      })
      setCourses(response)
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCourses()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
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
    setCurrentPage(1)
    fetchCourses() // 변경 시 즉시 새 데이터 요청
  }

  if (loading && !courses) {
    return <div className="flex justify-center py-8">로딩 중...</div>
  }

  return (
    <div className="w-full">
      <Tabs />

      {/* 페이지 제목 */}
      <Title className="mb-4">개설 과목</Title>

      {/* 검색 영역 */}
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
      {/* 결과 테이블 */}
      <div className="rounded-lg border border-info-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed">
            <thead>
              <tr className="bg-info-50 border-b border-info-100">
                <th className="px-4 py-3 font-body-14-medium text-info-700 w-[8%]">
                  개설년도
                </th>
                <th className="px-4 py-3 font-body-14-medium text-info-700 w-[7%]">
                  학기
                </th>
                <th className="px-4 py-3 font-body-14-medium text-info-700 w-[10%]">
                  학과
                </th>
                <th className="px-4 py-3 font-body-14-medium text-info-700 w-[10%]">
                  학수번호
                </th>
                <th className="px-4 py-3 font-body-14-medium text-info-700 w-[15%]">
                  과목명
                </th>
                <th className="px-4 py-3 font-body-14-medium text-info-700 w-[8%]">
                  수강학년
                </th>
                <th className="px-4 py-3 font-body-14-medium text-info-700 w-[7%]">
                  학점
                </th>
                <th className="px-4 py-3 font-body-14-medium text-info-700 w-[15%]">
                  강의시간
                </th>
                <th className="px-4 py-3 font-body-14-medium text-info-700 w-[8%]">
                  담당교수
                </th>
                <th className="px-4 py-3 font-body-14-medium text-info-700 w-[12%]">
                  강의계획서
                </th>
              </tr>
            </thead>

            <tbody className="bg-white">
              {courses?.items.length ? (
                courses.items.map(course => (
                  <tr key={course.id} className="border-t border-info-100">
                    <td className="px-2 py-1 font-caption-14 text-gray-700 text-center">
                      {course.year}
                    </td>
                    <td className="px-2 py-1 font-caption-14 text-gray-700 text-center">
                      {course.semester}
                    </td>
                    <td className="px-2 py-1 font-caption-14 text-gray-700 text-center">
                      {course.department}
                    </td>
                    <td className="px-2 py-1 font-caption-14 text-gray-700 text-center">
                      {course.courseCode}
                    </td>
                    <td className="px-3 py-1 font-caption-14 text-gray-700 text-center truncate">
                      {course.subjectName}
                    </td>
                    <td className="px-1 py-1 font-caption-14 text-gray-700 text-center">
                      {course.grade || '-'}
                    </td>
                    <td className="px-1 py-1 font-caption-14 text-gray-700 text-center">
                      {course.credit || '-'}
                    </td>
                    <td className="px-4 py-1 font-caption-14 text-gray-700 text-center whitespace-pre-line">
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
                  <td colSpan={11} className="text-center py-10 text-gray-500">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 페이지네이션 */}
      {courses && courses.meta.totalPages > 1 && (
        <div className="px-4 py-6 flex items-center justify-center border-t border-gray-200">
          <div className="flex justify-center items-center gap-2">
            {/* 이전 버튼 */}
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
            >
              <Image
                src="/assets/icon/chevron_left.svg"
                alt="이전"
                width={16}
                height={16}
              />
            </button>

            {/* 페이지 번호 */}
            {Array.from(
              { length: Math.min(5, courses.meta.totalPages || 1) },
              (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 font-caption-14 ${
                      currentPage === pageNum
                        ? 'text-pri-500 font-semibold'
                        : 'text-gray-900 hover-primary'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              }
            )}

            {/* ... 이후 마지막 페이지 */}
            {courses.meta.totalPages > 5 && (
              <>
                <span className="px-2 text-gray-900">...</span>
                <button
                  onClick={() => handlePageChange(courses.meta.totalPages)}
                  className="px-3 py-2 font-caption-14 text-text hover-primary"
                >
                  {courses.meta.totalPages}
                </button>
              </>
            )}

            {/* 다음 버튼 */}
            <button
              onClick={() =>
                handlePageChange(
                  Math.min(courses?.meta.totalPages || 1, currentPage + 1)
                )
              }
              disabled={currentPage === (courses?.meta.totalPages || 1)}
              className="flex items-center justify-center w-8 h-8 disabled:opacity-50"
            >
              <Image
                src="/assets/icon/chevron_right.svg"
                alt="다음"
                width={16}
                height={16}
              />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
