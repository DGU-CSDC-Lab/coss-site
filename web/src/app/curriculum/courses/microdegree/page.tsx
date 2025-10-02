import Information from '@/components/common/Information'
import SubTitle from '@/components/common/SubTitle'
import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'
import Image from 'next/image'

export default function CoursesMicrodegreePage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">공유형 마이크로디그리</Title>
      <Information type="info" className="mb-4">
        5개 대학이 공동으로 개설 및 운영합니다.
      </Information>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/curriculum/courses/microdegree/1-1.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={286}
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="h-12" />
      <Title className="mb-4">교류형 마이크로디그리</Title>
      <Information type="info" className="mb-4">
        참여 대학별 특화
        분야(IoT네트워킹/IoT디바이스/IoT플랫폼/IoT인공지능/IoT인공지능보안)를
        운영하고 3개의 이론 과목과 1개의 오프라인 설계 과목으로 운영합니다.
      </Information>
      <div className="flex flex-col gap-8">
        <Image
          src="/assets/images/pages/curriculum/courses/microdegree/2-1.png"
          alt="학과 소개 이미지"
          width={1440} // 원본 비율에 맞는 width/height 넣기
          height={432}
          className="w-full h-auto"
          priority
        />
      </div>
      <div className="h-12" />
      <Title className="mb-4">
        특화형 마이크로디그리 (마이크로디그리별 확인)
      </Title>
      <SubTitle className="mb-4">1) 이론 과목 이수학점</SubTitle>
      <Image
        src="/assets/images/pages/curriculum/courses/microdegree/3-1.png"
        alt="학과 소개 이미지"
        width={1440} // 원본 비율에 맞는 width/height 넣기
        height={684}
        className="w-full h-auto"
        priority
      />
    </div>
  )
}
