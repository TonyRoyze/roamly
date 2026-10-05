import { experiences, type Experience } from '@/lib/marketplace/catalog'

export const JOURNEY_PLANS_KEY = 'tb-journey-plans'
export const JOURNEY_CHECKOUT_KEY = 'tb-checkout-plan'
export const JOURNEY_QR_PREFIX = 'TBJ1.'

export type JourneyEvent = {
  id: string
  day: number
  selected: boolean
  status: 'planned' | 'completed'
}

export type JourneyPlan = {
  id: string
  name: string
  days: number
  createdAt: string
  events: JourneyEvent[]
}

type EncodedJourney = {
  v: 1
  n: string
  d: number
  e: [string, number, 0 | 1, 0 | 1][]
}

function createId() {
  return `journey-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function createJourneyPlan(
  name = 'My next adventure',
  eventIds: string[] = [],
): JourneyPlan {
  return {
    id: createId(),
    name,
    days: Math.max(1, eventIds.length),
    createdAt: new Date().toISOString(),
    events: eventIds.map((id, index) => ({
      id,
      day: index + 1,
      selected: true,
      status: 'planned',
    })),
  }
}

export function createDemoJourneyPlan(): JourneyPlan {
  return {
    id: 'journey-sri-lanka-highlights',
    name: 'Sri Lanka highlights',
    days: 3,
    createdAt: '2026-09-30T00:00:00.000Z',
    events: [
      { id: 'colombo-food', day: 1, selected: true, status: 'completed' },
      { id: 'sigiriya-dawn', day: 2, selected: true, status: 'planned' },
      { id: 'yala-safari', day: 3, selected: false, status: 'planned' },
    ],
  }
}

export function getExperienceForJourneyEvent(
  event: JourneyEvent,
): Experience | undefined {
  return experiences.find((experience) => experience.id === event.id)
}

export function encodeJourneyPlan(plan: JourneyPlan): string {
  const compact: EncodedJourney = {
    v: 1,
    n: plan.name.slice(0, 60),
    d: Math.max(1, Math.min(99, Math.round(plan.days))),
    e: plan.events.map((event) => [
      event.id,
      Math.max(1, Math.min(99, Math.round(event.day))),
      event.selected ? 1 : 0,
      event.status === 'completed' ? 1 : 0,
    ]),
  }
  const json = JSON.stringify(compact)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return `${JOURNEY_QR_PREFIX}${btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`
}

export function decodeJourneyPayload(payload: string): JourneyPlan | null {
  try {
    const trimmed = payload.trim()
    if (!trimmed.startsWith(JOURNEY_QR_PREFIX)) return null
    const encoded = trimmed
      .slice(JOURNEY_QR_PREFIX.length)
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    const padded = encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    )
    const data = JSON.parse(new TextDecoder().decode(bytes)) as EncodedJourney
    if (data.v !== 1 || !data.n || !Array.isArray(data.e)) return null
    const events = data.e
      .filter(
        (event) =>
          Array.isArray(event) &&
          typeof event[0] === 'string' &&
          experiences.some((item) => item.id === event[0]),
      )
      .map(
        ([id, day, selected, completed]) =>
          ({
            id,
            day: Math.max(1, Number(day) || 1),
            selected: selected === 1,
            status: completed === 1 ? 'completed' : 'planned',
          }) as JourneyEvent,
      )
    if (!events.length) return null
    return {
      id: createId(),
      name: data.n,
      days: Math.max(1, Number(data.d) || 1),
      createdAt: new Date().toISOString(),
      events,
    }
  } catch {
    return null
  }
}

export function readJourneyPlans(): JourneyPlan[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = window.localStorage.getItem(JOURNEY_PLANS_KEY)
    if (!stored) return [createDemoJourneyPlan()]
    const plans = JSON.parse(stored) as JourneyPlan[]
    return Array.isArray(plans) && plans.length
      ? plans
      : [createDemoJourneyPlan()]
  } catch {
    return [createDemoJourneyPlan()]
  }
}

export function writeJourneyPlans(plans: JourneyPlan[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(JOURNEY_PLANS_KEY, JSON.stringify(plans))
  window.dispatchEvent(new Event('tb-journey-plans-updated'))
}

export function addExperienceToJourneyPlan(
  experienceId: string,
  name = 'My next adventure',
) {
  const plans = readJourneyPlans()
  const nextPlans = plans.length ? [...plans] : [createJourneyPlan(name)]
  const plan = nextPlans[0]
  if (!plan.events.some((event) => event.id === experienceId)) {
    plan.events = [
      ...plan.events,
      {
        id: experienceId,
        day: Math.min(plan.days + 1, 99),
        selected: true,
        status: 'planned',
      },
    ]
    plan.days = Math.max(plan.days, plan.events.length)
  }
  writeJourneyPlans(nextPlans)
  return plan
}
