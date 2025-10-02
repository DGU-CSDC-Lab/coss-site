import SubTitle from '@/components/common/SubTitle'
import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'

export default function WeMeetPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">We-Meet</Title>
      <SubTitle className="mb-4">
        산학 프로젝트 기반 진로, 교육, 취업 연계 '원스톱' 모델
      </SubTitle>
      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-body-14-regular leading-relaxed mb-4">
        <li>
          지능형 사물인터넷(AIoT) 실무 역량을 팀 프로젝트로 검증하고, 캡스톤,
          인턴, 취, 창업까지 연계
        </li>
        <li>
          운영 구조 : 기업 RFP 수령 → 팀 매칭, 멘토링 →
          교과(종합설계/융합캡스톤) 연계 수행 → 성과 전시/평가
        </li>
        <li>
          성과 연계 : 우수팀은 In-Class Challenge → In-Jeju Challenge 본선 진출
        </li>
      </ul>
    </div>
  )
}
