import Information from '@/components/common/Information'
import SubTitle from '@/components/common/SubTitle'
import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'
import Image from 'next/image'

export default function MajorIoTPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Information type="info" className="mb-4">
        지능 IoT 학과는 단일 전공 없이 복수 전공과 연계 전공으로만 운영 됩니다.
      </Information>
      <Title className="mb-4">지능 IoT 학과</Title>
      <SubTitle className="mb-4">1) 복수전공</SubTitle>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/curriculum/major/iot/1-1.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={660}
          className="w-full h-auto"
          priority
        />
      </div>
      <SubTitle className="my-4">2) 부전공</SubTitle>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/curriculum/major/iot/1-2.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={660}
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="h-12" />
      <Title className="mb-4">연계 전공</Title>
      <SubTitle className="mb-4">1) 복수전공</SubTitle>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/curriculum/major/iot/2-1.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={528}
          className="w-full h-auto"
          priority
        />
      </div>
      <SubTitle className="my-4">2) 부전공</SubTitle>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/curriculum/major/iot/2-2.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={528}
          className="w-full h-auto"
          priority
        />
      </div>
    </div>
  )
}
