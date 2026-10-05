import Link from 'next/link'
import {
  ArrowUpRight,
  ClipboardCheck,
  Copy,
  Plus,
  Send,
  Users,
} from 'lucide-react'
import { experiences } from '@/lib/marketplace/catalog'
import {
  DashboardTable,
  PortalLayout,
  PortalStats,
  advisorNav,
} from '@/components/marketplace/Portal'

export default function AdvisorPage() {
  return (
    <PortalLayout
      role="Advisor portal"
      title="Your clients, well looked after."
      subtitle="Here’s what’s moving across your client trips."
      nav={advisorNav}
    >
      <PortalStats
        stats={[
          {
            label: 'Bookings this month',
            value: '18',
            detail: '+4 vs last month',
          },
          {
            label: 'Pending commission',
            value: '$1,284',
            detail: 'Across 12 bookings',
            tone: 'orange',
          },
          {
            label: 'Shared with clients',
            value: '42',
            detail: '8.6% conversion',
          },
          { label: 'Active clients', value: '27', detail: '3 trips this week' },
        ]}
      />
      <div className="dashboard-columns">
        <div className="portal-card">
          <div className="card-topline">
            <div>
              <h3>Client bookings</h3>
              <span className="muted" style={{ fontSize: 11 }}>
                Recent activity
              </span>
            </div>
            <Link href="/search" className="button button-primary">
              <Plus size={15} /> Book for a client
            </Link>
          </div>
          <DashboardTable
            rows={[
              {
                id: 'TB-7A82F',
                title: 'Amalfi Coast Sunset Cruise',
                meta: 'Nora Williams · Oct 28',
                status: 'Confirmed',
                amount: '$356',
              },
              {
                id: 'TB-7A31C',
                title: 'Kyoto Gion After Dark',
                meta: 'Theo Martin · Nov 04',
                status: 'Pending',
                amount: '$165',
              },
              {
                id: 'TB-6Z92P',
                title: 'Bali Water Temples',
                meta: 'Sam & Eli · Nov 12',
                status: 'Confirmed',
                amount: '$184',
              },
            ]}
          />
        </div>
        <div className="portal-card">
          <div className="card-topline">
            <h3>Share with a client</h3>
          </div>
          <p className="muted" style={{ fontSize: 12 }}>
            Create a tracked recommendation link. If your client books, the
            commission is yours.
          </p>
          <div className="field">
            <label>Choose an experience</label>
            <select>
              <option>{experiences[0].title}</option>
              <option>{experiences[1].title}</option>
            </select>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label>Client name</label>
            <input placeholder="e.g. Jordan Lee" />
          </div>
          <button
            className="button button-primary button-wide"
            style={{ marginTop: 14 }}
          >
            <Send size={15} /> Generate tracked link
          </button>
        </div>
      </div>
      <div className="portal-card" style={{ marginTop: 20 }}>
        <div className="card-topline">
          <div>
            <h3>Your client shortlist</h3>
            <span className="muted" style={{ fontSize: 11 }}>
              The Italy anniversary trip
            </span>
          </div>
          <button className="button button-secondary">
            <Copy size={14} /> Copy client link
          </button>
        </div>
        <div className="experience-grid">
          {experiences.slice(4, 7).map((experience) => (
            <div className="horizontal" key={experience.id}>
              <img
                src={experience.image}
                style={{
                  width: 100,
                  height: 76,
                  objectFit: 'cover',
                  borderRadius: 4,
                }}
                alt=""
              />
              <div>
                <h3 style={{ fontSize: 13, margin: 0 }}>{experience.title}</h3>
                <p className="muted" style={{ fontSize: 11, margin: '5px 0' }}>
                  {experience.destination} · From ${experience.price}
                </p>
                <span className="badge-live">Added by you</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  )
}
