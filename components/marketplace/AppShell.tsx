'use client'

import Link from 'next/link'
import { SharedNavigation } from './SharedNavigation'
import { usePathname } from 'next/navigation'
import { CalendarDays, Compass, Search } from 'lucide-react'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPortalRoute = ['/supplier', '/advisor', '/partner', '/admin'].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
  return (
    <div className={`app-shell ${isPortalRoute ? 'portal-app-shell' : ''}`}>
      <SharedNavigation placement="header" />
      <main>{children}</main>
      <SharedNavigation placement="mobile" />
      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <Link href="/" className="brand footer-brand">
              <span className="brand-mark">
                <Compass size={17} strokeWidth={2.5} />
              </span>
              <span>
                travel<span>buddy</span>
              </span>
            </Link>
            <p>Make every trip a story worth telling.</p>
          </div>
          <div>
            <h4>Discover</h4>
            <Link href="/search">Things to do</Link>
            <Link href="/destinations">Top destinations</Link>
            <Link href="/inspiration">Travel inspiration</Link>
          </div>
          <div>
            <h4>Travel Buddy</h4>
            <Link href="/nearby">Meet nearby buddies</Link>
            <Link href="/support">Help center</Link>
            <Link href="/supplier">List your experience</Link>
          </div>
          <div>
            <h4>Get the app</h4>
            <p className="muted">Your next adventure is always within reach.</p>
            <div className="app-badges">
              <span> App Store</span>
              <span>▶ Google Play</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Travel Buddy</span>
          <span>English (US) · USD</span>
          <span>Privacy · Terms · Accessibility</span>
        </div>
      </footer>
    </div>
  )
}

export function SearchBar({ compact = false }: { compact?: boolean }) {
  return (
    <form className={`search-bar ${compact ? 'compact' : ''}`} action="/search">
      <div className="search-field">
        <Search size={19} />
        <div>
          <label htmlFor={compact ? 'compact-search' : 'home-search'}>
            Where to?
          </label>
          <input
            id={compact ? 'compact-search' : 'home-search'}
            name="q"
            placeholder="City, attraction or experience"
          />
        </div>
      </div>
      <div className="search-field date-field">
        <CalendarDays size={18} />
        <div>
          <label>When</label>
          <input name="date" type="date" aria-label="Choose a date" />
        </div>
      </div>
      <button type="submit" className="button button-primary search-submit">
        <Search size={18} />
        <span>Search</span>
      </button>
    </form>
  )
}
