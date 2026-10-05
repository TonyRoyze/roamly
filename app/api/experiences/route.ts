import { NextResponse } from 'next/server'
import { experiences } from '@/lib/marketplace/catalog'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').toLowerCase()
  const category = searchParams.get('category')
  const data = experiences.filter(
    (experience) =>
      (!q ||
        `${experience.title} ${experience.destination} ${experience.category} ${experience.supplier}`
          .toLowerCase()
          .includes(q)) &&
      (!category || experience.category === category),
  )
  return NextResponse.json({
    data,
    meta: {
      total: data.length,
      currency: 'USD',
      source: 'Travel Buddy local catalog',
    },
  })
}
