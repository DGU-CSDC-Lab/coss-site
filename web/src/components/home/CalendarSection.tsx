import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { schedulesApi, Schedule } from '@/lib/api/schedules'
import Button from '@/components/common/Button'
import EmptyState from '@/components/common/EmptyState'
import { useAlert } from '@/hooks/useAlert'

export default function CalendarSection() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [monthEvents, setMonthEvents] = useState<Schedule[]>([])

  const alert = useAlert()

  useEffect(() => {
    fetchMonthEvents()
  }, [currentDate])

  const fetchMonthEvents = async () => {
    try {
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const response = await schedulesApi.getSchedules({
        year,
        month: `${year}-${month}`,
      })
      setMonthEvents(response.items)
    } catch (error) {
      alert.error((error as Error).message)
    }
  }

  const getEventsForDate = (date: Date) => {
    return monthEvents.filter(event => {
      const eventDate = new Date(event.startDate)
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const getEventsAfterDate = (date: Date) => {
    return monthEvents
      .filter(event => new Date(event.startDate) >= date)
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      )
      .slice(0, 4)
  }

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    )
  }

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    )
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    // Previous month's days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`prev-${i}`} className="text-gray-600 p-2"></div>)
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      )
      const hasEvent = getEventsForDate(dayDate).length > 0
      const isSelected =
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear()

      // 오늘인지 판별
      const today = new Date()
      const isToday =
        dayDate.getDate() === today.getDate() &&
        dayDate.getMonth() === today.getMonth() &&
        dayDate.getFullYear() === today.getFullYear()

      days.push(
        <div key={day} className="text-center relative">
          <div className="p-2 flex flex-col items-center h-12 justify-center">
            <button
              onClick={() => setSelectedDate(dayDate)}
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 relative
            ${
              isSelected
                ? 'bg-pri-800 text-white scale-105'
                : isToday
                  ? 'text-pri-800' // 오늘 날짜 스타일
                  : 'hover:bg-gray-100 hover:scale-105'
            }`}
            >
              {day}
              {hasEvent && (
                <div
                  className={`absolute -top-2 rounded-full ${isToday ? 'w-2 h-2 bg-pri-800' : 'w-1 h-1 bg-point-1'}`}
                ></div>
              )}
            </button>
          </div>
        </div>
      )
    }

    return days
  }

  const monthNames = [
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

  return (
    <div className="bg-white flex flex-col gap-3 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-body-20-medium text-gray-900 select-none">학사일정</h2>
        <Link to="/about/schedule">
          <Button radius="md" size="sm" variant="point_2">
            더보기
          </Button>
        </Link>
      </div>

      <hr className="border-gray-200 mb-3" />

      <div className="grid pc:grid-cols-2 tablet:grid-cols-1 gap-8 mobile:grid-cols-1">
        {/* Calendar */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <button onClick={goToPreviousMonth}>
              <ChevronLeftIcon className="w-5 h-5 text-pri-800" />
            </button>
            <h3 className="text-body-16-bold text-gray-900 select-none">
              {monthNames[currentDate.getMonth()]}
            </h3>
            <button onClick={goToNextMonth}>
              <ChevronRightIcon className="w-5 h-5 text-pri-800" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-caption-12 text-gray-600">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
              <div
                key={index}
                className={`text-center text-caption-12 p-2 ${index === 0 || index === 6 ? 'text-point-1' : ''}`}
              >
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>

        {/* Events List */}
        <div className="">
          {getEventsAfterDate(selectedDate).length > 0 ? (
            getEventsAfterDate(selectedDate).map((event, index) => {
              const eventDate = new Date(event.startDate)
              const today = new Date()
              const isToday =
                eventDate.getDate() === today.getDate() &&
                eventDate.getMonth() === today.getMonth() &&
                eventDate.getFullYear() === today.getFullYear()

              return (
                <div key={event.id}>
                  <div className="py-2">
                    {/* 날짜 색상 조건부 변경 */}
                    <div
                      className={`text-caption-14 mb-1 ${
                        isToday ? 'text-pri-800' : 'text-point-1'
                      }`}
                    >
                      {eventDate.toLocaleDateString('ko-KR')}
                    </div>
                    <div className="text-body-14-regular text-gray-900 hover:text-point-1 flex-1 truncate">
                      {event.title}
                    </div>
                  </div>
                  {index < getEventsAfterDate(selectedDate).length - 1 && (
                    <div className="border-b border-dashed border-gray-300"></div>
                  )}
                </div>
              )
            })
          ) : (
            <EmptyState message="선택한 날짜 이후 일정이 없습니다." />
          )}
        </div>
      </div>
    </div>
  )
}
