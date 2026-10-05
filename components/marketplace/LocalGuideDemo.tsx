'use client'

import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Check,
  Clock3,
  Compass,
  Heart,
  Languages,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Radio,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  Users,
  X,
} from 'lucide-react'

type GuideState =
  'discover' | 'matching' | 'available' | 'requested' | 'active' | 'ended'

const zones = [
  {
    name: 'Galle Fort',
    city: 'Galle',
    detail: 'Historic walls, cafés and the lighthouse',
  },
  {
    name: 'Kandy Lake',
    city: 'Kandy',
    detail: 'Temple trails, markets and hill-country stories',
  },
  {
    name: 'Ella Centre',
    city: 'Ella',
    detail: 'Tea country, viewpoints and easy hikes',
  },
  {
    name: 'Colombo Fort',
    city: 'Colombo',
    detail: 'Food, art and the city after dark',
  },
]

const guides = [
  {
    name: 'Nadeesha',
    initials: 'NS',
    role: 'Galle storyteller',
    rating: '4.98',
    reviews: 126,
    languages: 'English · සිංහල',
    distance: '2 min away',
    price: '$18/hr',
    color: '#d77a50',
  },
  {
    name: 'Ruwan',
    initials: 'RW',
    role: 'Food & heritage guide',
    rating: '4.96',
    reviews: 89,
    languages: 'English · Deutsch',
    distance: '5 min away',
    price: '$15/hr',
    color: '#4b8d7b',
  },
  {
    name: 'Tharushi',
    initials: 'TK',
    role: 'Slow travel companion',
    rating: '4.94',
    reviews: 74,
    languages: 'English · 日本語',
    distance: '8 min away',
    price: '$16/hr',
    color: '#9672a8',
  },
]

export function LocalGuideDemo({ initialZone }: { initialZone?: string }) {
  const [zone, setZone] = useState(
    () =>
      zones.find(
        (item) => item.name === initialZone || item.city === initialZone,
      ) || zones[0],
  )
  const [state, setState] = useState<GuideState>('discover')
  const [selectedGuide, setSelectedGuide] = useState<
    (typeof guides)[number] | null
  >(null)
  const [seconds, setSeconds] = useState(0)
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    if (state !== 'active') return
    const timer = window.setInterval(
      () => setSeconds((value) => value + 1),
      1000,
    )
    return () => window.clearInterval(timer)
  }, [state])

  function findGuides() {
    setState('matching')
    window.setTimeout(() => setState('available'), 900)
  }

  function requestGuide(guide: (typeof guides)[number]) {
    setSelectedGuide(guide)
    setState('requested')
  }

  function startAgain(nextZone = zone) {
    setZone(nextZone)
    setSelectedGuide(null)
    setMessages([])
    setSeconds(0)
    setState('discover')
  }

  function askGuide(question: string) {
    setMessages((items) => [...items, question])
  }

  const minute = String(Math.floor(seconds / 60)).padStart(2, '0')
  const second = String(seconds % 60).padStart(2, '0')
  const step =
    state === 'discover' || state === 'matching'
      ? 1
      : state === 'available' || state === 'requested'
        ? 2
        : 3

  return (
    <div className="guide-page">
      <div className="guide-inner">
        <div className="guide-hero-copy">
          <div className="eyebrow">Travel Buddy Now</div>
          <h1>A local guide, right when you arrive.</h1>
          <p>
            Travel solo, stay curious. Find someone who knows the neighbourhood
            and start exploring in minutes.
          </p>
        </div>

        <div className="guide-steps" aria-label="Guide session progress">
          {['Choose your zone', 'Pick a local', 'Explore together'].map(
            (label, index) => (
              <div
                className={`guide-step ${step > index + 1 ? 'complete' : step === index + 1 ? 'current' : ''}`}
                key={label}
              >
                <span>
                  {step > index + 1 ? <Check size={14} /> : index + 1}
                </span>
                <strong>{label}</strong>
              </div>
            ),
          )}
        </div>

        {state === 'discover' && (
          <section className="guide-discover-panel">
            <div className="guide-location-card">
              <div className="guide-live-icon">
                <Navigation size={21} />
              </div>
              <div>
                <div className="guide-card-label">Your current zone</div>
                <h2>{zone.name}</h2>
                <p>{zone.detail}</p>
              </div>
              <span className="live-pill">
                <i /> Live zone
              </span>
            </div>
            <div className="guide-discover-controls">
              <label htmlFor="guide-zone">
                Choose a destination for this demo
              </label>
              <select
                id="guide-zone"
                value={zone.name}
                onChange={(event) =>
                  setZone(
                    zones.find((item) => item.name === event.target.value) ||
                      zones[0],
                  )
                }
              >
                {zones.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}, Sri Lanka
                  </option>
                ))}
              </select>
              <button
                className="button button-primary button-wide"
                onClick={findGuides}
              >
                <MapPin size={16} /> Find guides nearby
              </button>
            </div>
            <div className="guide-trust-row">
              <span>
                <ShieldCheck size={15} /> ID-checked locals
              </span>
              <span>
                <Clock3 size={15} /> Usually respond in 2 min
              </span>
              <span>
                <Heart size={15} /> Pay only for time together
              </span>
            </div>
          </section>
        )}

        {state === 'matching' && (
          <section className="guide-status-panel matching-panel">
            <div className="radar">
              <Radio size={32} />
            </div>
            <div className="eyebrow">Scanning {zone.name}</div>
            <h2>Finding locals who are free now</h2>
            <p>
              Checking the live guide zone and matching language, interests and
              distance.
            </p>
            <div className="loading-dots">
              <i />
              <i />
              <i />
            </div>
          </section>
        )}

        {state === 'available' && (
          <section className="guide-results-panel">
            <div className="guide-results-heading">
              <div>
                <div className="eyebrow">Live in {zone.name}</div>
                <h2>8 local guides are available now.</h2>
                <p>Choose someone for a flexible, one-off local session.</p>
              </div>
              <span className="online-count">
                <i /> 8 online
              </span>
            </div>
            <div className="guide-list">
              {guides.map((guide) => (
                <article className="guide-card" key={guide.name}>
                  <div
                    className="guide-avatar"
                    style={{ background: guide.color }}
                  >
                    {guide.initials}
                    <span className="online-dot" />
                  </div>
                  <div className="guide-card-main">
                    <div className="guide-name-line">
                      <h3>{guide.name}</h3>
                      <span className="guide-rating">
                        <Star size={13} fill="currentColor" /> {guide.rating}{' '}
                        <em>({guide.reviews})</em>
                      </span>
                    </div>
                    <p>{guide.role}</p>
                    <div className="guide-meta">
                      <span>
                        <Languages size={13} /> {guide.languages}
                      </span>
                      <span>
                        <MapPin size={13} /> {guide.distance}
                      </span>
                    </div>
                  </div>
                  <div className="guide-card-action">
                    <strong>{guide.price}</strong>
                    <span>Flexible session</span>
                    <button
                      className="button button-secondary"
                      onClick={() => requestGuide(guide)}
                    >
                      Choose {guide.name} <ArrowRight size={14} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <button
              className="button button-ghost"
              onClick={() => setState('discover')}
            >
              <X size={14} /> Change destination
            </button>
          </section>
        )}

        {state === 'requested' && selectedGuide && (
          <section className="guide-status-panel requested-panel">
            <div className="success-mark">
              <Check size={27} />
            </div>
            <div className="eyebrow">{selectedGuide.name} is on the way</div>
            <h2>Your local connection is confirmed.</h2>
            <p>
              Meet {selectedGuide.name} at the {zone.name} meeting point. This
              demo session is ready to start when you arrive.
            </p>
            <div className="guide-confirmed-card">
              <div
                className="guide-avatar small"
                style={{ background: selectedGuide.color }}
              >
                {selectedGuide.initials}
                <span className="online-dot" />
              </div>
              <div>
                <strong>{selectedGuide.name}</strong>
                <span>{selectedGuide.role} · 4 min away</span>
              </div>
              <span className="confirmed-badge">Confirmed</span>
            </div>
            <div className="guide-action-row">
              <button
                className="button button-primary"
                onClick={() => setState('active')}
              >
                <Compass size={16} /> Start local session
              </button>
              <button
                className="button button-secondary"
                onClick={() => setState('available')}
              >
                Choose another guide
              </button>
            </div>
          </section>
        )}

        {state === 'active' && selectedGuide && (
          <section className="active-session-panel">
            <div className="session-topline">
              <div>
                <div className="eyebrow">Live local session · {zone.name}</div>
                <h2>You’re exploring with {selectedGuide.name}.</h2>
              </div>
              <span className="session-live">
                <i /> Session live
              </span>
            </div>
            <div className="session-grid">
              <div className="session-map">
                <div className="map-grid">
                  <div className="map-road road-one" />
                  <div className="map-road road-two" />
                  <div className="map-road road-three" />
                  <div className="map-water" />
                  <span className="map-label fort-label">{zone.name}</span>
                  <span className="map-label cafe-label">
                    {zone.city} highlights
                  </span>
                  <span className="map-pin">
                    <MapPin size={22} fill="currentColor" />
                  </span>
                  <span className="map-guide-pin">
                    <UserRound size={17} />
                  </span>
                </div>
                <div className="session-map-footer">
                  <Navigation size={14} /> Walking through {zone.city}{' '}
                  <strong>
                    {minute}:{second}
                  </strong>
                </div>
              </div>
              <div className="session-side">
                <div className="session-guide-head">
                  <div
                    className="guide-avatar small"
                    style={{ background: selectedGuide.color }}
                  >
                    {selectedGuide.initials}
                    <span className="online-dot" />
                  </div>
                  <div>
                    <strong>{selectedGuide.name}</strong>
                    <span>{selectedGuide.role}</span>
                  </div>
                  <button className="round-action" aria-label="Call guide">
                    <Phone size={15} />
                  </button>
                </div>
                <div className="session-next">
                  <span className="guide-card-label">Up next</span>
                  <strong>{zone.name} local highlight</strong>
                  <p>
                    “I’ll show you a favourite view and tell you the story
                    behind this place.”
                  </p>
                </div>
                <div className="quick-questions">
                  <span className="guide-card-label">Ask your local</span>
                  {[
                    'Where should I eat nearby?',
                    'Tell me a local story',
                    'What should I see next?',
                  ].map((question) => (
                    <button key={question} onClick={() => askGuide(question)}>
                      <MessageCircle size={13} /> {question}
                    </button>
                  ))}
                </div>
                {messages.length > 0 && (
                  <div className="asked-question">
                    <Sparkles size={14} /> {messages[messages.length - 1]}
                    <span>Sent to {selectedGuide.name}</span>
                  </div>
                )}
                <button
                  className="button button-secondary button-wide end-session"
                  onClick={() => setState('ended')}
                >
                  End this local session
                </button>
              </div>
            </div>
          </section>
        )}

        {state === 'ended' && (
          <section className="guide-status-panel ended-panel">
            <div className="success-mark">
              <Check size={27} />
            </div>
            <div className="eyebrow">Session complete</div>
            <h2>{zone.city} is yours to keep exploring.</h2>
            <p>
              Your local session in {zone.name} has ended. When you reach your
              next destination, open Travel Buddy Now and find a new local
              connection.
            </p>
            <div className="trip-progress">
              <div>
                <span className="trip-dot done">
                  <Check size={12} />
                </span>
                <strong>Colombo</strong>
                <small>Completed</small>
              </div>
              <div className="trip-line active" />
              <div>
                <span className="trip-dot done">
                  <Check size={12} />
                </span>
                <strong>Galle</strong>
                <small>Just explored</small>
              </div>
              <div className="trip-line" />
              <div>
                <span className="trip-dot" />
                <strong>Next stop</strong>
                <small>Choose your zone</small>
              </div>
            </div>
            <button
              className="button button-primary"
              onClick={() => startAgain(zones[1])}
            >
              <Navigation size={16} /> Find a guide in Kandy
            </button>
          </section>
        )}

        <div className="guide-footer-note">
          <Users size={15} /> A new local for every destination, with your whole
          journey kept in one place.
        </div>
      </div>
    </div>
  )
}
