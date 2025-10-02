import type { Metadata } from 'next'
import QueryProvider from '@/providers/query.provider'
import Layout from '@/components/layout/Layout'
import './globals.css'

export const metadata: Metadata = {
  title: '지능IoT학과',
  description: '지능IoT학과 홈페이지',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <Layout>{children}</Layout>
        </QueryProvider>
      </body>
    </html>
  )
}
