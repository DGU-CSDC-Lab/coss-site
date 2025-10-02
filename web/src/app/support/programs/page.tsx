'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MajorPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/support/programs/co-week')
  }, [router])

  return (
    <div>
      <div>리다이렉트 중...</div>
    </div>
  )
}
