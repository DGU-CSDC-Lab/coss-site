import Calendar from '@/components/schedule/Calendar'
import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'

export default function SchedulePage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">학사일정</Title>
      <Calendar />
    </div>
  )
}
