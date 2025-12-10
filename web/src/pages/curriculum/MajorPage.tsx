import Information from '@/components/common/Information'
import SubTitle from '@/components/common/title/SubTitle'
import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'

export default function MajorPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Information type="info" className="mb-4">
        지능 IoT 학과는 단일 전공 없이 복수 전공과 연계 전공으로만 운영 됩니다.
      </Information>
      <Title className="mb-4">지능 IoT 학과</Title>
      <SubTitle className="mb-4">1) 복수전공</SubTitle>
      <div className="flex flex-col gap-8">
        <img
          src="/assets/images/pages/curriculum/major/iot/1-1.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
      </div>
      <SubTitle className="my-4">2) 부전공</SubTitle>
      <div className="flex flex-col gap-8">
        <img
          src="/assets/images/pages/curriculum/major/iot/1-2.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
      </div>
      <div className="h-12" />
    </div>
  )
}
