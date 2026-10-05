'use client'

import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Check,
  ChevronDown,
  MapPin,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type {
  JourneyRecommendation,
  JourneyTransferLeg,
  JourneyTransferOption,
} from '@/lib/marketplace/catalog'

export type JourneyTransferSelection = {
  legId: string
  title: string
  option: JourneyTransferOption
}

export type ConnectedJourney = {
  anchorTitle: string
  date: string
  time: string
  travelers: number
  recommendation: JourneyRecommendation | null
  transfers: JourneyTransferSelection[]
  guide: boolean
  guidePrice: number
  total: number
}

type Props = {
  anchorTitle: string
  anchorPrice: number
  date: string
  time: string
  travelers: number
  recommendations: JourneyRecommendation[]
  transferLegs: JourneyTransferLeg[]
  onBack: () => void
  onContinue: (journey: ConnectedJourney) => void
}

export function ConnectedJourneyBuilder({
  anchorTitle,
  anchorPrice,
  date,
  time,
  travelers,
  recommendations,
  transferLegs,
  onBack,
  onContinue,
}: Props) {
  const [recommendationId, setRecommendationId] = useState<string | null>(
    recommendations[0]?.id || null,
  )
  const [selectedTransfers, setSelectedTransfers] = useState<
    Record<string, string>
  >(() =>
    Object.fromEntries(transferLegs.map((leg) => [leg.id, leg.options[0]?.id])),
  )
  const [guide, setGuide] = useState(false)

  const recommendation =
    recommendations.find((item) => item.id === recommendationId) || null
  const transfers = useMemo(
    () =>
      transferLegs.flatMap((leg) => {
        const option = leg.options.find(
          (item) => item.id === selectedTransfers[leg.id],
        )
        return option ? [{ legId: leg.id, title: leg.title, option }] : []
      }),
    [selectedTransfers, transferLegs],
  )
  const guidePrice = guide ? 36 : 0
  const total =
    anchorPrice * travelers +
    (recommendation?.price || 0) * travelers +
    transfers.reduce((sum, item) => sum + item.option.price, 0) +
    guidePrice

  function chooseRecommendation(id: string) {
    setRecommendationId((current) => (current === id ? null : id))
  }

  function continueWithJourney() {
    onContinue({
      anchorTitle,
      date,
      time,
      travelers,
      recommendation,
      transfers,
      guide,
      guidePrice,
      total,
    })
  }

  return (
    <div className="journey-builder">
      <button className="journey-back" onClick={onBack}>
        <ArrowLeft size={14} /> Back to transfer options
      </button>
      <div className="journey-builder-heading">
        <div>
          <div className="eyebrow">Connected journey</div>
          <h2>Make the day flow naturally.</h2>
          <p>
            Start in Galle, reach Yala for your safari, then add a nearby
            experience if it suits your plans.
          </p>
        </div>
        <span className="simulated-pill">Simulated planning</span>
      </div>

      <div className="journey-timeline">
        <div className="journey-stop">
          <span className="journey-stop-dot done">
            <Check size={12} />
          </span>
          <div>
            <strong>Galle</strong>
            <small>Starting point</small>
          </div>
        </div>
        <span className="journey-line" />
        <div className="journey-stop">
          <span className="journey-stop-dot">
            <CarFront size={13} />
          </span>
          <div>
            <strong>Yala safari</strong>
            <small>{anchorTitle}</small>
          </div>
        </div>
        {recommendation && (
          <>
            <span className="journey-line" />
            <div className="journey-stop">
              <span className="journey-stop-dot">
                <MapPin size={13} />
              </span>
              <div>
                <strong>{recommendation.location}</strong>
                <small>{recommendation.title}</small>
              </div>
            </div>
          </>
        )}
      </div>

      <section className="journey-section">
        <div className="journey-section-heading">
          <div>
            <div className="eyebrow">Step 1 · Add an experience</div>
            <h3>What would you like to do after the safari?</h3>
          </div>
          <span className="journey-optional">Optional</span>
        </div>
        <div className="journey-option-grid">
          {recommendations.map((item) => (
            <button
              className={`journey-option ${recommendationId === item.id ? 'selected' : ''}`}
              key={item.id}
              onClick={() => chooseRecommendation(item.id)}
            >
              <img src={item.image} alt="" />
              <span className="journey-option-check">
                {recommendationId === item.id ? <Check size={12} /> : null}
              </span>
              <div>
                <span className="journey-option-tag">{item.tag}</span>
                <strong>{item.title}</strong>
                <small>
                  {item.duration} · ${item.price} per traveler
                </small>
                <p>{item.detail}</p>
              </div>
            </button>
          ))}
        </div>
        {recommendationId === null && (
          <div className="journey-none">
            <X size={14} /> No additional experience selected. You can continue
            with the safari and transport only.
          </div>
        )}
      </section>

      <section className="journey-section">
        <div className="journey-section-heading">
          <div>
            <div className="eyebrow">Step 2 · Choose each transfer</div>
            <h3>Move between the experiences</h3>
          </div>
          <span className="journey-optional">Change anytime</span>
        </div>
        <div className="journey-transfer-list">
          {transferLegs.map((leg) => (
            <div className="journey-transfer" key={leg.id}>
              <div className="journey-transfer-icon">
                <CarFront size={16} />
              </div>
              <div className="journey-transfer-copy">
                <strong>{leg.title}</strong>
                <span>{leg.detail}</span>
              </div>
              <label className="journey-transfer-select">
                <span>Choose</span>
                <select
                  value={selectedTransfers[leg.id] || ''}
                  onChange={(event) =>
                    setSelectedTransfers((current) => ({
                      ...current,
                      [leg.id]: event.target.value,
                    }))
                  }
                >
                  {leg.options.map((option) => (
                    <option value={option.id} key={option.id}>
                      {option.name} · ${option.price}
                    </option>
                  ))}
                </select>
                <ChevronDown size={13} />
              </label>
            </div>
          ))}
        </div>
        <p className="journey-sim-note">
          Transport is simulated for now. Each leg is priced separately so the
          traveler can change or remove it later.
        </p>
      </section>

      <section className="journey-guide-toggle">
        <label>
          <span className="journey-toggle-icon">
            <UserRound size={16} />
          </span>
          <span>
            <strong>Add a local guide</strong>
            <small>
              Optional · Have someone join the lake or village experience
            </small>
          </span>
          <input
            type="checkbox"
            checked={guide}
            onChange={(event) => setGuide(event.target.checked)}
          />
          <span className="journey-toggle-box">
            {guide ? <Check size={13} /> : null}
          </span>
        </label>
      </section>

      <div className="journey-summary">
        <div>
          <span className="eyebrow">Your flexible plan</span>
          <strong>${total}</strong>
          <small>
            estimated total · {travelers} traveler{travelers === 1 ? '' : 's'}
          </small>
        </div>
        <div className="journey-breakdown">
          <div>
            <span>Yala safari</span>
            <strong>${anchorPrice * travelers}</strong>
          </div>
          {recommendation && (
            <div>
              <span>{recommendation.title}</span>
              <strong>${recommendation.price * travelers}</strong>
            </div>
          )}
          {transfers.map((transfer) => (
            <div key={transfer.legId}>
              <span>
                {transfer.option.name} · {transfer.title}
              </span>
              <strong>${transfer.option.price}</strong>
            </div>
          ))}
          {guide && (
            <div>
              <span>Local guide</span>
              <strong>${guidePrice}</strong>
            </div>
          )}
        </div>
        <button className="button button-primary" onClick={continueWithJourney}>
          Continue with this journey <ArrowRight size={15} />
        </button>
      </div>
      <div className="journey-summary-note">
        <Sparkles size={14} /> You can change or remove any recommendation
        before checkout.
      </div>
    </div>
  )
}
