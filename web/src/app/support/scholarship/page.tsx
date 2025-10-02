import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'
import SubTitle from '@/components/common/SubTitle'
import Image from 'next/image'

export default function ScholarshipPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">장학금</Title>
      <SubTitle className="mb-4">1) 성적 우수자</SubTitle>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/support/scholarship/1-1.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={144}
          className="w-full h-auto"
          priority
        />
      </div>
      <SubTitle className="my-4">2) 경진대회 우수자</SubTitle>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/support/scholarship/1-2.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={144}
          className="w-full h-auto"
          priority
        />
      </div>

      <div className="h-12" />

      <Title className="mb-4">인턴십 연계</Title>
      <SubTitle className="mb-4">1) 국내 인턴십</SubTitle>
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
      <SubTitle className="my-4">2) 해외 인턴십</SubTitle>
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
