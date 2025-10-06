import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'

export default function ScholarshipPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">장학제도</Title>
      <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">성적우수장학금</h3>
          <p className="text-gray-700 mb-4">
            학업성취도가 우수한 학생에게 지급되는 장학금입니다.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>직전학기 평점평균 3.5 이상</li>
            <li>수혜횟수 제한 없음</li>
            <li>등록금의 50% 지원</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">연구참여장학금</h3>
          <p className="text-gray-700 mb-4">
            연구 프로젝트에 참여하는 학생에게 지급되는 장학금입니다.
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>교수 추천 필요</li>
            <li>연구 참여 기간 동안 지급</li>
            <li>월 50만원 지원</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
