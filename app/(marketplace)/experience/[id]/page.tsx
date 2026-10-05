'use client'

import Link from 'next/link'
import {
  CalendarDays,
  CarFront,
  Check,
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react'
import { use, useEffect, useState } from 'react'
import {
  getExperience,
  experiences,
  guideProfiles,
  yalaJourneyRecommendations,
  yalaJourneyTransferLegs,
} from '@/lib/marketplace/catalog'
import { ExperienceCard } from '@/components/marketplace/ExperienceCard'
import { GuideProfileCard } from '@/components/marketplace/GuideProfileCard'
import {
  ConnectedJourneyBuilder,
  type ConnectedJourney,
} from '@/components/marketplace/ConnectedJourneyBuilder'

type BookingStep = 'details' | 'transfer-choice' | 'journey'
const LAST_TRAVELERS_KEY = 'tb-last-travelers'

export default function ExperiencePage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  const params = use(paramsPromise)
  const experience = getExperience(params.id) || experiences[0]
  const [option, setOption] = useState(0)
  const [date, setDate] = useState('2026-10-18')
  const [time, setTime] = useState(experience.options[0].times[0])
  const [travelers, setTravelers] = useState(2)
  const [saved, setSaved] = useState(false)
  const [usingNow, setUsingNow] = useState(false)
  const [bookingStep, setBookingStep] = useState<BookingStep>('details')
  const selected = experience.options[option]
  const localGuides = guideProfiles
    .filter((guide) => guide.destination === experience.destination)
    .slice(0, 2)
  const isYala = experience.id === 'yala-safari'

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(LAST_TRAVELERS_KEY))
    if (stored >= 1 && stored <= 6) setTravelers(stored)
  }, [])

  function rememberTravelers(value: number) {
    setTravelers(value)
    window.localStorage.setItem(LAST_TRAVELERS_KEY, String(value))
  }

  function todayValue() {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${now.getFullYear()}-${month}-${day}`
  }

  function nearestAvailableTime(times: string[]) {
    const now = new Date()
    const nowMinutes = now.getHours() * 60 + now.getMinutes()
    const available = times
      .map((value) => {
        const [hours, minutes] = value.split(':').map(Number)
        return { value, minutes: hours * 60 + minutes }
      })
      .sort((left, right) => left.minutes - right.minutes)
    return (
      available.find((item) => item.minutes >= nowMinutes)?.value ||
      available[0]?.value ||
      times[0]
    )
  }

  function chooseNow() {
    setDate(todayValue())
    setTime(nearestAvailableTime(selected.times))
    setUsingNow(true)
  }

  function addToCart(journey?: ConnectedJourney) {
    window.localStorage.setItem(LAST_TRAVELERS_KEY, String(travelers))
    const cartItem = {
      ...experience,
      selectedOption: selected.name,
      selectedDate: date,
      selectedTime: time,
      travelers,
      journey,
      journeyTotal: journey?.total,
    }
    window.localStorage.setItem('tb-cart-count', '1')
    window.localStorage.setItem('tb-cart-experience', JSON.stringify(cartItem))
    window.dispatchEvent(new Event('tb-cart-updated'))
    window.location.href = '/checkout'
  }

  function openTransferChoice() {
    if (isYala) setBookingStep('transfer-choice')
    else addToCart()
  }

  function arrangeTransportOnly() {
    const transfers = yalaJourneyTransferLegs.map((leg) => ({
      legId: leg.id,
      title: leg.title,
      option: leg.options[0],
    }))
    const transportOnly: ConnectedJourney = {
      anchorTitle: experience.title,
      date,
      time,
      travelers,
      recommendation: null,
      transfers,
      guide: false,
      guidePrice: 0,
      total:
        experience.price * travelers +
        transfers.reduce((sum, item) => sum + item.option.price, 0),
    }
    addToCart(transportOnly)
  }

  return (
    <div className="product-page">
      <div className="product-crumb">
        <Link href="/">Home</Link> /{' '}
        <Link href="/search">{experience.destination}</Link> /{' '}
        {experience.title}
      </div>
      <div className="product-main">
        <div className="product-title-block">
          <div className="eyebrow">
            {experience.category} · {experience.destination}
          </div>
          <h1>{experience.title}</h1>
          <div className="product-meta">
            <span className="rating-stars">
              <Star size={15} fill="currentColor" /> {experience.rating}
            </span>
            <span>{experience.reviews.toLocaleString()} reviews</span>
            <span>·</span>
            <span>{experience.supplier}</span>
            <button
              className="button button-ghost"
              onClick={() => setSaved(!saved)}
            >
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} />{' '}
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
        <div className="product-gallery">
          <img
            className="gallery-main"
            src={experience.gallery[0]}
            alt={experience.title}
          />
          <img
            src={experience.gallery[1] || experience.image}
            alt="Experience detail"
          />
          <img
            src={experience.gallery[2] || experience.image}
            alt="Experience detail"
          />
          <img src={experience.image} alt="Experience detail" />
          <div style={{ position: 'relative' }}>
            <img src={experience.gallery[0]} alt="Experience detail" />
            <span
              style={{
                position: 'absolute',
                right: 12,
                bottom: 12,
                background: '#fff',
                padding: '7px 10px',
                fontSize: 11,
                borderRadius: 3,
              }}
            >
              View all photos
            </span>
          </div>
        </div>
        <div className="product-layout">
          <div className="product-content">
            <section>
              <h2>Experience overview</h2>
              <p>{experience.description}</p>
              <ul className="feature-list">
                {experience.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </section>
            <section>
              <h2>What to expect</h2>
              <div className="itinerary">
                {experience.itinerary.map((item) => (
                  <div className="itinerary-item" key={item.title}>
                    <div className="itinerary-time">{item.time}</div>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            {localGuides.length > 0 && (
              <section className="experience-guide-section">
                <div className="product-section-heading">
                  <div>
                    <div className="eyebrow">Want a local perspective?</div>
                    <h2>
                      Do this with someone who knows {experience.destination}.
                    </h2>
                    <p>
                      Turn this experience into a flexible local session. Choose
                      a guide who is available now and ask them to shape the
                      time around what you want to discover.
                    </p>
                  </div>
                  <span className="guide-strip-live">
                    <i /> Available now
                  </span>
                </div>
                <div className="experience-guide-list">
                  {localGuides.map((guide) => (
                    <GuideProfileCard key={guide.id} guide={guide} compact />
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2>What’s included</h2>
              <div className="feature-list">
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>
                    Included
                  </div>
                  {experience.included.map((item) => (
                    <p key={item} style={{ margin: '7px 0' }}>
                      ✓ {item}
                    </p>
                  ))}
                </div>
                <div>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>
                    Not included
                  </div>
                  {experience.notIncluded.map((item) => (
                    <p key={item} style={{ margin: '7px 0' }}>
                      × {item}
                    </p>
                  ))}
                </div>
              </div>
            </section>
            <section>
              <h2>Meeting point</h2>
              <p style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <MapPin size={18} color="var(--orange)" />{' '}
                {experience.meetingPoint}
              </p>
              <div
                className="map-card"
                style={{ minHeight: 160, marginTop: 15 }}
              >
                <span className="map-label">Meeting point</span>
                <span className="map-pin">
                  <span />
                </span>
              </div>
            </section>
            <section>
              <h2>Traveler reviews</h2>
              <div className="review-summary">
                <div>
                  <div className="review-score">{experience.rating}</div>
                  <div className="rating-stars">★★★★★</div>
                  <span className="muted" style={{ fontSize: 11 }}>
                    {experience.reviews} reviews
                  </span>
                </div>
                <div className="review-bars">
                  {[5, 4, 3, 2, 1].map((score, index) => (
                    <div className="bar-line" key={score}>
                      <span>{score}</span>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{ width: `${[92, 6, 1, 1, 0][index]}%` }}
                        />
                      </div>
                      <span>{[92, 6, 1, 1, 0][index]}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
          <aside
            className={`booking-card ${bookingStep !== 'details' ? 'booking-card-journey' : ''}`}
          >
            {bookingStep === 'details' && (
              <>
                <div>
                  <span className="price-big">${selected.price}</span>
                  <span> per adult</span>
                  {experience.originalPrice && (
                    <span className="strike">${experience.originalPrice}</span>
                  )}
                </div>
                <div className="rating-row" style={{ marginTop: 4 }}>
                  <span className="rating-stars">
                    <Star size={14} fill="currentColor" /> {experience.rating}
                  </span>
                  <span>({experience.reviews})</span>
                </div>
                <hr />
                <div className="booking-label-row">
                  <label className="booking-label">
                    <CalendarDays size={13} style={{ verticalAlign: '-2px' }} />{' '}
                    Date
                  </label>
                  <button
                    type="button"
                    className={`booking-now ${usingNow ? 'active' : ''}`}
                    onClick={chooseNow}
                  >
                    <Clock3 size={12} /> Now
                  </button>
                </div>
                <input
                  className="booking-select"
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value)
                    setUsingNow(false)
                  }}
                />
                {usingNow && (
                  <span className="booking-now-note">
                    Today · nearest available start time
                  </span>
                )}
                <label className="booking-label">
                  <Clock3 size={13} style={{ verticalAlign: '-2px' }} /> Start
                  time
                </label>
                <select
                  className="booking-select"
                  value={time}
                  onChange={(event) => {
                    setTime(event.target.value)
                    setUsingNow(false)
                  }}
                >
                  {selected.times.map((startTime) => (
                    <option key={startTime}>{startTime}</option>
                  ))}
                </select>
                <label className="booking-label">
                  <Users size={13} style={{ verticalAlign: '-2px' }} />{' '}
                  Travelers
                </label>
                <select
                  className="booking-select"
                  value={travelers}
                  onChange={(event) =>
                    rememberTravelers(Number(event.target.value))
                  }
                >
                  {[1, 2, 3, 4, 5, 6].map((number) => (
                    <option key={number} value={number}>
                      {number} {number === 1 ? 'traveler' : 'travelers'}
                    </option>
                  ))}
                </select>
                <label className="booking-label">Choose an option</label>
                <select
                  className="booking-select"
                  value={option}
                  onChange={(event) => {
                    setOption(Number(event.target.value))
                    setTime(
                      experience.options[Number(event.target.value)].times[0],
                    )
                    setUsingNow(false)
                  }}
                >
                  {experience.options.map((item, index) => (
                    <option key={item.name} value={index}>
                      {item.name} · ${item.price}
                    </option>
                  ))}
                </select>
                <button
                  className="button button-primary button-wide"
                  onClick={openTransferChoice}
                >
                  {isYala ? 'Continue to trip options' : 'Check availability'}
                </button>
                <div className="booking-perks">
                  {experience.freeCancellation && (
                    <div>
                      <Check size={14} /> Free cancellation
                    </div>
                  )}
                  {experience.payLater && (
                    <div>
                      <ShieldCheck size={14} /> Reserve now, pay later
                    </div>
                  )}
                  <div>
                    <MessageCircle size={14} /> Instant confirmation
                  </div>
                </div>
              </>
            )}
            {bookingStep === 'transfer-choice' && (
              <div className="transfer-choice">
                <button
                  className="journey-back"
                  onClick={() => setBookingStep('details')}
                >
                  <CalendarDays size={14} /> Edit date and travelers
                </button>
                <div className="eyebrow">Before you book</div>
                <h2>How will you get to Yala?</h2>
                <p>
                  We can keep your safari booking simple or connect it with
                  transport and something else nearby.
                </p>
                <div className="transfer-choice-list">
                  <button
                    className="transfer-choice-card"
                    onClick={() => addToCart()}
                  >
                    <span className="choice-icon">
                      <Check size={17} />
                    </span>
                    <span>
                      <strong>I already have transport</strong>
                      <small>Book the Yala safari only.</small>
                    </span>
                  </button>
                  <button
                    className="transfer-choice-card"
                    onClick={arrangeTransportOnly}
                  >
                    <span className="choice-icon">
                      <CarFront size={17} />
                    </span>
                    <span>
                      <strong>Arrange transport</strong>
                      <small>
                        Simulate a ride from Galle and after the safari.
                      </small>
                    </span>
                  </button>
                  <button
                    className="transfer-choice-card featured"
                    onClick={() => setBookingStep('journey')}
                  >
                    <span className="choice-icon">
                      <MapPin size={17} />
                    </span>
                    <span>
                      <strong>Recommend a connected journey</strong>
                      <small>
                        See several nearby experiences and choose each leg.
                      </small>
                    </span>
                  </button>
                </div>
                <button
                  className="button button-ghost"
                  onClick={() => addToCart()}
                >
                  Skip and book safari only <span aria-hidden="true">→</span>
                </button>
              </div>
            )}
            {bookingStep === 'journey' && (
              <ConnectedJourneyBuilder
                anchorTitle={experience.title}
                anchorPrice={selected.price}
                date={date}
                time={time}
                travelers={travelers}
                recommendations={yalaJourneyRecommendations}
                transferLegs={yalaJourneyTransferLegs}
                onBack={() => setBookingStep('transfer-choice')}
                onContinue={(journey) => addToCart(journey)}
              />
            )}
          </aside>
        </div>
        <section
          className="section"
          style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}
        >
          <div className="section-heading">
            <div>
              <div className="eyebrow">Keep exploring</div>
              <h2>More like this</h2>
            </div>
          </div>
          <div className="experience-grid">
            {experiences
              .filter((item) => item.id !== experience.id)
              .slice(0, 4)
              .map((item) => (
                <ExperienceCard key={item.id} experience={item} />
              ))}
          </div>
        </section>
      </div>
    </div>
  )
}
