'use client'

import Link from 'next/link'
import { Check, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { experiences } from '@/lib/marketplace/catalog'
import {
  JOURNEY_CHECKOUT_KEY,
  getExperienceForJourneyEvent,
  type JourneyPlan,
} from '@/lib/marketplace/journey'

export default function CheckoutPage() {
  const [item, setItem] = useState<any>(null)
  const [plan, setPlan] = useState<JourneyPlan | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [payLater, setPayLater] = useState(false)

  useEffect(() => {
    const storedPlan = window.localStorage.getItem(JOURNEY_CHECKOUT_KEY)
    if (storedPlan) {
      setPlan(JSON.parse(storedPlan))
      return
    }
    const stored = window.localStorage.getItem('tb-cart-experience')
    setItem(
      stored
        ? JSON.parse(stored)
        : {
            ...experiences[0],
            selectedOption: experiences[0].options[0].name,
            selectedDate: '2026-10-18',
            selectedTime: '17:30',
            travelers: 2,
          },
    )
  }, [])

  const planExperiences = useMemo(
    () =>
      plan?.events
        .filter((event) => event.selected)
        .map((event) => ({
          event,
          experience: getExperienceForJourneyEvent(event),
        }))
        .filter(
          (
            entry,
          ): entry is {
            event: (typeof plan.events)[number]
            experience: NonNullable<
              ReturnType<typeof getExperienceForJourneyEvent>
            >
          } => Boolean(entry.experience),
        ) || [],
    [plan],
  )
  const planSubtotal = planExperiences.reduce(
    (sum, entry) => sum + entry.experience.price,
    0,
  )

  function confirmBooking() {
    setConfirmed(true)
    window.localStorage.removeItem('tb-cart-count')
    window.localStorage.removeItem(JOURNEY_CHECKOUT_KEY)
    window.dispatchEvent(new Event('tb-cart-updated'))
  }

  if (confirmed)
    return (
      <div className="checkout-page">
        <div
          className="checkout-inner"
          style={{ maxWidth: 650, textAlign: 'center', padding: '70px 0' }}
        >
          <div
            className="trust-icon"
            style={{ margin: '0 auto 20px', width: 58, height: 58 }}
          >
            <Check size={28} />
          </div>
          <div className="eyebrow">You’re all set</div>
          <h1 style={{ fontSize: 47 }}>
            {plan ? 'Your journey is booked.' : 'Your adventure is confirmed.'}
          </h1>
          <p className="muted">
            We’ve created a simulated offline-ready booking for{' '}
            {plan ? <strong>{plan.name}</strong> : 'your experience'}. Your
            booking reference is <strong>TB-7K4M2</strong>.
          </p>
          <div
            className="checkout-card"
            style={{ textAlign: 'left', marginTop: 28 }}
          >
            <div className="summary-item">
              <img
                src={
                  planExperiences[0]?.experience.image ||
                  item?.image ||
                  experiences[0].image
                }
                alt=""
              />
              <div>
                <strong>
                  {plan ? plan.name : item?.title || experiences[0].title}
                </strong>
                <span>
                  {plan
                    ? `${planExperiences.length} selected events · ${plan.days} days`
                    : `${item?.selectedDate || 'Oct 18, 2026'} · ${item?.selectedTime || '17:30'}`}
                </span>
                <span>
                  {plan
                    ? 'Events and transport handoff included'
                    : 'Mobile ticket · Free cancellation'}
                </span>
              </div>
            </div>
            <Link
              className="button button-primary button-wide"
              href="/account"
              style={{ marginTop: 18 }}
            >
              View my booking
            </Link>
          </div>
          <Link href="/" className="button button-ghost">
            Continue exploring
          </Link>
        </div>
      </div>
    )
  if (!item && !plan)
    return (
      <div className="checkout-page">
        <div className="checkout-inner">
          <div className="checkout-card">Loading your trip…</div>
        </div>
      </div>
    )

  const travelers = item?.travelers || 2
  const journey = item?.journey
  const experienceSubtotal = item ? item.price * travelers : 0
  const recommendationSubtotal = journey?.recommendation
    ? journey.recommendation.price * travelers
    : 0
  const transportSubtotal =
    journey?.transfers?.reduce(
      (sum: number, transfer: any) => sum + transfer.option.price,
      0,
    ) || 0
  const guideSubtotal = journey?.guidePrice || 0
  const subtotal = plan
    ? planSubtotal
    : journey
      ? experienceSubtotal +
        recommendationSubtotal +
        transportSubtotal +
        guideSubtotal
      : experienceSubtotal
  const fees = Math.round(subtotal * 0.08)
  const total = subtotal + fees

  return (
    <div className="checkout-page">
      <div className="checkout-inner">
        <div className="checkout-header">
          <div>
            <div className="breadcrumb">Your trip / Checkout</div>
            <h1>{plan ? `Book ${plan.name}` : 'Complete your booking'}</h1>
          </div>
          <div className="secure-note">
            <LockKeyhole size={14} /> Secure checkout
          </div>
        </div>
        <div className="checkout-grid">
          <div>
            <div className="checkout-card">
              <h2>Traveler details</h2>
              <div className="portal-form-grid">
                <div className="field">
                  <label>First name</label>
                  <input defaultValue="Maya" />
                </div>
                <div className="field">
                  <label>Last name</label>
                  <input defaultValue="Chen" />
                </div>
                <div className="field">
                  <label>Email address</label>
                  <input defaultValue="maya.chen@example.com" type="email" />
                </div>
                <div className="field">
                  <label>Phone number</label>
                  <input defaultValue="+1 415 555 0188" />
                </div>
              </div>
            </div>
            {plan && (
              <div className="checkout-card">
                <h2>Trip sequence</h2>
                <div className="plan-checkout-list">
                  {planExperiences.map(({ event, experience }) => (
                    <div className="plan-checkout-row" key={event.id}>
                      <span>Day {event.day}</span>
                      <strong>{experience.title}</strong>
                      <em>${experience.price}</em>
                    </div>
                  ))}
                </div>
                <div className="notice">
                  <ShieldCheck
                    size={15}
                    style={{ verticalAlign: '-3px', marginRight: 6 }}
                  />{' '}
                  Transportation handoffs will be suggested after each completed
                  experience.
                </div>
              </div>
            )}
            <div className="checkout-card">
              <h2>Pickup & special requirements</h2>
              <div className="field">
                <label>Hotel or meeting point</label>
                <input placeholder="Tell us where to meet you" />
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>
                  Anything else we should know?{' '}
                  <span className="muted">(optional)</span>
                </label>
                <textarea placeholder="Dietary needs, accessibility requirements…" />
              </div>
            </div>
            <div className="checkout-card">
              <h2>Payment</h2>
              <div className="notice">
                <ShieldCheck
                  size={15}
                  style={{ verticalAlign: '-3px', marginRight: 6 }}
                />{' '}
                This is a simulated local payment. No real card will be charged.
              </div>
              <div className="field" style={{ marginTop: 14 }}>
                <label>Card number</label>
                <input defaultValue="4242 4242 4242 4242" />
              </div>
              <div className="portal-form-grid" style={{ marginTop: 14 }}>
                <div className="field">
                  <label>Expiry</label>
                  <input defaultValue="12 / 28" />
                </div>
                <div className="field">
                  <label>CVC</label>
                  <input defaultValue="123" />
                </div>
              </div>
              <label className="filter-option" style={{ marginTop: 17 }}>
                <input
                  type="checkbox"
                  checked={payLater}
                  onChange={(event) => setPayLater(event.target.checked)}
                />{' '}
                Reserve now and pay later (if eligible)
              </label>
            </div>
          </div>
          <aside className="checkout-summary">
            <div className="checkout-card">
              <h2>
                {plan
                  ? 'Your trip plan'
                  : journey
                    ? 'Your connected journey'
                    : 'Your booking'}
              </h2>
              {plan ? (
                <div className="summary-plan-heading">
                  <strong>{plan.name}</strong>
                  <span>
                    {plan.days} days · {planExperiences.length} selected events
                  </span>
                </div>
              ) : (
                <div className="summary-item">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.selectedOption}</span>
                    <span>
                      {item.selectedDate} · {item.selectedTime}
                    </span>
                    <span>{travelers} travelers</span>
                  </div>
                </div>
              )}
              {!plan && journey && (
                <div className="journey-checkout-list">
                  <div className="summary-line">
                    <span>Transport · Galle → Yala</span>
                    <span>${journey.transfers?.[0]?.option.price || 0}</span>
                  </div>
                  {journey.recommendation && (
                    <div className="summary-line">
                      <span>{journey.recommendation.title}</span>
                      <span>${recommendationSubtotal}</span>
                    </div>
                  )}
                  {journey.transfers?.slice(1).map((transfer: any) => (
                    <div className="summary-line" key={transfer.legId}>
                      <span>Transport · {transfer.title}</span>
                      <span>${transfer.option.price}</span>
                    </div>
                  ))}
                  {journey.guide && (
                    <div className="summary-line">
                      <span>Local guide · optional</span>
                      <span>${guideSubtotal}</span>
                    </div>
                  )}
                </div>
              )}
              <div style={{ marginTop: 18 }}>
                <div className="summary-line">
                  <span>
                    {plan
                      ? 'Selected experiences'
                      : `Experience${journey ? ' and selected items' : ''}`}
                  </span>
                  <span>
                    $
                    {plan
                      ? planSubtotal
                      : journey
                        ? experienceSubtotal + recommendationSubtotal
                        : experienceSubtotal}
                  </span>
                </div>
                {!plan && journey && (
                  <div className="summary-line">
                    <span>Transport</span>
                    <span>${transportSubtotal}</span>
                  </div>
                )}
                {!plan && journey?.guide && (
                  <div className="summary-line">
                    <span>Guide</span>
                    <span>${guideSubtotal}</span>
                  </div>
                )}
                <div className="summary-line">
                  <span>Taxes and fees</span>
                  <span>${fees}</span>
                </div>
                <div className="summary-line summary-total">
                  <span>Total</span>
                  <span>${total}</span>
                </div>
              </div>
              <button
                className="button button-primary button-wide"
                onClick={confirmBooking}
              >
                {payLater ? 'Reserve for free' : `Pay $${total}`}
              </button>
              <p
                style={{
                  textAlign: 'center',
                  fontSize: 10,
                  margin: '12px 0 0',
                }}
              >
                By continuing, you agree to our terms and cancellation policy.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
