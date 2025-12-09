import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'

export default function GreetingPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-12">학과장 인사말</Title>
      <div className="flex gap-8">
        {/* 왼쪽 이미지 영역 */}
        <div className="w-64 flex-shrink-0">
          <div className="aspect-[3/4] bg-gray-200 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 opacity-50 rounded-lg"></div>
          </div>
        </div>

        {/* 오른쪽 텍스트 영역 */}
        <div className="flex-1 text-body-18-regular">
          <div className="mb-6">
            <p className="mb-2">존경하는 교직원 여러분,</p>
            <p className="mb-2">산학 협력 파트너와 학생 여러분,</p>
            <p className="mb-6">
              그리고{' '}
              <span className="text-orange-500 text-semibold">
                사물인터넷 혁신융합대학사업단
              </span>
              을 사랑해주시는 모든 분들께 따뜻한 인사를 올립니다.
            </p>
          </div>

          <div className="space-y-4 leading-relaxed">
            <p>
              먼저, 급변하는 4차 산업혁명 시대를 맞아
              &apos;사물인터넷(IoT)&apos;이라는 영역에서 새로운 가치를
              창출하고자 하는 저희 사업단의 비전에 깊은 관심과 아낌없는 성원을
              보내주신 여러분께 진심으로 감사드립니다.
            </p>

            <p>
              오늘날 네트워크로 연결된 스마트 디바이스는 우리 일상의 단순한
              편의를 넘어 제조업, 의료, 교통, 에너지 관리 등 사회 전반의
              패러다임을 혁신하고 있습니다. 이에 발맞춰 우리 대학사업단은 학제
              간 경계를 허무는 융합 교육과 연구, 그리고 현장중심의 산학협력
              프로젝트를 통해{' '}
              <span className="text-orange-500 text-semibold">
                실질적 문제 해결 능력을 갖춘 인재를 양성하고, 국가·지역사회
                발전에 기여하는 것을 핵심 과제로 삼고 있습니다.
              </span>
            </p>

            <p>
              지난 해부터 저희는{' '}
              <span className="text-orange-500 text-semibold">
                스마트 팩토리 예측정비 플랫폼 개발 △ 실감 의료 모니터링 시스템 △
                스마트 시티 교통관제 시뮬레이션
              </span>{' '}
              등 다수의 혁신 과제를 성공적으로 수행하며, 학내·외에서{' '}
              <span className="text-orange-500 text-semibold">
                의미 있는 성과를
              </span>{' '}
              이뤄냈습니다.
            </p>

            <p>
              이 모든 것은 교수님들의 헌신적인 연구 노력과, 기업 파트너 여러분의
              적극적인 기술 협업, 그리고 열정 가득한 학생 여러분의 도전 정신이
              어우러진 덕분이라 생각합니다. 특히 산업 현장의 목소리를 귀 기울여
              반영하고, 캡스톤 디자인 과제와 연계하여 실제 프로토타입을 구현하는
              과정에서 참여자 모두가 성장하는 경험을 쌓을 수 있었다는 점이
              무엇보다 소중합니다.
            </p>

            <p>
              올해에도 저희 사업단은{' '}
              <span className="text-orange-500 text-semibold">
                &apos;지속 가능한 스마트 솔루션&apos;
              </span>
              이라는 가치를 중심에 두고, AI·빅데이터·블록체인 등 첨단 기술을
              결합한 IoT 연구를 심화해 나갈 예정입니다. 더불어 지역 중소기업과의
              협업 범위를 확대하여, 대학이 보유한 지식과 기술이 실질적인 산업
              경쟁력 강화로 이어지도록 지원체계를 한층 강화하겠습니다. 이를 위해
              여러분의 창의적인 아이디어와 현장 경험이 더욱 절실히 필요합니다.
              언제든지 사업단 문을 두드려 주시고, 함께 토론하고 소통하여 주시길
              부탁드립니다.
            </p>

            <p>
              마지막으로, 도전하고 배우며 성장하는 여정 속에서 서로에게 든든한
              동반자가 되어 주실 것을 당부드리며, 우리 사물인터넷
              혁신융합대학사업단이 더욱 큰 도약과 변화를 이끌어 나갈 수 있도록
              여러분의 변함없는 관심과 성원을 다시 한번 부탁드립니다.
              감사합니다.
            </p>
          </div>

          <div className="h-12" />
          <p className="w-full text-subheading-24 text-right">
            동국대학교 사물인터넷 혁신융합대학사업단장 정준호
          </p>
        </div>
      </div>
    </div>
  )
}
