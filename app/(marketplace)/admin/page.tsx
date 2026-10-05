import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Flag,
  ShieldAlert,
  UserCheck,
} from 'lucide-react'
import {
  DashboardTable,
  PortalLayout,
  PortalStats,
  adminNav,
} from '@/components/marketplace/Portal'

export default function AdminPage() {
  return (
    <PortalLayout
      role="Admin console"
      title="Platform overview"
      subtitle="A clear view of Travel Buddy operations and marketplace health."
      nav={adminNav}
    >
      <PortalStats
        stats={[
          {
            label: 'Gross bookings',
            value: '$284,902',
            detail: '+16.2% this month',
          },
          {
            label: 'Active experiences',
            value: '1,284',
            detail: '+42 awaiting review',
            tone: 'orange',
          },
          { label: 'Travelers', value: '42,806', detail: '+8.4% this month' },
          {
            label: 'Supplier health',
            value: '98.2%',
            detail: 'Across 486 suppliers',
          },
        ]}
      />
      <div className="dashboard-columns">
        <div className="portal-card">
          <div className="card-topline">
            <div>
              <h3>Marketplace activity</h3>
              <span className="muted" style={{ fontSize: 11 }}>
                Live operations queue
              </span>
            </div>
            <Link href="#" className="section-link">
              Open reports <ArrowUpRight size={14} />
            </Link>
          </div>
          <DashboardTable
            rows={[
              {
                id: 'TB-7K4M2',
                title: 'Colombo Street Food Night',
                meta: 'New booking · 2 minutes ago',
                status: 'Confirmed',
                amount: '$84',
              },
              {
                id: 'PR-20481',
                title: 'Dhow sunset cruise in Dubai',
                meta: 'Product submitted by Desert Pearl',
                status: 'Pending',
                amount: 'Review',
              },
              {
                id: 'RV-88310',
                title: 'Review flagged for moderation',
                meta: 'Bali Good Times · 1 hour ago',
                status: 'Review',
                amount: 'Action',
              },
              {
                id: 'TB-7J91P',
                title: 'Sigiriya Rock at Sunrise',
                meta: 'Refund requested · 2 hours ago',
                status: 'Pending',
                amount: '$272',
              },
            ]}
          />
        </div>
        <div className="portal-card">
          <div className="card-topline">
            <h3>Needs attention</h3>
            <span className="status status-pending">7 open</span>
          </div>
          <div className="quick-actions">
            <Link className="quick-action" href="#">
              <ShieldAlert size={17} color="var(--orange)" />
              <span>
                <strong>42 products awaiting review</strong>
                <br />
                <small className="muted">Content moderation queue</small>
              </span>
            </Link>
            <Link className="quick-action" href="#">
              <UserCheck size={17} color="var(--mint-dark)" />
              <span>
                <strong>8 supplier applications</strong>
                <br />
                <small className="muted">Verify new operators</small>
              </span>
            </Link>
            <Link className="quick-action" href="#">
              <Flag size={17} color="var(--orange)" />
              <span>
                <strong>3 flagged reviews</strong>
                <br />
                <small className="muted">Resolve moderation reports</small>
              </span>
            </Link>
            <Link className="quick-action" href="#">
              <Clock3 size={17} />
              <span>
                <strong>5 support cases</strong>
                <br />
                <small className="muted">Waiting for an agent</small>
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="dashboard-columns" style={{ marginTop: 20 }}>
        <div className="portal-card">
          <div className="card-topline">
            <h3>Marketplace health</h3>
          </div>
          <div className="quick-actions">
            <div className="quick-action">
              <CheckCircle2 size={17} color="var(--mint-dark)" />
              <span>
                <strong>Payment simulator operational</strong>
                <br />
                <small className="muted">
                  No failed jobs in the last 24 hours
                </small>
              </span>
            </div>
            <div className="quick-action">
              <CheckCircle2 size={17} color="var(--mint-dark)" />
              <span>
                <strong>Availability sync healthy</strong>
                <br />
                <small className="muted">
                  Last checked less than 1 min ago
                </small>
              </span>
            </div>
          </div>
        </div>
        <div className="portal-card">
          <div className="card-topline">
            <h3>Audit trail</h3>
          </div>
          <p className="muted" style={{ fontSize: 12 }}>
            Every admin action is recorded with actor, timestamp and reason.
          </p>
          <Link href="#" className="button button-secondary">
            View audit logs
          </Link>
        </div>
      </div>
    </PortalLayout>
  )
}
