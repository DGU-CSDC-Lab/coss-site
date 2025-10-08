/**
 * ConditionalLayout 컴포넌트
 * - 특정 조건에 따라 Layout 적용 여부를 결정하는 로직을 담당
 * - 관리자 생성/업로드 페이지에서는 Layout 없이 전체 화면 모드로 동작
 * - 나머지 페이지들은 Layout을 적용하여 일관된 UI 구조 제공
 */
import { useLocation, Outlet } from 'react-router-dom'
import Layout from '@/components/layout/Layout'

export default function ConditionalLayout() {
  const location = useLocation()
  const isAdminCreateOrEditPage = location.pathname.startsWith('/admin/') && 
    (location.pathname.endsWith('/create') || 
     location.pathname.includes('/bulk-upload') ||
     /\/admin\/[^/]+\/\d+/.test(location.pathname) || // /admin/module/id 패턴
     /\/admin\/[^/]+\/[^/]+\/\d+/.test(location.pathname)) // /admin/module/submodule/id 패턴

  if (isAdminCreateOrEditPage) {
    return <Outlet />
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  )
}
