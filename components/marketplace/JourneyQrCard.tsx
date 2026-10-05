'use client'

import { Check, Copy, Download, QrCode, ShieldCheck, X } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { encodeJourneyPlan, type JourneyPlan } from '@/lib/marketplace/journey'

export function JourneyQrCard({
  plan,
  onClose,
}: {
  plan: JourneyPlan
  onClose: () => void
}) {
  const [dataUrl, setDataUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const payload = encodeJourneyPlan(plan)

  useEffect(() => {
    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 280,
      color: { dark: '#102f36', light: '#ffffff' },
    }).then(setDataUrl)
  }, [payload])

  async function copyPayload() {
    await navigator.clipboard?.writeText(payload)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      className="journey-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <section
        className="journey-qr-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="journey-qr-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="journey-modal-close"
          type="button"
          aria-label="Close QR code"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <div className="journey-qr-heading">
          <span className="journey-qr-icon">
            <QrCode size={22} />
          </span>
          <div>
            <div className="eyebrow">Offline journey pass</div>
            <h2 id="journey-qr-title">Share {plan.name}</h2>
          </div>
        </div>
        <p className="journey-qr-copy">
          One code carries the trip name, day order, selected events and
          completion state. No account or online storage is needed to decode it.
        </p>
        <div className="journey-qr-code">
          {dataUrl ? (
            <img src={dataUrl} alt={`QR code for ${plan.name}`} />
          ) : (
            <div className="journey-qr-loading">Generating code…</div>
          )}
        </div>
        <div className="journey-qr-meta">
          <span>
            <ShieldCheck size={14} /> Scan with any QR reader
          </span>
          <span>
            {plan.days} days · {plan.events.length} events
          </span>
        </div>
        <div className="journey-qr-actions">
          <button
            className="button button-secondary"
            type="button"
            onClick={copyPayload}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}{' '}
            {copied ? 'Copied' : 'Copy code text'}
          </button>
          {dataUrl && (
            <a
              className="button button-primary"
              download={`${plan.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-journey.png`}
              href={dataUrl}
            >
              <Download size={15} /> Save QR image
            </a>
          )}
        </div>
        <code className="journey-qr-payload">{payload}</code>
      </section>
    </div>
  )
}
