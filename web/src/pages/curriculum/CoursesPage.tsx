import Information from '@/components/common/Information'
import SubTitle from '@/components/common/title/SubTitle'
import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'

export default function CoursesPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">지능 IoT 학과</Title>
      <div className="flex flex-col gap-8">
        <img
          src="/assets/images/pages/curriculum/courses/flowchart.png"
          alt="이수체계도"
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}
