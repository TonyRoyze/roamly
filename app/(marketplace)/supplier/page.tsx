import Link from 'next/link'
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  PackagePlus,
  Sparkles,
} from 'lucide-react'
import {
  DashboardTable,
  PortalLayout,
  PortalStats,
  supplierNav,
} from '@/components/marketplace/Portal'

export default function SupplierPage() {
  return (
    <PortalLayout
      role="Supplier center"
      title="Your supplier overview"
      subtitle="Here’s how your demo business is performing today."
      nav={supplierNav}
    >
      <PortalStats
        stats={[
          {
            label: 'Bookings this month',
            value: '248',
            detail: '+18.4% vs last month',
            tone: 'green',
          },
          {
            label: 'Gross sales',
            value: '$18,420',
            detail: '+12.8% vs last month',
            tone: 'orange',
          },
          {
            label: 'Product views',
            value: '12,840',
            detail: '+6.2% vs last month',
          },
          {
            label: 'Average rating',
            value: '4.9',
            detail: '382 verified reviews',
          },
        ]}
      />
      <div className="dashboard-columns">
        <div className="portal-card">
          <div className="card-topline">
            <div>
              <h3>Upcoming bookings</h3>
              <span className="muted" style={{ fontSize: 11 }}>
                Next 7 days
              </span>
            </div>
            <Link href="/supplier/bookings" className="section-link">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <DashboardTable
            rows={[
              {
                id: 'TB-7K4M2',
                title: 'Colombo Street Food Night',
                meta: 'Today · 2 travelers',
                status: 'Confirmed',
                amount: '$84',
              },
              {
                id: 'TB-7J91P',
                title: 'Sigiriya Rock at Sunrise',
                meta: 'Tomorrow · 4 travelers',
                status: 'Confirmed',
                amount: '$272',
              },
              {
                id: 'TB-7H31A',
                title: 'Colombo Street Food Night',
                meta: 'Oct 20 · 3 travelers',
                status: 'Pending',
                amount: '$126',
              },
              {
                id: 'TB-7G88L',
                title: 'Galle Fort History Walk',
                meta: 'Oct 21 · 2 travelers',
                status: 'Confirmed',
                amount: '$68',
              },
            ]}
          />
        </div>
        <div className="portal-card">
          <div className="card-topline">
            <h3>Quick actions</h3>
          </div>
          <div className="quick-actions">
            <Link href="/supplier/products/new" className="quick-action">
              <PackagePlus size={17} /> Add a new experience
            </Link>
            <Link href="/supplier/products" className="quick-action">
              <CalendarDays size={17} /> Update availability
            </Link>
            <Link href="#" className="quick-action">
              <Sparkles size={17} /> Improve with AI builder
            </Link>
            <Link href="#" className="quick-action">
              <CheckCircle2 size={17} /> Respond to reviews
            </Link>
          </div>
        </div>
      </div>
      <div className="dashboard-columns" style={{ marginTop: 20 }}>
        <div className="portal-card">
          <div className="card-topline">
            <div>
              <h3>Sales overview</h3>
              <span className="muted" style={{ fontSize: 11 }}>
                Last 30 days · Gross sales
              </span>
            </div>
            <select className="sort-select">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="chart">
            {[45, 56, 42, 65, 58, 78, 71, 90, 82, 68, 95, 87].map(
              (height, index) => (
                <div
                  className="chart-bar"
                  style={{ height: `${height}%` }}
                  key={index}
                >
                  <span>{['1', '3', '5', '7', '9', '11'][index / 2]}</span>
                </div>
              ),
            )}
          </div>
        </div>
        <div className="portal-card">
          <div className="card-topline">
            <h3>Attention needed</h3>
          </div>
          <div className="quick-actions">
            <div className="quick-action">
              <CircleAlert size={17} color="var(--orange)" />
              <span>
                <strong>3 availability warnings</strong>
                <br />
                <small className="muted">Review low inventory slots</small>
              </span>
            </div>
            <div className="quick-action">
              <CheckCircle2 size={17} color="var(--mint-dark)" />
              <span>
                <strong>All documents verified</strong>
                <br />
                <small className="muted">
                  Your account is in good standing
                </small>
              </span>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
