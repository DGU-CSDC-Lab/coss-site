


import { useLocation } from 'react-router-dom'
import menuConfig from '@/config/menuConfig'

const PageHeader = () => {
  const location = useLocation(); const pathname = location.pathname
  const segments = pathname.split('/').filter(Boolean) // 예: ["about", "greeting"]

  // 1. main 메뉴 찾기
  const main = menuConfig.find(m => m.path === `/${segments[0]}`)
  // 2. sub 메뉴 찾기 (절대 경로로 비교)
  const sub = main?.children?.find(c => c.path === pathname)

  if (!main) return null

  return (
    <div className="relative w-full rounded-lg overflow-hidden mb-12">
      {/* 배경 이미지 */}
      <img
        src="/assets/images/header_bg.png"
        alt="banner"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 텍스트 영역 */}
      <div className="relative z-10 px-6 py-12">
        <h1 className="text-white text-heading-24">{main.name}</h1>
        <p className="text-white text-body-20-regular">{sub?.name}</p>
      </div>
    </div>
  )
}

export default PageHeader
