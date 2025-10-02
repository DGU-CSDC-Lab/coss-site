import Button from '@/components/common/Button'
import SubTitle from '@/components/common/SubTitle'
import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'
import Image from 'next/image'

export default function InfrastructurePage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">인프라</Title>
      <div className="flex-1 flex flex-row justify-between items-end mb-4">
        <SubTitle className="mb-0">1) 교육 공간 및 스튜디오</SubTitle>
        <Button size="md" variant="info" disabled={true} radius="md">
          시설 예약
        </Button>
      </div>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/support/infrastructure/1-1.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={144}
          className="w-full h-auto"
          priority
        />
      </div>
      <SubTitle className="my-4">2) 서버 및 컴퓨팅 자원</SubTitle>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/support/infrastructure/1-2.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={144}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  )
}
