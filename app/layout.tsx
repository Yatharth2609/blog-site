import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Analytics } from '@vercel/analytics/next'
import { JsonLd } from '@/components/JsonLd'

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
  // TASK 1: Corrected domain — was blog.yatharthmishra.dev (missing 's')
  metadataBase: new URL('https://blogs.yatharthmishra.dev'),
  // TASK 1: Explicit canonical for the homepage
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    // Relative URL — Next.js resolves against metadataBase
    url: '/',
    siteName: 'Yatharth Mishra',
    title: 'Yatharth Mishra',
    description: 'AI Engineer writing about LangGraph, production agents, and GCP.',
  },
  twitter: {
    card: 'summary_large_image',
    // TASK 4: Corrected handle
    creator: '@yatharth_m2609',
    site: '@yatharth_m2609',
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
        {/* TASK 3b: WebSite schema — site-wide structured data */}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Yatharth Mishra — Blog',
            url: 'https://blogs.yatharthmishra.dev',
            description:
              'AI Engineer writing about LangGraph, production agents, and GCP.',
            author: {
              '@type': 'Person',
              name: 'Yatharth Mishra',
              url: 'https://yatharthmishra.dev',
              sameAs: [
                'https://github.com/Yatharth2609',
                'https://linkedin.com/in/yatharth-mishra2609',
                'https://twitter.com/yatharth_m2609',
              ],
            },
            potentialAction: {
              '@type': 'SearchAction',
              target:
                'https://blogs.yatharthmishra.dev/search?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  )
}
