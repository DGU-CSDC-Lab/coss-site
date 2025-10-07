import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import menuConfig from '@/config/menuConfig'

export default function RedirectToFirst() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const pathname = location.pathname
    const segments = pathname.split('/').filter(Boolean)
    
    // 현재 경로에 해당하는 메뉴 찾기
    const main = menuConfig.find(m => m.path === `/${segments[0]}`)
    const sub = main?.children?.find(c => c.path === pathname)
    
    // 하위 메뉴가 있으면 첫 번째 하위 메뉴로 리다이렉트
    if (sub?.children && sub.children.length > 0) {
      navigate(sub.children[0].path, { replace: true })
    }
  }, [navigate, location.pathname])

  return null
}
