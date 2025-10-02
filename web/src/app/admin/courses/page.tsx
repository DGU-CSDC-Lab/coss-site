'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { coursesApi, Course } from '@/lib/api/courses'
import { PagedResponse } from '@/lib/api'
import Title from '@/components/common/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<PagedResponse<Course> | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedSemester, setSelectedSemester] = useState('1학기')
  const [keyword, setKeyword] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const semesterOptions = [
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
      const response = await coursesApi.getCourses({
        year: selectedYear,
        semester: selectedSemester,
        name: keyword || undefined,
        page: currentPage,
        size: 20,
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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" 과목을 삭제하시겠습니까?`)) return

    try {
      await coursesApi.deleteCourse(id)
      alert('과목이 삭제되었습니다.')
      fetchCourses()
    } catch (error) {
      console.error('Failed to delete course:', error)
      alert('삭제 중 오류가 발생했습니다.')
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
          <Link href="/admin/courses/bulk-upload">
            <Button variant="secondary">일괄 등록</Button>
          </Link>
          <Link href="/admin/courses/create">
            <Button variant="primary">
              <PlusIcon className="w-4 h-4 mr-2" />새 과목 추가
            </Button>
          </Link>
        </div>
      </div>

      {/* 필터 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block font-body-18-medium text-gray-900 mb-2">
            년도
          </label>
          <Dropdown
            options={yearOptions}
            value={selectedYear.toString()}
            onChange={value => setSelectedYear(parseInt(value))}
          />
        </div>
        <div>
          <label className="block font-body-18-medium text-gray-900 mb-2">
            학기
          </label>
          <Dropdown
            options={semesterOptions}
            value={selectedSemester}
            onChange={setSelectedSemester}
          />
        </div>
        <div>
          <label className="block font-body-18-medium text-gray-900 mb-2">
            검색
          </label>
          <Input
            type="text"
            placeholder="과목명, 학수번호 검색"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <div className="flex items-end">
          <Button variant="secondary" onClick={handleSearch}>
            <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
            검색
          </Button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="font-body-18-medium text-gray-900">
          {selectedYear}년 {selectedSemester} - 전체{' '}
          <span className="text-pri-500">
            {courses?.meta.totalElements || 0}
          </span>{' '}
          건
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
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
          <tbody>
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
                  <td className="px-4 py-3 font-body-18-medium text-gray-900">
                    {course.courseCode}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-body-18-medium text-gray-900">
                        {course.subjectName}
                      </div>
                      {course.englishName && (
                        <div className="font-caption-14 text-gray-600">
                          {course.englishName}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {course.department}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {course.grade || '-'}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {course.credit || '-'}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {course.instructor || '-'}
                  </td>
                  <td className="px-4 py-3 font-caption-14 text-gray-600">
                    {course.classroom || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <Button variant="secondary" size="sm">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
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

      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          이전
        </Button>

        {courses &&
          Array.from(
            { length: Math.min(5, courses.meta.totalPages || 1) },
            (_, i) => {
              const pageNum = i + 1
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            }
          )}

        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            setCurrentPage(
              Math.min(courses?.meta.totalPages || 1, currentPage + 1)
            )
          }
          disabled={currentPage === (courses?.meta.totalPages || 1)}
        >
          다음
        </Button>
      </div>
    </div>
  )
}
