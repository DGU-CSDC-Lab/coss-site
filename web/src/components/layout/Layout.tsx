'use client'

import { usePathname } from 'next/navigation'
import TopNav from './TopNav'
import Sidebar from './Sidebar'
import Footer from './Footer'
import PageHeader from '../tabs/PageHeader'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname()

  // 배너를 표시하지 않을 페이지들
  const excludedRoutes = ['/', '/login']
  const shouldShowHeader = !excludedRoutes.includes(pathname)

  return (
    <div className="min-h-screen bg-bg-white flex flex-col">
      <TopNav />

      <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-12 py-18 mobile:px-4 mobile:py-6 tablet:px-5 tablet:py-7">
        {/* 페이지 헤더 (있을 때만) */}
        {shouldShowHeader && <PageHeader />}

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      </main>

      <div className="h-30 mobile:h-24 tablet:h-20" />
      <Footer />
      <Sidebar />
    </div>
  )
}

export default Layout
