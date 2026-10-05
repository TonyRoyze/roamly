import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { destinations, experiences } from '@/lib/marketplace/catalog'

export default function DestinationsPage() {
  return (
    <div className="section">
      <div className="section-inner">
        <div className="eyebrow">The destination guide</div>
        <h1 style={{ fontSize: 48, margin: '12px 0 14px' }}>
          Go somewhere
          <br />
          that stays with you.
        </h1>
        <p className="muted" style={{ maxWidth: 520 }}>
          From local flavors to once-in-a-lifetime landscapes, start with a
          place and see where it takes you.
        </p>
        <div className="destination-grid" style={{ marginTop: 38 }}>
          {destinations.map((destination) => (
            <Link
              href={`/search?q=${destination.name}`}
              className="destination-card"
              key={destination.name}
            >
              <img src={destination.image} alt={destination.name} />
              <div className="destination-info">
                <h3>{destination.name}</h3>
                <span>
                  {destination.count} experiences · {destination.country}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="section-heading" style={{ marginTop: 80 }}>
          <div>
            <div className="eyebrow">Start planning</div>
            <h2>Stories from around the world</h2>
          </div>
          <Link href="/search" className="section-link">
            See everything <ArrowRight size={14} />
          </Link>
        </div>
        <div className="experience-grid">
          {experiences.slice(2, 6).map((experience) => (
            <div key={experience.id}>
              <a href={`/experience/${experience.id}`}>
                <img
                  style={{
                    width: '100%',
                    height: 220,
                    objectFit: 'cover',
                    borderRadius: 7,
                  }}
                  src={experience.image}
                  alt={experience.title}
                />
              </a>
              <div className="eyebrow" style={{ marginTop: 14 }}>
                {experience.destination}
              </div>
              <h3 style={{ marginTop: 6 }}>{experience.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
