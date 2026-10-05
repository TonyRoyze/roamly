import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { ExperienceCard } from '@/components/marketplace/ExperienceCard'
import { experiences } from '@/lib/marketplace/catalog'
import { JourneyPlanner } from '@/components/marketplace/JourneyPlanner'

export default function WishlistPage() {
  return (
    <div className="account-page trips-page">
      <div className="account-inner">
        <div className="account-head">
          <div>
            <div className="eyebrow">Your travel workspace</div>
            <h1>Trips</h1>
            <p className="muted">Plan, share and book from one place.</p>
          </div>
          <Link className="button button-secondary" href="/scan">
            <CalendarDays size={15} /> Import shared trip
          </Link>
        </div>
        <JourneyPlanner />
        <div className="portal-card wishlist-library-card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              marginBottom: 23,
            }}
          >
            <CalendarDays size={18} color="var(--orange)" />
            <strong>Saved for later</strong>
            <span className="muted" style={{ fontSize: 12 }}>
              {' '}
              · Picked ideas waiting for a plan
            </span>
          </div>
          <div className="experience-grid">
            {experiences.slice(0, 6).map((experience) => (
              <ExperienceCard key={experience.id} experience={experience} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
