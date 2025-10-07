import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'
import Calendar from '@/components/schedule/Calendar'

export default function SchedulePage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">학사일정</Title>
      <Calendar />
    </div>
  )
}
