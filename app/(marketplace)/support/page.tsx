import Link from 'next/link'
import {
  ChevronRight,
  MessageCircleQuestion,
  Search,
  ShieldCheck,
} from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="account-page">
      <div className="account-inner">
        <div
          style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}
        >
          <div className="eyebrow">Help center</div>
          <h1 style={{ fontSize: 49, margin: '9px 0 13px' }}>
            How can we help?
          </h1>
          <p className="muted">
            Find answers, manage a booking or speak with a member of our team.
          </p>
          <form
            className="search-bar compact"
            style={{ margin: '25px auto 0', textAlign: 'left' }}
          >
            <div className="search-field">
              <Search size={18} />
              <div>
                <label>Search help</label>
                <input placeholder="Try “cancel my booking”" />
              </div>
            </div>
            <button className="button button-primary">Search</button>
          </form>
        </div>
        <div
          className="destination-grid"
          style={{
            gridTemplateColumns: 'repeat(3,1fr)',
            maxWidth: 850,
            margin: '0 auto 50px',
          }}
        >
          <Link href="#" className="portal-card">
            <MessageCircleQuestion size={23} color="var(--orange)" />
            <h3 style={{ margin: '13px 0 5px' }}>Manage a booking</h3>
            <p className="muted" style={{ fontSize: 12 }}>
              Change dates, find your voucher or request a refund.
            </p>
            <ChevronRight size={16} />
          </Link>
          <Link href="#" className="portal-card">
            <ShieldCheck size={23} color="var(--mint-dark)" />
            <h3 style={{ margin: '13px 0 5px' }}>Booking with confidence</h3>
            <p className="muted" style={{ fontSize: 12 }}>
              Learn about cancellation, payments and safety.
            </p>
            <ChevronRight size={16} />
          </Link>
          <Link href="#" className="portal-card">
            <MessageCircleQuestion size={23} color="var(--orange)" />
            <h3 style={{ margin: '13px 0 5px' }}>Contact support</h3>
            <p className="muted" style={{ fontSize: 12 }}>
              Our team is here 24/7 for urgent travel help.
            </p>
            <ChevronRight size={16} />
          </Link>
        </div>
        <div className="portal-card" style={{ maxWidth: 850, margin: 'auto' }}>
          <div className="card-topline">
            <h3>Popular questions</h3>
          </div>
          {[
            'How do I find my mobile voucher?',
            'Can I change the date of my experience?',
            'When will I receive my refund?',
            'How does Reserve now, pay later work?',
          ].map((question) => (
            <div
              key={question}
              style={{
                padding: '15px 0',
                borderTop: '1px solid var(--line)',
                fontSize: 13,
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              {question}
              <ChevronRight size={16} color="var(--muted)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
