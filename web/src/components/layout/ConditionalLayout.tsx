'use client'

import { usePathname } from 'next/navigation'
import Layout from './Layout'

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isAdminCreatePage = pathname.startsWith('/admin/') && 
    (pathname.endsWith('/create') || pathname.includes('/bulk-upload'))

  if (isAdminCreatePage) {
    return <>{children}</>
  }

  return <Layout>{children}</Layout>
}
