import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { AffiliateDisclosure, SiteFooter, SiteHeader } from '@/components/affiliate-site'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'SOLEMART Ã¢â‚¬â€ Find the Best Shoes Before You Buy',
    template: '%s | SOLEMART',
  },
  description: 'Independent shoe buying guides, reviews, comparisons, and advice to help you choose the right pair.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: 'white',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SiteHeader />
        {children}
        <AffiliateDisclosure />
        <SiteFooter />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
