'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
} from '@heroicons/react/24/solid'
import { schedulesApi, Schedule } from '@/lib/api/schedules'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [hoveredDate, setHoveredDate] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const today = new Date()

  useEffect(() => {
    fetchSchedules()
  }, [currentDate])

  const fetchSchedules = async () => {
    try {
      setLoading(true)
      const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
      const response = await schedulesApi.getSchedules({ month: monthStr })
      setSchedules(response.items)
    } catch (error) {
      console.error('Failed to fetch schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // 이전 달 날짜들
    const prevMonth = new Date(year, month - 1, 0)
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    // 현재 달 날짜들
    for (let date = 1; date <= daysInMonth; date++) {
      const isToday =
        year === today.getFullYear() &&
        month === today.getMonth() &&
        date === today.getDate()

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
      })
    }

    // 다음 달 날짜들 (42개 셀 채우기)
    const remainingCells = 42 - days.length
    for (let date = 1; date <= remainingCells; date++) {
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
      })
    }

    return days
  }

  const getSchedulesForDate = (date: number) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startDate)
      return (
        scheduleDate.getDate() === date &&
        scheduleDate.getMonth() === month &&
        scheduleDate.getFullYear() === year
      )
    })
  }

  const changeYear = (direction: number) => {
    setCurrentDate(new Date(year + direction, month, 1))
  }

  const selectMonth = (selectedMonth: number) => {
    setCurrentDate(new Date(year, selectedMonth, 1))
  }

  const handleMouseEnter = (date: number, event: React.MouseEvent) => {
    setHoveredDate(date)
    setMousePosition({ x: event.clientX, y: event.clientY })
  }

  const handleMouseLeave = () => {
    setHoveredDate(null)
  }

  const days = getDaysInMonth()
  const months = [
    '1월',
    '2월',
    '3월',
    '4월',
    '5월',
    '6월',
    '7월',
    '8월',
    '9월',
    '10월',
    '11월',
    '12월',
  ]
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']

  return (
    <div className="">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeYear(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <h2 className="font-heading-24 text-text">
          {year}년 <span className="text-pri-500">{month + 1}월</span>
        </h2>

        <button
          onClick={() => changeYear(1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* 월 선택 탭 */}
      <div className="grid grid-cols-12">
        {months.map((monthName, index) => (
          <button
            key={index}
            onClick={() => selectMonth(index)}
            className={`w-full py-2 font-body-16-medium ${
              index === month
                ? 'bg-point-2 text-white'
                : 'bg-white text-text hover:bg-gray-100'
            }`}
          >
            {monthName}
          </button>
        ))}
      </div>

      <div className="h-4" />

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 bg-point-2">
        {weekdays.map(day => (
          <div
            key={day}
            className="p-2 text-center font-body-16-medium text-white"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 border-l border-t border-surface">
        {days.map((day, index) => {
          const daySchedules = day.isCurrentMonth
            ? getSchedulesForDate(day.date)
            : []

          return (
            <div
              key={index}
              className="min-h-[120px] border-r border-b border-surface p-2 relative"
            >
              <div
                className={`font-caption-14 mb-2 ${
                  day.isCurrentMonth
                    ? day.isToday
                      ? 'w-6 h-6 bg-pri-500 text-white rounded-full flex items-center justify-center'
                      : 'text-text'
                    : 'text-text-lighter'
                }`}
              >
                {day.date}
              </div>

              {/* 일정 목록 */}
              <div className="space-y-1">
                {daySchedules.slice(0, 3).map((schedule, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <PlayIcon className="w-2 h-2 text-point-1 flex-shrink-0" />
                    <span
                      className="font-caption-12 text-gray-600 truncate cursor-pointer hover:text-gray-900 px-1 rounded"
                      onMouseEnter={e => handleMouseEnter(day.date, e)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {schedule.title}
                    </span>
                  </div>
                ))}
                {daySchedules.length > 3 && (
                  <div className="font-caption-12 text-text-light">
                    +{daySchedules.length - 3}개 더
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 호버 툴팁 */}
      {hoveredDate && (
        <div
          className="fixed z-50 bg-info-50 rounded-lg p-4 max-w-md"
          style={{
            left: mousePosition.x + 0,
            top: mousePosition.y - 0,
          }}
        >
          {/* 우측: 상세 정보 */}
          <div className="flex flex-col space-y-1">
            {getSchedulesForDate(hoveredDate).map((schedule, index) => (
              <div key={index}>
                <div className="flex flex-col items-start gap-2 mb-1">
                  <span className="font-caption-12 text-point-1">
                    {new Date(schedule.startDate).toLocaleDateString('ko-KR')}
                  </span>
                  <div className="flex items-center gap-1">
                    <PlayIcon className="w-2 h-2 text-point-1 flex-shrink-0" />
                    <span className="font-caption-14">{schedule.title}</span>
                  </div>
                </div>
                <div className="font-caption-14 text-point-1 ml-2">
                  {schedule.description || ''}
                </div>
                {schedule.location && (
                  <div className="font-caption-12 text-point-1 ml-2">
                    {schedule.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
