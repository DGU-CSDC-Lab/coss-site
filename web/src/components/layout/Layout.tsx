/**
 * Layout 컴포넌트
 * - 실제 레이아웃 구조와 스타일링을 담당
 * - TopNav, Sidebar, Footer, PageHeader 등의 공통 UI 요소들을 포함
 * - 페이지별 조건에 따라 레이아웃 스타일을 동적으로 조정
 */
import { useLocation } from 'react-router-dom'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import Footer from './Footer'
import PageHeader from '../tabs/PageHeader'
import clsx from 'clsx'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()
  const pathname = location.pathname

  // 배너를 표시하지 않을 페이지들
  const excludedRoutes = ['/', '/login']
  const shouldShowHeader = !excludedRoutes.includes(pathname)

  // 로그인 페이지 여부 체크
  const isLoginPage = pathname === '/login'
  // admin 페이지 여부 체크
  const isAdminPage = pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-bg-white flex flex-col">
      <TopNav />
      {/* 메인 콘텐츠 영역 : login인 경우에만 중앙 정렬*/}
      <main
        className={clsx(
          'flex-1 flex flex-col px-4 py-6 sm:px-5 sm:py-7 md:px-12 md:py-18',
          isAdminPage
            ? 'w-full' // admin 페이지만 전체폭
            : 'w-full max-w-7xl mx-auto', // 일반 페이지는 중앙 정렬 + 전체 너비
          isLoginPage ? 'items-center justify-center' : 'items-start'
        )}
      >
        {/* 페이지 헤더 (있을 때만) */}
        {shouldShowHeader && <PageHeader />}

        {/* 메인 콘텐츠 */}
        {children}
      </main>

      <div className="h-12 md:h-20 sm:h-16" />
      <Footer />
      <Sidebar />
    </div>
  )
}

export default Layout
