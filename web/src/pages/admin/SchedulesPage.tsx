import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { schedulesApi, Schedule } from '@/lib/api/schedules'
import { PagedResponse } from '@/lib/apiClient'
import Title from '@/components/common/title/Title'
import Button from '@/components/common/Button'
import Dropdown from '@/components/common/Dropdown'
import LoadingSpinner from '@/components/common/loading/LoadingSpinner'
import { useAlert } from '@/hooks/useAlert'
import Input from '@/components/common/Input'

export default function AdminSchedulesPage() {
  const [schedules, setSchedules] = useState<PagedResponse<Schedule> | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [selectedYear, setSelectedYear] = useState(() =>
    new Date().getFullYear().toString()
  )
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const alert = useAlert()

  const categoryOptions = [
    { value: '', label: '전체 카테고리' },
    { value: 'academic', label: '학사' },
    { value: 'admission', label: '입학' },
    { value: 'event', label: '행사' },
  ]

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 5 + i
    return { value: year.toString(), label: `${year}년` }
  })

  const monthOptions = [
    { value: '', label: '전체 월' },
    ...Array.from({ length: 12 }, (_, i) => ({
      value: (i + 1).toString().padStart(2, '0'),
      label: `${i + 1}월`,
    })),
  ]

  const dayOptions = [
    { value: '', label: '전체 일' },
    ...Array.from({ length: 31 }, (_, i) => ({
      value: (i + 1).toString().padStart(2, '0'),
      label: `${i + 1}일`,
    })),
  ]

  useEffect(() => {
    fetchSchedules()
  }, [currentPage, category, selectedYear, selectedMonth, selectedDay])

  const fetchSchedules = async () => {
    try {
      setLoading(true)

      const params: any = {
        category: category || undefined,
        search: search || undefined,
        page: currentPage,
        size: 20,
      }

      if (selectedDay && selectedMonth) {
        params.date = `${selectedYear}-${selectedMonth}-${selectedDay}`
      } else if (selectedMonth) {
        params.month = `${selectedYear}-${selectedMonth}`
      } else {
        params.year = parseInt(selectedYear)
      }

      const response = await schedulesApi.getSchedules(params)
      setSchedules(response)
    } catch (error) {
      alert.error((error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchSchedules()
  }

  const handleReset = () => {
    setSearch('')
    setCategory('')
    setSelectedYear(new Date().getFullYear().toString())
    setSelectedMonth('')
    setSelectedDay('')
    setCurrentPage(1)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" 일정을 삭제하시겠습니까?`)) return

    try {
      await schedulesApi.deleteSchedule(id)
      alert.success('일정이 삭제되었습니다.')
      fetchSchedules()
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
        <Title>학사일정 관리</Title>
        <Link to="/admin/schedules/create">
          <Button variant="info" radius="md">
            새 일정 추가
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="font-body-18-medium text-gray-900">
          전체{' '}
          <span className="text-pri-500">
            {schedules?.meta.totalElements || 0}
          </span>{' '}
          건
        </div>

        <div className="flex flex-wrap gap-2">
          <Dropdown
            value={category}
            onChange={setCategory}
            options={categoryOptions}
            size="md"
            className="sm:w-32"
          />
          <Dropdown
            value={selectedYear}
            onChange={setSelectedYear}
            options={yearOptions}
            size="md"
            className="sm:w-24"
          />
          <Dropdown
            value={selectedMonth}
            onChange={setSelectedMonth}
            options={monthOptions}
            size="md"
            className="sm:w-24"
          />
          <Dropdown
            value={selectedDay}
            onChange={setSelectedDay}
            options={dayOptions}
            size="md"
            className="sm:w-24"
          />
          <Input
            type="text"
            placeholder="일정명 검색"
            value={search}
            onChange={setSearch}
            className="px-3 py-2 border border-gray-300 rounded-md text-caption-14 w-40"
          />
          <Button
            variant="point_2"
            radius="md"
            size="md"
            onClick={handleSearch}
          >
            검색
          </Button>
          <Button variant="cancel" radius="md" size="md" onClick={handleReset}>
            초기화
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-info-100">
        <table className="w-full min-w-[800px]">
          <thead className="bg-info-50 border-b border-info-100">
            <tr>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900">
                제목
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                카테고리
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                시작일
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                종료일
              </th>
              <th className="px-4 py-3 text-left font-body-18-medium text-gray-900 w-32">
                장소
              </th>
              <th className="px-4 py-3 text-center font-body-18-medium text-gray-900 w-32">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-info-100">
            {schedules?.items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-caption-14 text-gray-600"
                >
                  등록된 일정이 없습니다.
                </td>
              </tr>
            ) : (
              schedules?.items.map(schedule => (
                <tr key={schedule.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-body-18-medium text-gray-900">
                        {schedule.title}
                      </span>
                      {schedule.description && (
                        <span className="text-caption-14 text-gray-600">
                          {schedule.description}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-caption-14 text-gray-600">
                    {schedule.category || '-'}
                  </td>
                  <td className="px-4 py-3 text-caption-14 text-gray-600">
                    {new Date(schedule.startDate).toLocaleDateString('ko-KR')}
                  </td>
                  <td className="px-4 py-3 text-caption-14 text-gray-600">
                    {schedule.endDate
                      ? new Date(schedule.endDate).toLocaleDateString('ko-KR')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-caption-14 text-gray-600">
                    {schedule.location || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <Link to={`/admin/schedules/${schedule.id}`}>
                        <Button variant="unstyled" size="sm" radius="md">
                          수정
                        </Button>
                      </Link>
                      <Button
                        variant="delete"
                        size="sm"
                        radius="md"
                        onClick={() =>
                          handleDelete(schedule.id, schedule.title)
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
        {schedules &&
          Array.from(
            { length: Math.min(5, schedules.meta.totalPages || 1) },
            (_, i) => {
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
            }
          )}

        {/* 마지막 페이지 생략 처리 */}
        {schedules && schedules.meta.totalPages > 5 && (
          <>
            <span className="px-2 text-gray-900">...</span>
            <button
              onClick={() => setCurrentPage(schedules.meta.totalPages)}
              className="px-3 py-2 text-caption-14 text-text hover:text-pri-500"
            >
              {schedules.meta.totalPages}
            </button>
          </>
        )}

        {/* 다음 버튼 */}
        <button
          onClick={() =>
            setCurrentPage(
              Math.min(schedules?.meta.totalPages || 1, currentPage + 1)
            )
          }
          disabled={currentPage === (schedules?.meta.totalPages || 1)}
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
