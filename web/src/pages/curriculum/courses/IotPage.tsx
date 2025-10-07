import Title from '@/components/common/title/Title'
import Tabs from '@/components/tabs/Tabs'

export default function IotPage() {
  return (
    <div className="w-full">
      <Tabs />
      <Title className="mb-4">이수체계도</Title>
      <div className="flex flex-col gap-8">
        <img
          src="/assets/images/pages/waiting.png"
          alt="학과 소개 이미지"
          className="w-full h-auto"
        />
      </div>
    </div>
  )
}
