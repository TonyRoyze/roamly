import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Languages,
  MapPin,
  Star,
} from 'lucide-react'
import type { GuideProfile } from '@/lib/marketplace/catalog'

export function GuideProfileCard({
  guide,
  compact = false,
}: {
  guide: GuideProfile
  compact?: boolean
}) {
  return (
    <article
      className={`guide-profile-card ${compact ? 'guide-profile-card-compact' : ''}`}
    >
      <div className="guide-profile-photo-wrap">
        <img
          className="guide-profile-photo"
          src={guide.image}
          alt={guide.name}
        />
        <span className="guide-online-dot" />
      </div>
      <div className="guide-profile-main">
        <div className="guide-profile-name">
          <h3>{guide.name}</h3>
          <CheckCircle2 size={14} color="var(--mint-dark)" />
        </div>
        <p className="guide-profile-role">{guide.role}</p>
        <div className="guide-profile-stats">
          <span className="guide-rating">
            <Star size={13} fill="currentColor" /> {guide.rating}{' '}
            <em>({guide.reviews})</em>
          </span>
          <span>
            <MapPin size={12} /> {guide.zone}
          </span>
        </div>
        {!compact && (
          <>
            <p className="guide-profile-bio">{guide.bio}</p>
            <div className="guide-specialties">
              {guide.specialties.map((specialty) => (
                <span key={specialty}>{specialty}</span>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="guide-profile-side">
        <span className="guide-now">
          <i /> Available now
        </span>
        <strong>
          ${guide.price}
          <small>/hr</small>
        </strong>
        <span className="guide-response">
          <Clock3 size={12} /> {guide.responseTime}
        </span>
        <Link className="button button-secondary" href={`/guide/${guide.id}`}>
          View profile <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  )
}

export function GuideProfileStrip({
  guides,
  destination,
}: {
  guides: GuideProfile[]
  destination: string
}) {
  return (
    <section className="guide-discovery-strip">
      <div className="guide-strip-heading">
        <div>
          <div className="eyebrow">Available now near you</div>
          <h2>Make this place feel like yours.</h2>
          <p>
            Local guides are online in {destination}. Join them for as little or
            as long as you like.
          </p>
        </div>
        <span className="guide-strip-live">
          <i /> Live availability
        </span>
      </div>
      <div className="guide-profile-list">
        {guides.map((guide) => (
          <GuideProfileCard key={guide.id} guide={guide} compact />
        ))}
      </div>
      <div className="guide-strip-footer">
        <span>
          <Languages size={14} /> Match by language and interest
        </span>
        <span>
          <Clock3 size={14} /> Usually connected in minutes
        </span>
        <Link href="/guide">
          See how local sessions work <ArrowRight size={13} />
        </Link>
      </div>
    </section>
  )
}
