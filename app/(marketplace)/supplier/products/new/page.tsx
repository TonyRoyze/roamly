import Link from 'next/link'
import { ArrowLeft, Lightbulb } from 'lucide-react'
import { PortalLayout, supplierNav } from '@/components/marketplace/Portal'

export default function NewProductPage() {
  return (
    <PortalLayout
      role="Supplier center"
      title="Create an experience"
      subtitle="Bring your local expertise to curious travelers."
      nav={supplierNav}
    >
      <div className="product-builder">
        <div className="progress-steps">
          <div className="progress-step active">1. Basics</div>
          <div className="progress-step">2. Itinerary</div>
          <div className="progress-step">3. Pricing</div>
          <div className="progress-step">4. Review</div>
        </div>
        <div className="portal-card">
          <div className="card-topline">
            <div>
              <h3>Tell us about your experience</h3>
              <span className="muted" style={{ fontSize: 11 }}>
                You can save this as a draft at any time.
              </span>
            </div>
            <span className="badge-live">Draft autosaved</span>
          </div>
          <div className="portal-form">
            <div className="field">
              <label>Experience title</label>
              <input placeholder="Give your experience a clear, inspiring name" />
            </div>
            <div className="portal-form-grid">
              <div className="field">
                <label>Category</label>
                <select>
                  <option>Tours & sightseeing</option>
                  <option>Food & drink</option>
                  <option>Wildlife</option>
                  <option>Cultural experiences</option>
                </select>
              </div>
              <div className="field">
                <label>Destination</label>
                <input placeholder="City or region" />
              </div>
            </div>
            <div className="field">
              <label>Short description</label>
              <textarea placeholder="In a few sentences, what will travelers do and why will they love it?" />
            </div>
            <div className="field">
              <label>What makes it special?</label>
              <textarea placeholder="Share three to five highlights travelers can look forward to." />
            </div>
            <div className="notice">
              <Lightbulb
                size={15}
                style={{ verticalAlign: '-3px', marginRight: 7 }}
              />
              <strong>AI product assistant:</strong> Add a few rough notes and
              Travel Buddy will help shape your title, description and
              highlights.
            </div>
            <div className="form-actions">
              <Link
                href="/supplier/products"
                className="button button-secondary"
              >
                Save draft
              </Link>
              <button className="button button-primary">
                Continue to itinerary →
              </button>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  )
}
