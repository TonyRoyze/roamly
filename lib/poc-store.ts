export type DemoRole = 'traveler' | 'local_guide' | 'supplier' | 'advisor' | 'partner' | 'admin'

export interface DemoUser {
  id: string
  name: string
  role: DemoRole
  area: string
  bio?: string
  avatar?: string
  interests?: string
  languages?: string
}

export interface DemoIntent {
  id: string
  travelerId: string
  travelerName: string
  area: string
  message: string
  createdAt: string
  active: boolean
}

export interface DemoPackage {
  id: string
  guideId: string
  title: string
  summary: string
  price: number
  duration?: string
  category?: string
}

export interface DemoOffer {
  id: string
  intentId: string
  guideId: string
  guideName: string
  type: 'profile' | 'package'
  packageId: string | null
  note: string
  createdAt: string
}

export interface DemoMessage {
  id: string
  offerId: string
  senderId: string
  content: string
  packageId?: string
  createdAt: string
}

export interface DemoData {
  users: DemoUser[]
  intents: DemoIntent[]
  packages: DemoPackage[]
  offers: DemoOffer[]
  messages: DemoMessage[]
}

const dataKey = 'roamly-poc-data-v1'
const sessionKey = 'roamly-poc-session-v1'
const changeEvent = 'roamly-poc-change'

export function readDemoData(): DemoData {
  if (typeof window === 'undefined')
    return { users: [], intents: [], packages: [], offers: [], messages: [] }
  try {
    const data = JSON.parse(
      localStorage.getItem(dataKey) ?? '{}',
    ) as Partial<DemoData>
    return {
      users: Array.isArray(data.users) ? data.users : [],
      intents: Array.isArray(data.intents) ? data.intents : [],
      packages: Array.isArray(data.packages) ? data.packages : [],
      offers: Array.isArray(data.offers) ? data.offers : [],
      messages: Array.isArray(data.messages) ? data.messages : [],
    }
  } catch {
    return { users: [], intents: [], packages: [], offers: [], messages: [] }
  }
}

export function updateDemoData(change: (data: DemoData) => DemoData) {
  const next = change(readDemoData())
  localStorage.setItem(dataKey, JSON.stringify(next))
  window.dispatchEvent(new Event(changeEvent))
}

export function subscribeDemoData(listener: () => void) {
  window.addEventListener(changeEvent, listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key === dataKey) listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(changeEvent, listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function readDemoUser(): DemoUser | null {
  try {
    const value = sessionStorage.getItem(sessionKey)
    return value ? (JSON.parse(value) as DemoUser) : null
  } catch {
    return null
  }
}

export function saveDemoUser(user: DemoUser) {
  sessionStorage.setItem(sessionKey, JSON.stringify(user))
  window.dispatchEvent(new Event(changeEvent))
}

export function clearDemoUser() {
  sessionStorage.removeItem(sessionKey)
  window.dispatchEvent(new Event(changeEvent))
}
