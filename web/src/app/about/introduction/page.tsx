import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'
import Image from 'next/image'

export default function IntroductionPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">학과 소개</Title>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/about/introduction/1-1.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={286}
          className="w-full h-auto"
          priority
        />
        <Image
          src="/assets/images/pages/about/introduction/1-2.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={888}
          className="w-full h-auto"
          priority
        />
        <Image
          src="/assets/images/pages/about/introduction/1-3.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={264}
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="h-12" />
      <Title>마이크로디그리 신청 및 이수 혜택</Title>
      <div className="h-12" />
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/about/introduction/2-1.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={432}
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="h-12" />
      <Title>공유형, 교류형, 특화형 마이크로디그리 소개</Title>
      <div className="h-12" />
      <Image
        src="/assets/images/pages/about/introduction/3-1.png"
        alt="학과 소개 이미지"
        width={1440} // 원본 비율에 맞는 width/height 넣기
        height={684}
        className="w-full h-auto"
        priority
      />
    </div>
  )
}
