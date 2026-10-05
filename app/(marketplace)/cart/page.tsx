'use client'

import Link from 'next/link'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { experiences } from '@/lib/marketplace/catalog'

export default function CartPage() {
  const [item, setItem] = useState<any>(null)
  useEffect(() => {
    const stored = window.localStorage.getItem('tb-cart-experience')
    setItem(stored ? JSON.parse(stored) : null)
  }, [])
  const fallback = experiences[0]
  return (
    <div className="checkout-page">
      <div className="checkout-inner" style={{ maxWidth: 850 }}>
        <div className="breadcrumb">Your trip / Cart</div>
        <h1 style={{ fontSize: 42, margin: '8px 0 28px' }}>Your trip cart</h1>
        {item ? (
          <div className="checkout-card">
            <div className="summary-item">
              <img src={item.image} alt={item.title} />
              <div style={{ flex: 1 }}>
                <strong>{item.title}</strong>
                <span>
                  {item.selectedOption} · {item.selectedDate} · {item.travelers}{' '}
                  travelers
                </span>
                <span>Free cancellation · Mobile ticket</span>
              </div>
              <strong>${item.price * item.travelers}</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 20,
              }}
            >
              <Link href="/checkout" className="button button-primary">
                Continue to checkout <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <div
            className="checkout-card"
            style={{ textAlign: 'center', padding: '65px 20px' }}
          >
            <ShoppingBag size={35} color="var(--mint-dark)" />
            <h2 style={{ margin: '15px 0 7px' }}>
              Your cart is waiting for a story.
            </h2>
            <p>Explore experiences and save the ones you want to remember.</p>
            <Link
              href={`/experience/${fallback.id}`}
              className="button button-primary"
              style={{ marginTop: 12 }}
            >
              Explore experiences
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
