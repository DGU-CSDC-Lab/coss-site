import SubTitle from '@/components/common/title/SubTitle'
import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'

export default function CoWeekPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">CO-Week Academy</Title>
      <SubTitle className="mb-4">
        혁신융합대학이 현실에 나타나는 POP-UP 캠퍼스
      </SubTitle>
      <ul className="list-disc pl-6 space-y-2 text-gray-700 font-body-14-regular leading-relaxed mb-4">
        <li>지능형 사물인터넷(AIoT)을 위한 소형 AI 모델 개발 방법론</li>
        <li>팀 단위 문제 해결, 발표 중심 합숙형 집중 프로그램</li>
      </ul>
      <div className="flex flex-col gap-8 items-center">
        <img
          src="/assets/images/pages/support/programs/co-week.png"
          alt="학과 소개 이미지"
          className="w-full max-w-5xl h-auto"
        />
      </div>
    </div>
  )
}
