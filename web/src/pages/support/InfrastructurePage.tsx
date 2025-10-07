import Button from '@/components/common/Button'
import SubTitle from '@/components/common/title/SubTitle'
import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'

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
        <img
          src="/assets/images/pages/support/infrastructure/1-1.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
      </div>
      <SubTitle className="my-4">2) 서버 및 컴퓨팅 자원</SubTitle>
      <div className="flex flex-col gap-8">
        <img
          src="/assets/images/pages/support/infrastructure/1-2.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}
