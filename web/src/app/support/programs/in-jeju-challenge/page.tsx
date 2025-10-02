import SubTitle from '@/components/common/SubTitle'
import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'

export default function InJejuChallengePage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">In-Jeju Challenge</Title>
      <SubTitle className="mb-4">
        대학-기업-지자체가 함께 만드는 현장 기반 IoT 프로젝트 경진대회
      </SubTitle>
      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-body-14-regular leading-relaxed mb-4">
        <li>
          기간 및 장소 : 2025.08.18 (월) ~ 08.21 (목), 메종글래드 제주
          (컨벤션홀), 아라컨벤션홀, 제주 일대
        </li>
        <li>참가 : 5개 대학</li>
        <li>시상 : 대상 1팀, 최우수상 5팀, 우수상 5팀, 입선 9팀</li>
        <li>후속 연계 : 우수팀 글로벌 프로그램, 인턴십/취, 창업 연계</li>
      </ul>
    </div>
  )
}
