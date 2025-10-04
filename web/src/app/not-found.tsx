'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

// 동적 라우트 컴포넌트들 import (이름 변경된 폴더에서)
import EditFacultyPage from '@/app/admin/faculty/_DYNAMIC_id_/edit/page'
import EditPostPage from '@/app/admin/posts/_DYNAMIC_id_/edit/page'
import EditSchedulePage from '@/app/admin/schedules/_DYNAMIC_id_/edit/page'
import EditCoursePage from '@/app/admin/courses/_DYNAMIC_id_/edit/page'
import EditHeaderAssetPage from '@/app/admin/header-assets/_DYNAMIC_id_/edit/page'

export default function NotFound() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // 관리자 동적 라우트 처리
  if (pathname.includes('/admin/faculty/') && pathname.includes('/edit')) {
    return <EditFacultyPage />
  }

  if (pathname.includes('/admin/posts/') && pathname.includes('/edit')) {
    return <EditPostPage />
  }

  if (pathname.includes('/admin/schedules/') && pathname.includes('/edit')) {
    return <EditSchedulePage />
  }

  if (pathname.includes('/admin/courses/') && pathname.includes('/edit')) {
    return <EditCoursePage />
  }

  if (
    pathname.includes('/admin/header-assets/') &&
    pathname.includes('/edit')
  ) {
    return <EditHeaderAssetPage />
  }

  // 실제 404 페이지
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">페이지를 찾을 수 없습니다.</p>
        <a
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          홈으로 돌아가기
        </a>
      </div>
    </div>
  )
}
