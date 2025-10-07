


import { useLocation } from 'react-router-dom'
import menuConfig from '@/config/menuConfig'

const PageHeader = () => {
  const location = useLocation(); const pathname = location.pathname
  const segments = pathname.split('/').filter(Boolean) // 예: ["curriculum", "courses", "microdegree"]

  // 1. main 메뉴 찾기
  const main = menuConfig.find(m => m.path === `/${segments[0]}`)
  
  // 2. sub 메뉴 찾기 (2depth와 3depth 모두 검색)
  let sub = main?.children?.find(c => c.path === pathname)
  
  // 3depth인 경우 부모 메뉴 찾기
  if (!sub && segments.length >= 3) {
    const parentPath = `/${segments[0]}/${segments[1]}`
    sub = main?.children?.find(c => c.path === parentPath)
  }

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
      <div className="relative z-10 px-6 py-12 select-none">
        <h1 className="text-white text-heading-24">{main.name}</h1>
        <p className="text-white text-body-20-regular">{sub?.name}</p>
      </div>
    </div>
  )
}

export default PageHeader
