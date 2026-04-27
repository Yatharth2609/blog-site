import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Yatharth Mishra',
    template: '%s | Yatharth Mishra',
  },
  description: 'AI Engineer writing about LangGraph, production agents, and GCP.',
  metadataBase: new URL('https://blog.yatharthmishra.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://blog.yatharthmishra.dev',
    siteName: 'Yatharth Mishra',
    title: 'Yatharth Mishra',
    description: 'AI Engineer writing about LangGraph, production agents, and GCP.',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@yatharthmishra',
    title: 'Yatharth Mishra',
    description: 'AI Engineer writing about LangGraph, production agents, and GCP.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={geistMono.variable} data-scroll-behavior="smooth">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
