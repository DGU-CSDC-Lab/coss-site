'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Tabs from '@/components/tabs/Tabs'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export default function MajorPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/curriculum/major/microdegree')
  }, [router])

  return (
    <div>
      <Tabs />
      <LoadingSpinner size="lg" />
    </div>
  )
}
