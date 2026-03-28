import type { Metadata, Viewport } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: '알-쿠 스캐너 | 쿠팡 상품 알리 최저가 비교',
  description: '쿠팡 링크 하나로 알리익스프레스 최저가를 즉시 탐색',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-slate-50 min-h-screen">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
