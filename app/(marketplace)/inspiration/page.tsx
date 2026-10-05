import Link from 'next/link'
import { experiences } from '@/lib/marketplace/catalog'

export default function InspirationPage() {
  return (
    <div className="section">
      <div className="section-inner">
        <div className="eyebrow">The Travel Buddy journal</div>
        <h1 style={{ fontSize: 52, margin: '10px 0 14px' }}>
          Go with an open mind.
        </h1>
        <p className="muted" style={{ maxWidth: 530, marginBottom: 40 }}>
          Notes from the road, thoughtful guides and the experiences that make a
          place feel like yours.
        </p>
        <div
          className="promo-band"
          style={{ background: 'var(--sand)', marginBottom: 50 }}
        >
          <div>
            <div className="eyebrow">Field notes · Sri Lanka</div>
            <h2>Three days, a thousand flavors.</h2>
            <p>A slow itinerary through Colombo, Galle and the hill country.</p>
            <Link
              href={`/experience/${experiences[0].id}`}
              className="button button-primary"
              style={{ marginTop: 18 }}
            >
              Read the story →
            </Link>
          </div>
          <img
            src={experiences[0].image}
            alt="Sri Lanka street food"
            style={{
              width: 230,
              height: 170,
              objectFit: 'cover',
              borderRadius: 6,
            }}
          />
        </div>
        <div className="section-heading">
          <div>
            <div className="eyebrow">Travel well</div>
            <h2>Ideas for your next trip</h2>
          </div>
        </div>
        <div className="experience-grid">
          {experiences.slice(1, 5).map((experience) => (
            <Link key={experience.id} href={`/experience/${experience.id}`}>
              <img
                src={experience.image}
                alt={experience.title}
                style={{
                  width: '100%',
                  height: 220,
                  objectFit: 'cover',
                  borderRadius: 7,
                }}
              />
              <div className="eyebrow" style={{ marginTop: 12 }}>
                {experience.destination} · Guide
              </div>
              <h3 style={{ marginTop: 6 }}>{experience.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
