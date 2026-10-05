import { Download, Search } from 'lucide-react'
import {
  DashboardTable,
  PortalLayout,
  supplierNav,
} from '@/components/marketplace/Portal'

export default function SupplierBookingsPage() {
  return (
    <PortalLayout
      role="Supplier center"
      title="Bookings"
      subtitle="Keep every guest touchpoint clear and effortless."
      nav={supplierNav}
    >
      <div className="portal-card">
        <div className="card-topline">
          <div
            className="search-field"
            style={{
              border: '1px solid var(--line)',
              borderRadius: 4,
              maxWidth: 310,
              padding: '7px 11px',
            }}
          >
            <Search size={15} />
            <input placeholder="Search by name or reference" />
          </div>
          <button className="button button-secondary">
            <Download size={15} /> Export
          </button>
        </div>
        <DashboardTable
          rows={[
            {
              id: 'TB-7K4M2',
              title: 'Colombo Street Food Night',
              meta: 'Maya Chen · Oct 18, 2026 · 2 adults',
              status: 'Confirmed',
              amount: '$84',
            },
            {
              id: 'TB-7J91P',
              title: 'Sigiriya Rock at Sunrise',
              meta: 'David Miller · Oct 19, 2026 · 4 adults',
              status: 'Confirmed',
              amount: '$272',
            },
            {
              id: 'TB-7H31A',
              title: 'Colombo Street Food Night',
              meta: 'Anika Patel · Oct 20, 2026 · 3 adults',
              status: 'Pending',
              amount: '$126',
            },
            {
              id: 'TB-7G88L',
              title: 'Galle Fort History Walk',
              meta: 'Liam Wong · Oct 21, 2026 · 2 adults',
              status: 'Confirmed',
              amount: '$68',
            },
            {
              id: 'TB-7F71Z',
              title: 'Colombo Street Food Night',
              meta: 'Sofia Rossi · Oct 22, 2026 · 2 adults',
              status: 'Canceled',
              amount: '$84',
            },
          ]}
        />
      </div>
    </PortalLayout>
  )
}
