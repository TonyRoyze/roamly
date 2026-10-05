import Link from 'next/link'
import { ArrowLeft, Edit3, Eye, MoreHorizontal, Plus } from 'lucide-react'
import { experiences } from '@/lib/marketplace/catalog'
import { PortalLayout, supplierNav } from '@/components/marketplace/Portal'

export default function SupplierProductsPage() {
  return (
    <PortalLayout
      role="Supplier center"
      title="Your experiences"
      subtitle="Create, edit and keep your products ready for travelers."
      nav={supplierNav}
    >
      <div
        className="portal-heading-actions"
        style={{
          marginBottom: 20,
          justifyContent: 'flex-end',
          display: 'flex',
        }}
      >
        <Link href="/supplier/products/new" className="button button-primary">
          <Plus size={16} /> Add experience
        </Link>
      </div>
      <div className="portal-card">
        <div
          className="table-head"
          style={{ gridTemplateColumns: '2fr 110px 110px 90px' }}
        >
          <span>Experience</span>
          <span>Status</span>
          <span>Performance</span>
          <span>Actions</span>
        </div>
        {experiences.slice(0, 4).map((experience) => (
          <div
            className="table-row"
            style={{ gridTemplateColumns: '2fr 110px 110px 90px' }}
            key={experience.id}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <img
                src={experience.image}
                alt=""
                style={{
                  width: 58,
                  height: 45,
                  objectFit: 'cover',
                  borderRadius: 4,
                }}
              />
              <span>
                <strong>{experience.title}</strong>
                <small>
                  {experience.destination} · ${experience.price} from
                </small>
              </span>
            </div>
            <span className="status status-active">Active</span>
            <span>
              <strong>{experience.reviews}</strong>
              <small> {experience.rating} rating</small>
            </span>
            <span style={{ display: 'flex', gap: 10 }}>
              <Eye size={16} />
              <Edit3 size={16} />
              <MoreHorizontal size={16} />
            </span>
          </div>
        ))}
      </div>
    </PortalLayout>
  )
}
