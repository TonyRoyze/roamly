import { NextResponse } from 'next/server'
import { z } from 'zod'

const bookingSchema = z.object({
  experienceId: z.string(),
  optionName: z.string(),
  date: z.string(),
  startTime: z.string(),
  travelers: z.number().int().positive(),
  total: z.number().positive(),
  paymentMode: z.enum(['PAY_NOW', 'PAY_LATER']).default('PAY_NOW'),
})

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Invalid booking details', details: parsed.error.flatten() },
      { status: 400 },
    )
  const reference = `TB-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  return NextResponse.json(
    {
      data: {
        reference,
        status:
          parsed.data.paymentMode === 'PAY_LATER' ? 'RESERVED' : 'CONFIRMED',
        paymentStatus:
          parsed.data.paymentMode === 'PAY_LATER' ? 'RESERVED' : 'PAID',
        voucher: { qrPayload: `travelbuddy://${reference}`, issued: true },
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 },
  )
}

export async function GET() {
  return NextResponse.json({
    data: [
      {
        reference: 'TB-7K4M2',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        experience: 'Colombo Street Food Night',
        date: '2026-10-18',
        total: 84,
        currency: 'USD',
      },
    ],
  })
}
