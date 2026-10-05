'use client'

import Link from 'next/link'
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CarFront,
  Check,
  CircleCheck,
  Clock3,
  GripVertical,
  Plus,
  QrCode,
  ShoppingBag,
  Sparkles,
  Trash2,
  Undo2,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { experiences, type Experience } from '@/lib/marketplace/catalog'
import {
  addExperienceToJourneyPlan,
  createJourneyPlan,
  getExperienceForJourneyEvent,
  JOURNEY_CHECKOUT_KEY,
  readJourneyPlans,
  writeJourneyPlans,
  type JourneyEvent,
  type JourneyPlan,
} from '@/lib/marketplace/journey'
import { JourneyQrCard } from '@/components/marketplace/JourneyQrCard'

function experienceFor(event: JourneyEvent): Experience {
  return getExperienceForJourneyEvent(event) || experiences[0]
}

const rideOptions = [
  {
    id: 'comfort',
    label: 'Comfort ride',
    detail: 'Private pickup · 12 min',
    price: 16,
  },
  {
    id: 'eco',
    label: 'Eco ride',
    detail: 'Hybrid vehicle · 15 min',
    price: 12,
  },
  {
    id: 'shared',
    label: 'Shared transfer',
    detail: 'Save more · 25 min',
    price: 7,
  },
] as const

export function SaveToJourneyButton({
  experienceId,
}: {
  experienceId: string
}) {
  const [saved, setSaved] = useState(false)

  function save() {
    addExperienceToJourneyPlan(experienceId)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2200)
  }

  return (
    <button
      className={`button ${saved ? 'button-secondary' : 'button-ghost'}`}
      type="button"
      onClick={save}
    >
      {saved ? (
        <>
          <Check size={15} /> Added to trip plan
        </>
      ) : (
        <>
          <Plus size={15} /> Add to trip plan
        </>
      )}
    </button>
  )
}

export function JourneyPlanner() {
  const [plans, setPlans] = useState<JourneyPlan[]>([])
  const [activePlanId, setActivePlanId] = useState('')
  const [showQrFor, setShowQrFor] = useState<JourneyPlan | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [notice, setNotice] = useState('')
  const [rideFor, setRideFor] = useState<string | null>(null)
  const [rideChoice, setRideChoice] =
    useState<(typeof rideOptions)[number]['id']>('comfort')
  const [rideRequested, setRideRequested] = useState(false)

  useEffect(() => {
    const load = () => {
      const loaded = readJourneyPlans()
      setPlans(loaded)
      setActivePlanId((current) => current || loaded[0]?.id || '')
    }
    load()
    window.addEventListener('tb-journey-plans-updated', load)
    return () => window.removeEventListener('tb-journey-plans-updated', load)
  }, [])

  const activePlan = plans.find((plan) => plan.id === activePlanId) || plans[0]
  const activeEvents = activePlan?.events || []
  const selectedEvents = useMemo(
    () => activeEvents.filter((event) => event.selected),
    [activeEvents],
  )
  const rideEvent = rideFor
    ? activeEvents.find(
        (event) => event.id === rideFor && event.status === 'completed',
      )
    : null
  const rideExperience = rideEvent ? experienceFor(rideEvent) : null

  function persist(nextPlans: JourneyPlan[]) {
    setPlans(nextPlans)
    writeJourneyPlans(nextPlans)
  }

  function updateActivePlan(updater: (plan: JourneyPlan) => JourneyPlan) {
    if (!activePlan) return
    persist(
      plans.map((plan) =>
        plan.id === activePlan.id
          ? updater({ ...plan, events: [...plan.events] })
          : plan,
      ),
    )
  }

  function toggleEvent(eventId: string) {
    updateActivePlan((plan) => ({
      ...plan,
      events: plan.events.map((event) =>
        event.id === eventId ? { ...event, selected: !event.selected } : event,
      ),
    }))
  }

  function moveEvent(index: number, direction: -1 | 1) {
    updateActivePlan((plan) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= plan.events.length) return plan
      const events = [...plan.events]
      ;[events[index], events[nextIndex]] = [events[nextIndex], events[index]]
      return {
        ...plan,
        events: events.map((event, eventIndex) => ({
          ...event,
          day: eventIndex + 1,
        })),
      }
    })
  }

  function markComplete(eventId: string) {
    const currentEvent = activeEvents.find((event) => event.id === eventId)
    const completing = currentEvent?.status !== 'completed'
    updateActivePlan((plan) => ({
      ...plan,
      events: plan.events.map((event) =>
        event.id === eventId
          ? { ...event, status: completing ? 'completed' : 'planned' }
          : event,
      ),
    }))
    setRideFor(completing ? eventId : null)
    setRideRequested(false)
    setNotice(
      completing
        ? 'Experience history updated. Choose a simulated pickup for the next leg.'
        : 'Experience reopened. The ride handoff is ready again when you finish it.',
    )
  }

  function requestRide() {
    if (!activePlan || !rideFor) return
    const event = activePlan.events.find((item) => item.id === rideFor)
    if (!event) return
    const ride =
      rideOptions.find((option) => option.id === rideChoice) || rideOptions[0]
    window.localStorage.setItem(
      'tb-ride-requests',
      JSON.stringify({
        planId: activePlan.id,
        eventId: event.id,
        rideId: ride.id,
        requestedAt: new Date().toISOString(),
      }),
    )
    setRideRequested(true)
  }

  function removeEvent(eventId: string) {
    updateActivePlan((plan) => ({
      ...plan,
      events: plan.events
        .filter((event) => event.id !== eventId)
        .map((event, index) => ({ ...event, day: index + 1 })),
      days: Math.max(1, plan.events.length - 1),
    }))
  }

  function createPlan() {
    const plan = createJourneyPlan(newPlanName.trim() || 'A new adventure')
    const nextPlans = [...plans, plan]
    persist(nextPlans)
    setActivePlanId(plan.id)
    setNewPlanName('')
    setShowCreate(false)
  }

  function bookSelected() {
    if (!activePlan || !selectedEvents.length) return
    window.localStorage.setItem(
      JOURNEY_CHECKOUT_KEY,
      JSON.stringify({ ...activePlan, events: selectedEvents }),
    )
    window.location.href = '/checkout?plan=1'
  }

  if (!activePlan) return null

  return (
    <section className="journey-planner">
      <div className="journey-planner-head">
        <div>
          <div className="eyebrow">Portable trip plans</div>
          <h2>Build a journey, not just a wishlist.</h2>
          <p>
            Save single experiences or connect a full tour. Reorder the days,
            share the plan offline, then book what you selected.
          </p>
        </div>
        <div className="journey-planner-head-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={() => setShowCreate(!showCreate)}
          >
            <Plus size={15} /> New plan
          </button>
        </div>
      </div>
      {showCreate && (
        <div className="journey-create-row">
          <input
            aria-label="New trip plan name"
            value={newPlanName}
            onChange={(event) => setNewPlanName(event.target.value)}
            placeholder="e.g. Two weeks in Sri Lanka"
          />
          <button
            className="button button-primary"
            type="button"
            onClick={createPlan}
          >
            Create plan
          </button>
        </div>
      )}
      {plans.length > 1 && (
        <div className="journey-plan-tabs">
          {plans.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className={plan.id === activePlan.id ? 'active' : ''}
              onClick={() => setActivePlanId(plan.id)}
            >
              {plan.name}
              <small>{plan.events.length} events</small>
            </button>
          ))}
        </div>
      )}
      <div className="journey-plan-card">
        <div className="journey-plan-summary">
          <div>
            <span className="journey-plan-kicker">
              <CalendarDays size={14} /> {activePlan.days} day plan
            </span>
            <h3>{activePlan.name}</h3>
            <p>
              {selectedEvents.length} selected of {activeEvents.length} saved
              events · Day numbers are stored, not exact times.
            </p>
          </div>
          <div className="journey-plan-actions">
            <button
              className="icon-button"
              type="button"
              aria-label="Share journey QR"
              onClick={() => setShowQrFor(activePlan)}
            >
              <QrCode size={18} />
            </button>
            <button
              className="button button-primary"
              type="button"
              disabled={!selectedEvents.length}
              onClick={bookSelected}
            >
              <ShoppingBag size={15} /> Book selected
            </button>
          </div>
        </div>
        <div className="journey-event-list">
          {activeEvents.length ? (
            activeEvents.map((event, index) => {
              const experience = experienceFor(event)
              const completed = event.status === 'completed'
              return (
                <article
                  className={`journey-event-row ${event.selected ? 'is-selected' : ''} ${completed ? 'is-complete' : ''}`}
                  key={`${event.id}-${index}`}
                >
                  <button
                    className={`journey-event-check ${event.selected ? 'checked' : ''}`}
                    type="button"
                    aria-label={`${event.selected ? 'Deselect' : 'Select'} ${experience.title}`}
                    onClick={() => toggleEvent(event.id)}
                  >
                    {event.selected ? <Check size={14} /> : null}
                  </button>
                  <div className="journey-event-day">
                    <span>Day</span>
                    <strong>{event.day}</strong>
                  </div>
                  <img src={experience.image} alt="" />
                  <div className="journey-event-copy">
                    <div className="journey-event-title">
                      <span className="eyebrow">
                        {experience.destination} · {experience.category}
                      </span>
                      {completed && (
                        <span className="journey-complete-pill">
                          <CircleCheck size={13} /> Completed
                        </span>
                      )}
                    </div>
                    <Link href={`/experience/${experience.id}`}>
                      <h4>{experience.title}</h4>
                    </Link>
                    <p>
                      {experience.duration} · from ${experience.price} per adult
                    </p>
                  </div>
                  <div className="journey-event-controls">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Move ${experience.title} up`}
                      onClick={() => moveEvent(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Move ${experience.title} down`}
                      onClick={() => moveEvent(index, 1)}
                      disabled={index === activeEvents.length - 1}
                    >
                      <ArrowDown size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`${completed ? 'Reopen' : 'Mark'} ${experience.title}`}
                      onClick={() => markComplete(event.id)}
                    >
                      {completed ? <Undo2 size={15} /> : <Sparkles size={15} />}
                    </button>
                    <button
                      type="button"
                      className="icon-button danger-icon"
                      aria-label={`Remove ${experience.title}`}
                      onClick={() => removeEvent(event.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </article>
              )
            })
          ) : (
            <div className="journey-empty">
              <GripVertical size={22} />
              <strong>Your plan is ready for its first story.</strong>
              <span>Add an experience from any detail page.</span>
            </div>
          )}
        </div>
        {notice && (
          <div className="journey-transport-notice">
            <span className="transport-pulse">
              <Sparkles size={15} />
            </span>
            <div>
              <strong>Next step after completion</strong>
              <p>{notice}</p>
            </div>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setNotice('')}
            >
              Dismiss
            </button>
          </div>
        )}
        {rideEvent && rideExperience && (
          <div className="journey-ride-card">
            <div className="journey-ride-heading">
              <div>
                <span className="eyebrow">
                  <CarFront size={13} /> Dummy transport handoff
                </span>
                <h3>Ready for the next leg?</h3>
                <p>
                  Choose a pickup after {rideExperience.title}. This is a local
                  demo — no ride service is contacted.
                </p>
              </div>
              <span className="journey-ride-badge">
                <Clock3 size={13} /> After Day {rideEvent.day}
              </span>
            </div>
            <div className="journey-ride-options">
              {rideOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`journey-ride-option ${rideChoice === option.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setRideChoice(option.id)
                    setRideRequested(false)
                  }}
                >
                  <span className="journey-ride-radio">
                    {rideChoice === option.id ? <Check size={12} /> : null}
                  </span>
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.detail}</small>
                  </span>
                  <b>${option.price}</b>
                </button>
              ))}
            </div>
            <div className="journey-ride-footer">
              {rideRequested ? (
                <span className="journey-ride-confirmed">
                  <CircleCheck size={16} /> Pickup saved to this trip
                </span>
              ) : (
                <span className="journey-ride-footnote">
                  A pickup handoff will be attached to the completed experience.
                </span>
              )}
              <button
                type="button"
                className="button button-primary"
                onClick={requestRide}
              >
                {rideRequested ? 'Pickup saved' : 'Request pickup'}
              </button>
            </div>
          </div>
        )}
        <div className="journey-plan-foot">
          <span>
            <ShieldIcon /> Offline-ready bundle · no online storage
          </span>
          <span>Share one compact QR for the whole trip</span>
        </div>
      </div>
      {showQrFor && (
        <JourneyQrCard plan={showQrFor} onClose={() => setShowQrFor(null)} />
      )}
    </section>
  )
}

function ShieldIcon() {
  return (
    <span className="journey-foot-check">
      <Check size={11} />
    </span>
  )
}
