'use client'

import Link from 'next/link'
import {
  Camera,
  Check,
  ClipboardPaste,
  QrCode,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'
import {
  decodeJourneyPayload,
  readJourneyPlans,
  writeJourneyPlans,
  type JourneyPlan,
} from '@/lib/marketplace/journey'

export function JourneyScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [payload, setPayload] = useState('')
  const [preview, setPreview] = useState<JourneyPlan | null>(null)
  const [error, setError] = useState('')
  const [imported, setImported] = useState(false)

  useEffect(
    () => () => {
      scannerRef.current?.stop().catch(() => undefined)
    },
    [],
  )

  function readPayload(value: string) {
    setPayload(value)
    const decoded = decodeJourneyPayload(value)
    setPreview(decoded)
    setError(
      value && !decoded
        ? 'That code is not a Travel Buddy journey bundle.'
        : '',
    )
    setImported(false)
  }

  async function stopCamera() {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => undefined)
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setCameraActive(false)
  }

  async function startCamera() {
    setError('')
    try {
      const cameras = await Html5Qrcode.getCameras()
      if (!cameras.length) throw new Error('No camera found')
      const scanner = new Html5Qrcode('journey-reader')
      scannerRef.current = scanner
      await scanner.start(
        cameras[0].id,
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (value) => {
          readPayload(value)
          stopCamera()
        },
        () => undefined,
      )
      setCameraActive(true)
    } catch {
      setError(
        'Camera access is unavailable here. Paste the decoded code text instead.',
      )
      setCameraActive(false)
    }
  }

  function importJourney() {
    if (!preview) return
    const existing = readJourneyPlans()
    writeJourneyPlans([
      preview,
      ...existing.filter((plan) => plan.name !== preview.name),
    ])
    setImported(true)
  }

  return (
    <div className="journey-scanner-page">
      <div className="journey-scanner-inner">
        <Link className="journey-back-link" href="/wishlist">
          ← Back to trip plans
        </Link>
        <div className="journey-scanner-hero">
          <div>
            <div className="eyebrow">Offline journey scanner</div>
            <h1>Bring a whole trip with you.</h1>
            <p>
              Scan a Travel Buddy QR code to import the journey, review each
              event, reorder the days, and decide what to book.
            </p>
          </div>
          <div className="journey-scanner-hero-icon">
            <QrCode size={42} />
          </div>
        </div>
        <div className="journey-scanner-grid">
          <section className="journey-scanner-card">
            <div className="journey-scanner-card-head">
              <div>
                <span className="journey-step-number">1</span>
                <div>
                  <h2>Scan the journey QR</h2>
                  <p>
                    Camera scanning happens locally. No trip data is uploaded.
                  </p>
                </div>
              </div>
              {cameraActive && (
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={stopCamera}
                >
                  <X size={15} /> Stop camera
                </button>
              )}
            </div>
            <div
              id="journey-reader"
              className={`journey-reader ${cameraActive ? 'active' : ''}`}
            />
            {!cameraActive && (
              <button
                className="journey-camera-button"
                type="button"
                onClick={startCamera}
              >
                <Camera size={19} />
                <strong>Open camera scanner</strong>
                <span>Point it at a Travel Buddy journey code</span>
              </button>
            )}
            <div className="journey-paste-divider">
              <span>or use decoded text</span>
            </div>
            <label className="journey-payload-label">
              Journey code <span>Paste the text from any QR reader</span>
            </label>
            <textarea
              value={payload}
              onChange={(event) => readPayload(event.target.value)}
              placeholder="TBJ1.eyJ2IjoxLCJuIjoi..."
              rows={4}
            />
            <button
              className="button button-secondary"
              type="button"
              onClick={() => navigator.clipboard?.readText().then(readPayload)}
            >
              <ClipboardPaste size={15} /> Paste from clipboard
            </button>
            {error && (
              <div className="journey-scanner-error">
                <X size={15} /> {error}
              </div>
            )}
          </section>
          <aside className="journey-scanner-card journey-scan-preview">
            <div className="journey-scanner-card-head">
              <div>
                <span className="journey-step-number">2</span>
                <div>
                  <h2>Review and import</h2>
                  <p>Nothing is added until you confirm.</p>
                </div>
              </div>
            </div>
            {preview ? (
              <>
                <div className="journey-import-preview">
                  <div className="journey-preview-kicker">
                    <Sparkles size={14} /> Travel Buddy journey
                  </div>
                  <h3>{preview.name}</h3>
                  <p>
                    {preview.days} days · {preview.events.length} events ·{' '}
                    {preview.events.filter((event) => event.selected).length}{' '}
                    selected
                  </p>
                  <div className="journey-preview-list">
                    {preview.events.slice(0, 5).map((event) => (
                      <div key={event.id}>
                        <span>Day {event.day}</span>
                        <strong>{event.id.replaceAll('-', ' ')}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                {imported ? (
                  <div className="journey-imported">
                    <Check size={16} /> Imported to your trip plans{' '}
                    <Link href="/wishlist">Open plans</Link>
                  </div>
                ) : (
                  <button
                    className="button button-primary button-wide"
                    type="button"
                    onClick={importJourney}
                  >
                    <ShieldCheck size={16} /> Import this journey
                  </button>
                )}
              </>
            ) : (
              <div className="journey-preview-empty">
                <QrCode size={36} />
                <strong>Your journey preview will appear here.</strong>
                <span>Scan or paste a code to continue.</span>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
