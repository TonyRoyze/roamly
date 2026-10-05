'use client'

import Link from 'next/link'
import { demoRole } from '@/lib/demo-roles'
import { useDemoProfile } from '@/lib/use-demo-profile'
import { usePathname } from 'next/navigation'
import {
  CalendarDays,
  Compass,
  MapPinned,
  Search,
  ShoppingBag,
  UserRound,
  Map,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export function SharedNavigation({ placement }: { placement: 'header' | 'mobile' }) {
  const pathname = usePathname()
  const profile = useDemoProfile()
  const [cartCount, setCartCount] = useState(0)
  useEffect(() => {
    const update = () =>
      setCartCount(Number(window.localStorage.getItem('tb-cart-count') || 0))
    update()
    window.addEventListener('tb-cart-updated', update)
    return () => window.removeEventListener('tb-cart-updated', update)
  }, [])
  const mobileNav = [
    { label: 'Explore', href: '/', icon: <Compass size={20} /> },
    { label: 'Discover', href: '/search', icon: <Search size={20} /> },
    { label: 'Guides', href: '/guide', icon: <MapPinned size={20} /> },
    { label: 'Nearby', href: '/nearby', icon: <Map size={20} /> },
    { label: 'Trips', href: '/wishlist', icon: <CalendarDays size={20} /> },
    { label: 'Account', href: profile ? (profile.role === 'local_guide' ? '/nearby?tab=profile' : demoRole(profile.role).home) : '/login', icon: <UserRound size={20} /> },
  ]
  return placement === 'header' ? (
      <header className="site-header">
        <Link href="/" className="brand" aria-label="Travel Buddy home">
          <span className="brand-mark">
            <Compass size={17} strokeWidth={2.5} />
          </span>
          <span>
            travel<span>buddy</span>
          </span>
        </Link>
        <nav className="desktop-nav" aria-label="Main website navigation">
          <Link className={pathname === '/' ? 'active' : ''} href="/">
            Explore
          </Link>
          <Link
            className={pathname === '/search' ? 'active' : ''}
            href="/search"
          >
            Discover
          </Link>
          <Link
            className={pathname === '/wishlist' ? 'active' : ''}
            href="/wishlist"
          >
            Trips
          </Link>
          <Link className={pathname === '/guide' ? 'active' : ''} href="/guide">
            Guides
          </Link>
          <Link href="/nearby" className={pathname === '/nearby' ? 'active' : ''} aria-current={pathname === '/nearby' ? 'page' : undefined}>Nearby</Link>
        </nav>
        <div className="header-actions">
          <Link href="/cart" className="cart-button">
            <ShoppingBag size={18} />
            <span>Cart</span>
            {cartCount > 0 && <b>{cartCount}</b>}
          </Link>
          <Link href={profile ? (profile.role === 'local_guide' ? '/nearby?tab=profile' : demoRole(profile.role).home) : "/login"} className="account-button">
            <UserRound size={17} />
            <span>{profile ? profile.name.split(' ')[0] : 'Log in'}</span>
          </Link>
          {profile && <Link href="/login" className="account-button">Switch user</Link>}
        </div>
      </header>
  ) : (
      <nav className="mobile-bottom-nav" aria-label="Primary navigation">
        {mobileNav.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              className={active ? 'active' : ''}
              aria-current={active ? 'page' : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
  )
}
