import { NextResponse } from 'next/server'
import { experiences } from '@/lib/marketplace/catalog'

export async function GET(request: Request) {
  const key = request.headers.get('x-api-key')
  if (!key)
    return NextResponse.json(
      { error: 'x-api-key is required' },
      { status: 401 },
    )
  return NextResponse.json({
    data: experiences,
    meta: { apiVersion: 'v1', requestId: crypto.randomUUID() },
  })
}
