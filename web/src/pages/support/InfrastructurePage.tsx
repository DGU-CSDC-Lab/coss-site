import Title from '@/components/common/Title'
import Tabs from '@/components/tabs/Tabs'

export default function InfrastructurePage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">인프라</Title>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">IoT 실습실</h3>
          <p className="text-gray-700">
            최신 IoT 장비와 개발 환경을 갖춘 실습실입니다.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">스마트팩토리 실습실</h3>
          <p className="text-gray-700">
            산업용 IoT 시스템을 체험할 수 있는 실습 공간입니다.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">AI 연구실</h3>
          <p className="text-gray-700">
            인공지능 연구를 위한 고성능 컴퓨팅 환경을 제공합니다.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">창작공간</h3>
          <p className="text-gray-700">
            학생들의 창의적 프로젝트를 위한 메이커 스페이스입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
