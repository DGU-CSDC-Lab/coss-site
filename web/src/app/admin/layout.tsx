'use client'

import { useAuthStore } from '@/store/auth.store'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role, isLoggedIn, accessToken } = useAuthStore()

  // role이 ADMIN이 아니거나 로그인하지 않았거나 토큰이 없으면 404 표시
  if (role !== 'ADMIN' || !isLoggedIn || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">
            페이지를 찾을 수 없습니다.
          </p>
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

  return <div className="w-full">{children}</div>
}
