import Link from 'next/link'
import {
  ArrowLeft,
  Clock3,
  Languages,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
} from 'lucide-react'
import { getGuide, guideProfiles } from '@/lib/marketplace/catalog'

export default async function GuideProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const guide = getGuide((await params).id) || guideProfiles[0]
  return (
    <div className="guide-detail-page">
      <div className="guide-detail-inner">
        <Link href="/search" className="guide-back-link">
          <ArrowLeft size={14} /> Back to things to do
        </Link>
        <div className="guide-detail-card">
          <div className="guide-detail-cover">
            <img src={guide.image} alt="" />
            <div className="guide-detail-cover-copy">
              <span className="live-pill">
                <i /> Available now
              </span>
              <span className="guide-detail-zone">
                <MapPin size={14} /> {guide.zone}, Sri Lanka
              </span>
            </div>
          </div>
          <div className="guide-detail-body">
            <div className="guide-detail-identity">
              <img
                className="guide-detail-avatar"
                src={guide.image}
                alt={guide.name}
              />
              <div>
                <div className="eyebrow">Your local connection</div>
                <h1>{guide.name}</h1>
                <p>{guide.role}</p>
                <div className="guide-detail-rating">
                  <span className="guide-rating">
                    <Star size={14} fill="currentColor" /> {guide.rating}
                  </span>
                  <span>{guide.reviews} traveler reviews</span>
                  <span>·</span>
                  <span>Responds in minutes</span>
                </div>
              </div>
              <div className="guide-detail-price">
                <span>From</span>
                <strong>
                  ${guide.price}
                  <small>/hour</small>
                </strong>
              </div>
            </div>
            <div className="guide-detail-grid">
              <main>
                <section>
                  <h2>A little about {guide.name.split(' ')[0]}</h2>
                  <p>{guide.bio}</p>
                  <div className="guide-detail-facts">
                    <span>
                      <Languages size={15} /> {guide.languages.join(' · ')}
                    </span>
                    <span>
                      <Clock3 size={15} /> {guide.responseTime}
                    </span>
                    <span>
                      <ShieldCheck size={15} /> ID-checked local
                    </span>
                  </div>
                </section>
                <section>
                  <h2>What travelers love</h2>
                  <div className="guide-review-list">
                    {guide.reviewQuotes.map((review) => (
                      <blockquote key={review.author}>
                        “{review.quote}”<cite>{review.author}</cite>
                      </blockquote>
                    ))}
                  </div>
                </section>
              </main>
              <aside className="guide-detail-booking">
                <div className="eyebrow">Explore this destination together</div>
                <h2>Ask {guide.name.split(' ')[0]} what’s worth doing now.</h2>
                <p>
                  Choose a flexible local session around the things you want to
                  see, eat or understand.
                </p>
                <div className="guide-specialties">
                  {guide.specialties.map((specialty) => (
                    <span key={specialty}>{specialty}</span>
                  ))}
                </div>
                <Link
                  href={`/guide?zone=${encodeURIComponent(guide.zone)}`}
                  className="button button-primary button-wide"
                >
                  <MessageCircle size={16} /> Request {guide.name.split(' ')[0]}
                </Link>
                <small>Free to request · pay only for time together</small>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
