import Link from 'next/link'
import { AccountGreeting } from '@/components/marketplace/AccountGreeting'
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  Settings,
} from 'lucide-react'
import { experiences } from '@/lib/marketplace/catalog'

export default function AccountPage() {
  return (
    <div className="account-page">
      <div className="account-inner">
        <div className="account-head">
          <div>
            <div className="eyebrow">Traveler account</div>
            <AccountGreeting />
            <p className="muted">
              Everything important about your travel, in one view.
            </p>
          </div>
          <Link className="button button-secondary" href="/nearby?tab=profile">
            <Settings size={15} /> Edit your buddy profile
          </Link>
        </div>

        <section className="account-main account-simplified">
          <div className="account-overview-row">
            <div className="welcome-card">
              <div>
                <div className="eyebrow" style={{ color: '#9bd4bd' }}>
                  Travel Buddy Rewards
                </div>
                <h2>You have good taste.</h2>
                <p>Earn $12 more in credit after your next eligible booking.</p>
              </div>
              <div className="reward-balance">
                <span>Your balance</span>
                <strong>$12.40</strong>
              </div>
            </div>
            <div className="account-quick-links">
              <Link href="/wishlist">
                <CalendarDays size={17} />
                <span>
                  <strong>Trips</strong>
                  <small>Open your plans and saved ideas</small>
                </span>
                <ChevronRight size={16} />
              </Link>
              <Link href="/support">
                <CircleHelp size={17} />
                <span>
                  <strong>Help center</strong>
                  <small>Questions about a booking?</small>
                </span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div className="portal-card" id="upcoming">
            <div className="card-topline">
              <div>
                <div className="eyebrow">Next up</div>
                <h3>Upcoming trip</h3>
              </div>
              <Link href="/wishlist" className="section-link">
                Open Trips <ArrowRight size={13} />
              </Link>
            </div>
            <div className="booking-list">
              <div className="booking-item">
                <img
                  className="booking-thumb"
                  src={experiences[0].image}
                  alt=""
                />
                <div className="booking-item-main">
                  <h3>{experiences[0].title}</h3>
                  <p>
                    <CalendarDays size={12} style={{ verticalAlign: '-2px' }} />{' '}
                    Oct 18, 2026 · 5:30 PM · 2 travelers
                  </p>
                </div>
                <span className="status status-confirmed">Confirmed</span>
                <ChevronRight size={16} className="row-arrow" />
              </div>
            </div>
          </div>

          <div className="account-history-grid">
            <div className="portal-card" id="past">
              <div className="card-topline">
                <div>
                  <div className="eyebrow">Your journey</div>
                  <h3>Travel history</h3>
                </div>
                <span className="muted" style={{ fontSize: 11 }}>
                  3 completed trips
                </span>
              </div>
              <div className="history-stat">
                <strong>3</strong>
                <span>stories completed</span>
                <div className="history-line">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
              <p className="muted">
                You have one review waiting to be shared from your last
                experience.
              </p>
              <Link className="button button-ghost" href="/support">
                <CircleHelp size={14} /> Get help with a booking
              </Link>
            </div>
            <div className="portal-card" id="preferences">
              <div className="card-topline">
                <div>
                  <div className="eyebrow">Your preferences</div>
                  <h3>Travel profile</h3>
                </div>
                <Settings size={17} color="var(--muted)" />
              </div>
              <div className="profile-preferences">
                <span>
                  Traveler type<strong>Curious explorer</strong>
                </span>
                <span>
                  Home currency<strong>USD</strong>
                </span>
                <span>
                  Email updates<strong>On</strong>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
