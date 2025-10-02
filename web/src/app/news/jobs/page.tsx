'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Tabs from '@/components/tabs/Tabs'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function JobsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/news/contest')
  }, [router])

  return (
    <div>
      <Tabs />
      <LoadingSpinner size="lg" />
    </div>
  )
}
