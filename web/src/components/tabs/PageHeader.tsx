'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import menuConfig from '@/config/menuConfig'

const PageHeader = () => {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean) // 예: ["about", "greeting"]
  
  // 1. main 메뉴 찾기
  const main = menuConfig.find(m => m.path === `/${segments[0]}`)
  // 2. sub 메뉴 찾기 (절대 경로로 비교)
  const sub = main?.children?.find(c => c.path === pathname)

  if (!main) return null

  return (
    <div className="relative w-full rounded-lg overflow-hidden mb-12">
      {/* 배경 이미지 */}
      <Image
        src="/assets/images/header_bg.png"
        alt="banner"
        fill
        className="object-cover absolute inset-0"
      />

      {/* 텍스트 영역 */}
      <div className="relative z-10 px-6 py-12">
        <h1 className="text-white font-heading-24">{main.name}</h1>
        <p className="text-white font-body-20-regular">{sub?.name}</p>
      </div>
    </div>
  )
}

export default PageHeader
