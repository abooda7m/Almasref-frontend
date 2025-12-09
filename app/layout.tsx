import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'المصرف - لوحة المتسابقين',
  description: 'لوحة متابعة نقاط المتسابقين في مسابقة المصرف',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  )
}
