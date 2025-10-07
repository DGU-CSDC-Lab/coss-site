import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'

export default function IntroductionPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">학과 소개</Title>
      <div className="flex flex-col gap-8">
        <img
          src="/assets/images/pages/about/introduction/1-1.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
        <img
          src="/assets/images/pages/about/introduction/1-2.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
        <img
          src="/assets/images/pages/about/introduction/1-3.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
      </div>
      <div className="h-12" />
      <Title>마이크로디그리 신청 및 이수 혜택</Title>
      <div className="h-12" />
      <div className="flex flex-col gap-8">
        <img
          src="/assets/images/pages/about/introduction/2-1.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
      </div>
      <div className="h-12" />
      <Title>공유형, 교류형, 특화형 마이크로디그리 소개</Title>
      <div className="h-12" />
      <img
        src="/assets/images/pages/about/introduction/3-1.png"
        alt="학과 소개 이미지"
        className="w-full h-auto"
      />
    </div>
  )
}
