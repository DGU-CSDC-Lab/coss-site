'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth.store'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/admin')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return <LoadingSpinner size="lg" />
  }

  return <div className="w-full">{children}</div>
}
