import type { Metadata } from 'next'
import QueryProvider from '@/providers/query.provider'
import ConditionalLayout from '@/components/layout/ConditionalLayout'
import Alert from '@/components/common/Alert'
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
          <ConditionalLayout>{children}</ConditionalLayout>
          <Alert />
        </QueryProvider>
      </body>
    </html>
  )
}
