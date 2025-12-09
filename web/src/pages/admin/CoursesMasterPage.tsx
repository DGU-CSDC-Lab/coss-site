import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { coursesApi, CourseMaster, CoursesQuery } from '@/lib/api/courses'
import { useAlert } from '@/hooks/useAlert'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Input from '@/components/common/Input'
import Dropdown from '@/components/common/Dropdown'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import ConfirmModal from '@/components/common/ConfirmModal'

const SEMESTER_OPTIONS = [
  { value: '', label: '전체 학기' },
  { value: '1학기', label: '1학기' },
  { value: '2학기', label: '2학기' },
  { value: '여름학기', label: '여름학기' },
  { value: '겨울학기', label: '겨울학기' },
]

const SEARCH_TYPE_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'name', label: '과목명' },
  { value: 'department', label: '학과' },
  { value: 'code', label: '과목코드' },
]

export default function AdminCoursesMasterPage() {
  const [courses, setCourses] = useState<CourseMaster[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalElements, setTotalElements] = useState(0)
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    course: CourseMaster | null
  }>({
    isOpen: false,
    course: null,
  })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState('')
  const [searchType, setSearchType] = useState('')
  const [keyword, setKeyword] = useState('')
  const [query, setQuery] = useState<CoursesQuery>({
    page: 1,
    size: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  })

  const alert = useAlert()

  useEffect(() => {
    fetchCourses()
  }, [query])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await coursesApi.getMasters(query)
      setCourses(response.items)
      setTotalPages(response.meta.totalPages)
      setCurrentPage(response.meta.page)
      setTotalElements(response.meta.totalElements)
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setQuery({
      ...query,
      page: 1,
      semester: selectedSemester || undefined,
      [searchType]: keyword || undefined,
    })
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getPlaceholder = () => {
    const typeLabel = SEARCH_TYPE_OPTIONS.find(
      opt => opt.value === searchType
    )?.label
    return typeLabel && typeLabel !== '전체'
      ? `${typeLabel} 검색`
      : '검색어 입력'
  }

  const handleDelete = async () => {
    if (!deleteModal.course) return

    try {
      setDeleteLoading(true)
      await coursesApi.deleteMaster(deleteModal.course.id)
      alert.success('운영과목이 삭제되었습니다.')
      setDeleteModal({ isOpen: false, course: null })
      fetchCourses()
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Title>운영과목 관리</Title>
          <p className="text-body-14 text-gray-600 mt-2">
            총 {totalElements}개의 운영과목이 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/courses/master/bulk-upload">
            <Button variant="info" radius="md" size="md">
              일괄 업로드
            </Button>
          </Link>
          <Link to="/admin/courses/master/create">
            <Button variant="info" radius="md" size="md">
              개별 등록
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체 <span className="text-pri-500">{totalElements}</span> 건
        </div>

        <div className="flex flex-wrap gap-2">
          <Dropdown
            options={SEMESTER_OPTIONS}
            value={selectedSemester}
            onChange={setSelectedSemester}
            size="md"
            className="w-32"
          />
          <Dropdown
            options={SEARCH_TYPE_OPTIONS}
            value={searchType}
            onChange={setSearchType}
            size="md"
            className="w-24"
          />
          <Input
            type="text"
            placeholder={getPlaceholder()}
            value={keyword}
            onChange={setKeyword}
            onKeyPress={handleKeyPress}
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

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-info-100">
            <table className="w-full min-w-[800px]">
              <thead className="bg-info-50 border-b border-info-100">
                <tr>
                  <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                    교과목코드
                  </th>
                  <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                    교과목명
                  </th>
                  <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                    학과
                  </th>
                  <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                    학점
                  </th>
                  <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                    학기
                  </th>
                  <th className="px-4 py-3 text-center font-body-18-medium text-gray-900">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-caption-14 text-gray-600"
                    >
                      등록된 운영과목이 없습니다.
                    </td>
                  </tr>
                ) : (
                  courses.map(course => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-body-14-medium text-gray-600">
                        {course.courseCode}
                      </td>
                      <td className="px-4 py-3 font-body-14-medium text-gray-600">
                        <div className="font-medium">{course.subjectName}</div>
                        {course.englishName && (
                          <div className="text-xs text-gray-500">
                            {course.englishName}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-body-14-medium text-gray-600">
                        {course.department}
                      </td>
                      <td className="px-4 py-3 font-body-14-medium text-gray-600">
                        {course.credit}학점
                      </td>
                      <td className="px-4 py-3 font-body-14-medium text-gray-600">
                        {course.semester}
                      </td>
                      <td className="px-4 py-3 font-body-14-medium text-gray-600">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/courses/master/edit/${course.id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                          >
                            <Button variant="unstyled" size="sm" radius="md">
                              수정
                            </Button>
                          </Link>
                          <Button
                            variant="delete"
                            size="sm"
                            radius="md"
                            onClick={() =>
                              setDeleteModal({ isOpen: true, course })
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

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
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

              {Array.from({ length: Math.min(5, totalPages || 1) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-2 text-caption-14 rounded ${
                      currentPage === pageNum
                        ? 'text-pri-500 font-semibold'
                        : 'text-gray-900 hover:text-pri-500'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}

              {totalPages > 5 && (
                <>
                  <span className="px-2 text-gray-900">...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className="px-3 py-2 text-caption-14 text-text hover:text-pri-500"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages || 1, currentPage + 1))
                }
                disabled={currentPage === (totalPages || 1)}
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
          )}
        </>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, course: null })}
        onConfirm={handleDelete}
        title="운영과목 삭제"
        message={`"${deleteModal.course?.subjectName}" 운영과목을 삭제하시겠습니까?`}
        warningMessage="삭제된 데이터는 복구할 수 없습니다."
        confirmText="삭제"
        loading={deleteLoading}
      />
    </div>
  )
}
