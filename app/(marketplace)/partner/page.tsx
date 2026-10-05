import Link from 'next/link'
import {
  ArrowUpRight,
  Code2,
  Copy,
  Link2,
  MousePointerClick,
  Plus,
  Settings2,
} from 'lucide-react'
import {
  DashboardTable,
  PortalLayout,
  PortalStats,
  partnerNav,
} from '@/components/marketplace/Portal'

export default function PartnerPage() {
  return (
    <PortalLayout
      role="Partner portal"
      title="Your audience is going places."
      subtitle="Track referrals, build widgets and grow your Travel Buddy earnings."
      nav={partnerNav}
    >
      <PortalStats
        stats={[
          {
            label: 'Clicks this month',
            value: '24,892',
            detail: '+21.4% vs last month',
          },
          {
            label: 'Bookings',
            value: '186',
            detail: '3.2% conversion',
            tone: 'orange',
          },
          {
            label: 'Commission earned',
            value: '$2,840',
            detail: '+$418 pending',
          },
          {
            label: 'Active links',
            value: '14',
            detail: 'Across 3 destinations',
          },
        ]}
      />
      <div className="dashboard-columns">
        <div className="portal-card">
          <div className="card-topline">
            <div>
              <h3>Referral performance</h3>
              <span className="muted" style={{ fontSize: 11 }}>
                Last 30 days
              </span>
            </div>
            <select className="sort-select">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="chart">
            {[35, 48, 42, 62, 51, 74, 69, 80, 73, 88, 79, 96].map(
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
            <h3>Build something</h3>
          </div>
          <div className="quick-actions">
            <Link href="#" className="quick-action">
              <Link2 size={17} />
              <span>
                <strong>Create affiliate link</strong>
                <br />
                <small className="muted">Track any experience</small>
              </span>
            </Link>
            <Link href="#" className="quick-action">
              <Code2 size={17} />
              <span>
                <strong>Widget builder</strong>
                <br />
                <small className="muted">Add discovery to your site</small>
              </span>
            </Link>
            <Link href="#" className="quick-action">
              <Settings2 size={17} />
              <span>
                <strong>API credentials</strong>
                <br />
                <small className="muted">Manage your integration</small>
              </span>
            </Link>
          </div>
        </div>
      </div>
      <div className="portal-card" style={{ marginTop: 20 }}>
        <div className="card-topline">
          <h3>Top referral links</h3>
          <button className="button button-primary">
            <Plus size={15} /> New link
          </button>
        </div>
        <DashboardTable
          rows={[
            {
              id: 'tb_italy_summer',
              title: 'Amalfi Coast collection',
              meta: 'Travel journal · 9,821 clicks',
              status: 'Active',
              amount: '$1,442',
            },
            {
              id: 'tb_sri_lanka',
              title: 'Sri Lanka food & culture',
              meta: 'Newsletter · 6,408 clicks',
              status: 'Active',
              amount: '$892',
            },
            {
              id: 'tb_bali_guide',
              title: 'Bali first-timer guide',
              meta: 'Blog · 4,112 clicks',
              status: 'Active',
              amount: '$506',
            },
          ]}
        />
      </div>
    </PortalLayout>
  )
}
