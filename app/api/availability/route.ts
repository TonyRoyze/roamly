import { NextResponse } from 'next/server'
import { getExperience } from '@/lib/marketplace/catalog'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const experience = getExperience(searchParams.get('experienceId') || '')
  if (!experience)
    return NextResponse.json({ error: 'Experience not found' }, { status: 404 })
  const option =
    experience.options[Number(searchParams.get('option') || 0)] ||
    experience.options[0]
  return NextResponse.json({
    data: {
      experienceId: experience.id,
      option: option.name,
      date: searchParams.get('date') || new Date().toISOString().slice(0, 10),
      slots: option.times.map((time) => ({
        time,
        remaining: Math.floor(option.capacity || 12) - 2,
        status: 'AVAILABLE',
      })),
    },
  })
}
