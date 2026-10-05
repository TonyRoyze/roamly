'use client'

import Link from 'next/link'
import { Heart, Star } from 'lucide-react'
import { useState } from 'react'
import type { Experience } from '@/lib/marketplace/catalog'
import { addExperienceToJourneyPlan } from '@/lib/marketplace/journey'

export function ExperienceCard({
  experience,
  horizontal = false,
}: {
  experience: Experience
  horizontal?: boolean
}) {
  const [saved, setSaved] = useState(false)
  return (
    <article className={`experience-card ${horizontal ? 'horizontal' : ''}`}>
      <div className="card-image-wrap">
        <Link href={`/experience/${experience.id}`}>
          <img
            src={experience.image}
            alt={experience.title}
            className="card-image"
          />
        </Link>
        {experience.tag && <span className="image-tag">{experience.tag}</span>}
        <button
          className={`save-button ${saved ? 'saved' : ''}`}
          onClick={() => {
            setSaved(!saved)
            addExperienceToJourneyPlan(experience.id)
          }}
          aria-label="Save experience to trip plan"
        >
          <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="card-content">
        <div className="eyebrow">
          {experience.category} · {experience.destination}
        </div>
        <Link href={`/experience/${experience.id}`}>
          <h3>{experience.title}</h3>
        </Link>
        <div className="rating-row">
          <span className="rating-stars">
            <Star size={14} fill="currentColor" /> {experience.rating}
          </span>
          <span className="review-count">
            ({experience.reviews.toLocaleString()})
          </span>
          <span className="dot-divider">·</span>
          <span>{experience.duration}</span>
        </div>
        <p className="card-price">
          <span>From</span> <strong>${experience.price}</strong>{' '}
          <span>per adult</span>
        </p>
        {experience.freeCancellation && (
          <div className="free-cancel">✓ Free cancellation</div>
        )}
      </div>
    </article>
  )
}

export function StatCard({
  label,
  value,
  detail,
  tone = 'green',
}: {
  label: string
  value: string
  detail: string
  tone?: string
}) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong>{value}</strong>
      <span className="stat-detail">{detail}</span>
    </div>
  )
}
