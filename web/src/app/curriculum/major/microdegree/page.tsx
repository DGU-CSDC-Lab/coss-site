import Information from '@/components/common/Information'
import SubTitle from '@/components/common/SubTitle'
import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'
import Image from 'next/image'

export default function MajorMicrodegreePage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">공유형 마이크로디그리</Title>
      <SubTitle className="mb-4">1) 이론 과목 이수학점</SubTitle>
      <Information type="info" className="mb-4">
        이론 과목 3 과목은 온라인 수강이 가능합니다.
      </Information>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/curriculum/major/microdegree/1-1.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={264}
          className="w-full h-auto"
          priority
        />
      </div>
      <SubTitle className="my-4">2) IoT STAR 프로젝트</SubTitle>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/curriculum/major/microdegree/1-2.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={492}
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="h-12" />
      <Title className="mb-4">교류형 마이크로디그리</Title>
      <SubTitle className="mb-4">1) 이수학점</SubTitle>
      <Information type="info" className="mb-4">
        참여 대학별 특화 교육은 1~10주차 온라인 운영, 11~15주차 오프라인
        운영(제주도)입니다.
      </Information>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/curriculum/major/microdegree/2-1.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={264}
          className="w-full h-auto"
          priority
        />
      </div>
      <SubTitle className="my-4">2) 런케이션 (선택)</SubTitle>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/curriculum/major/microdegree/2-2.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={180}
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="h-12" />
      <Title className="mb-4">
        특화형 마이크로디그리 (마이크로디그리별 확인)
      </Title>
      <SubTitle className="mb-4">1) 이수학점</SubTitle>
      <Image
        src="/assets/images/pages/curriculum/major/microdegree/3-1.png"
        alt="학과 소개 이미지"
        width={1440} // 원본 비율에 맞는 width/height 넣기
        height={1020}
        className="w-full h-auto"
        priority
      />
    </div>
  )
}
