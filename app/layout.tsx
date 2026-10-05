import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'
import './marketplace.css'

export const metadata: Metadata = {
  title: 'Travel Buddy · Find your next story',
  description:
    'Discover experiences, plan your trip, and connect with local buddies on the map.',
  icons: { icon: '/icon.svg' },
}
export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
