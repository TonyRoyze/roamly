'use client'

import Link from 'next/link'
import { useDemoProfile } from '@/lib/use-demo-profile'
import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  Globe2,
  Headphones,
  LayoutDashboard,
  MessageSquare,
  Package,
  Plus,
  Settings,
  ShieldCheck,
  Star,
  Users,
  WalletCards,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { StatCard } from './ExperienceCard'

export function PortalLayout({
  role,
  title,
  subtitle,
  children,
  nav,
}: {
  role: string
  title: string
  subtitle: string
  children: ReactNode
  nav: { label: string; icon: ReactNode; href?: string }[]
}) {
  const profile = useDemoProfile()
  return (
    <div className="portal-wrap">
      <aside className="portal-sidebar">
        <Link href="/" className="brand portal-brand">
          <span className="brand-mark">✦</span>
          <span>
            travel<span>buddy</span>
          </span>
        </Link>
        <div className="portal-label">{role}</div>
        <nav className="portal-nav">
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href || '#'}
              className={item.href === '#' ? 'selected' : ''}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.label === 'Messages' && <b className="nav-count">3</b>}
            </Link>
          ))}
        </nav>
        <div className="sidebar-help">
          <CircleHelp size={20} />
          <div>
            <strong>Need a hand?</strong>
            <span>Visit the help center</span>
          </div>
        </div>
        <Link className="portal-back" href="/">
          ← Back to marketplace
        </Link>
      </aside>
      <section className="portal-content">
        <div className="portal-mobile-head">
          <Link href="/" className="brand">
            <span className="brand-mark">✦</span>
            <span>
              travel<span>buddy</span>
            </span>
          </Link>
          <span>{role}</span>
        </div>
        <nav className="portal-mobile-nav" aria-label={`${role} navigation`}>
          {nav.map((item) => (
            <Link
              key={item.label}
              href={item.href || '#'}
              className={item.href === '#' ? 'selected' : ''}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="portal-heading">
          <div>
            <div className="breadcrumb">Travel Buddy / {role}{profile ? ` / ${profile.name}` : ''}</div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="portal-heading-actions">
            <Link href="/nearby?tab=profile" className="button button-secondary">Edit profile</Link>
            <Link href="/login" className="button button-secondary">Switch user</Link>
            <button className="button button-secondary">
              <Headphones size={16} /> Help
            </button>
          </div>
        </div>
        {children}
      </section>
    </div>
  )
}

export const supplierNav = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={17} />,
    href: '/supplier',
  },
  {
    label: 'Products',
    icon: <Package size={17} />,
    href: '/supplier/products',
  },
  {
    label: 'Bookings',
    icon: <ClipboardList size={17} />,
    href: '/supplier/bookings',
  },
  { label: 'Availability', icon: <CalendarDays size={17} />, href: '#' },
  { label: 'Reviews', icon: <Star size={17} />, href: '#' },
  { label: 'Messages', icon: <MessageSquare size={17} />, href: '#' },
  { label: 'Performance', icon: <BarChart3 size={17} />, href: '#' },
  { label: 'Payments & payouts', icon: <WalletCards size={17} />, href: '#' },
]
export const advisorNav = [
  { label: 'Overview', icon: <LayoutDashboard size={17} />, href: '/advisor' },
  { label: 'Find experiences', icon: <Globe2 size={17} />, href: '/search' },
  { label: 'Client bookings', icon: <ClipboardList size={17} />, href: '#' },
  { label: 'My lists', icon: <FileText size={17} />, href: '#' },
  { label: 'Commissions', icon: <WalletCards size={17} />, href: '#' },
  { label: 'Clients', icon: <Users size={17} />, href: '#' },
  { label: 'Messages', icon: <MessageSquare size={17} />, href: '#' },
]
export const partnerNav = [
  { label: 'Overview', icon: <LayoutDashboard size={17} />, href: '/partner' },
  { label: 'Affiliate links', icon: <Globe2 size={17} />, href: '#' },
  { label: 'Widget builder', icon: <Package size={17} />, href: '#' },
  { label: 'Referrals', icon: <Users size={17} />, href: '#' },
  { label: 'Commissions', icon: <WalletCards size={17} />, href: '#' },
  { label: 'API access', icon: <ShieldCheck size={17} />, href: '#' },
  { label: 'Settings', icon: <Settings size={17} />, href: '#' },
]
export const adminNav = [
  { label: 'Dashboard', icon: <LayoutDashboard size={17} />, href: '/admin' },
  { label: 'Bookings', icon: <ClipboardList size={17} />, href: '#' },
  { label: 'Products', icon: <Package size={17} />, href: '#' },
  { label: 'Suppliers', icon: <Users size={17} />, href: '#' },
  { label: 'Travelers', icon: <Users size={17} />, href: '#' },
  { label: 'Reviews', icon: <Star size={17} />, href: '#' },
  { label: 'Payments', icon: <CreditCard size={17} />, href: '#' },
  { label: 'Audit logs', icon: <Clock3 size={17} />, href: '#' },
]

export function DashboardTable({
  rows,
}: {
  rows: {
    id: string
    title: string
    meta: string
    status: string
    amount: string
  }[]
}) {
  return (
    <div className="data-table">
      <div className="table-head">
        <span>Reference / experience</span>
        <span>Status</span>
        <span>Value</span>
        <span></span>
      </div>
      {rows.map((row) => (
        <div className="table-row" key={row.id}>
          <div>
            <strong>{row.id}</strong>
            <span>{row.title}</span>
            <small>{row.meta}</small>
          </div>
          <span
            className={`status status-${row.status.toLowerCase().replaceAll(' ', '-')}`}
          >
            {row.status}
          </span>
          <strong>{row.amount}</strong>
          <ChevronRight size={17} className="row-arrow" />
        </div>
      ))}
    </div>
  )
}

export function PortalStats({
  stats,
}: {
  stats: { label: string; value: string; detail: string; tone?: string }[]
}) {
  return (
    <div className="stats-grid">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
