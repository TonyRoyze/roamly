import { NextResponse } from 'next/server'
import { getExperience } from '@/lib/marketplace/catalog'

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const experience = getExperience((await params).id)
  return experience
    ? NextResponse.json({ data: experience })
    : NextResponse.json({ error: 'Experience not found' }, { status: 404 })
}
