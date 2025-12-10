import SubTitle from '@/components/common/title/SubTitle'
import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'

export default function CoShowPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">Co-Show</Title>
      <SubTitle className="mb-4">
        COSS 컨소시엄이 함께하는 종합 경진, 체험, 교육 페스티벌
      </SubTitle>
      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-body-14-regular leading-relaxed mb-4">
        <li>
          기간 및 장소 : 2025.11.26 (수) ~ 11.29 (토), 부산 BEXCO 제1전시장
        </li>
        <li>
          경진대회 : 24개 분야 (인공지능, 빅데이터, 차세대반도체, 미래자동차,
          바이오헬스, 실감미디어, 지능형로봇, 에너지신산업, 항공드론, 사물인터넷
          등)
        </li>
        <li>
          체험, 교육 프로그램 : 총 49개 프로그램 (사물인터넷, AIoT 체험, 차세대
          통신, 드론, 데이터보안 등)
        </li>
      </ul>
      <div className="flex flex-col gap-8 items-center">
        <img
          src="/assets/images/pages/support/programs/co-show.png"
          alt="학과 소개 이미지"
          className="max-w-5xl h-auto"
        />
      </div>
    </div>
  )
}
