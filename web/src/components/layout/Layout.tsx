'use client'

import { usePathname } from 'next/navigation'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import Footer from './Footer'
import PageHeader from '../tabs/PageHeader'
import clsx from 'clsx'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname()

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
          'flex-1 flex flex-col px-12 py-18 mobile:px-4 mobile:py-6 tablet:px-5 tablet:py-7',
          isAdminPage
            ? 'w-full' // admin 페이지: 전체 너비 사용
            : 'w-full max-w-6xl mx-auto', // 일반 페이지: 가운데 정렬된 최대 너비
          isLoginPage
            ? 'items-center justify-center' // 로그인 페이지: 중앙 정렬
            : 'items-start' // 일반/관리자 페이지: 위에서 시작
        )}
      >
        {/* 페이지 헤더 (있을 때만) */}
        {shouldShowHeader && <PageHeader />}

        {/* 메인 콘텐츠 */}
        {children}
      </main>

      <div className="h-30 mobile:h-24 tablet:h-20" />
      <Footer />
      <Sidebar />
    </div>
  )
}

export default Layout
