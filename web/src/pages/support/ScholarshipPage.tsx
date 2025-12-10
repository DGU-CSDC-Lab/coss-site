import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'
import SubTitle from '@/components/common/title/SubTitle'

export default function ScholarshipPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">장학금</Title>
      <SubTitle className="mb-4">1) 성적 우수자</SubTitle>
      <div className="flex flex-col gap-8">
        <img
          src="/assets/images/pages/support/scholarship/1-1.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
      </div>
      <SubTitle className="my-4">2) 경진대회 우수자</SubTitle>
      <div className="flex flex-col gap-8">
        <img
          src="/assets/images/pages/support/scholarship/1-2.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
      </div>

      <div className="h-12" />
    </div>
  )
}
