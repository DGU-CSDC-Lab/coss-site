import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'
import Image from 'next/image'

export default function CoursesInnovationCollegePage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">이수체계도</Title>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/waiting.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={100}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  )
}
