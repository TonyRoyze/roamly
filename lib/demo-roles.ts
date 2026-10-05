import type { DemoRole } from '@/lib/poc-store'

export const demoRoles = [
  { role: 'traveler', label: 'Traveller', description: 'Discover experiences and plan your next trip.', home: '/account' },
  { role: 'local_guide', label: 'Local buddy', description: 'Meet nearby travellers and share your packages.', home: '/nearby' },
  { role: 'supplier', label: 'Supplier', description: 'Manage experiences, products, and bookings.', home: '/supplier' },
  { role: 'advisor', label: 'Advisor', description: 'Plan experiences and bookings for your clients.', home: '/advisor' },
  { role: 'partner', label: 'Partner', description: 'Explore referrals, affiliate links, and commissions.', home: '/partner' },
  { role: 'admin', label: 'Admin', description: 'Explore the Travel Buddy administration console.', home: '/admin' },
] satisfies { role: DemoRole; label: string; description: string; home: string }[]

export function demoRole(role: DemoRole) {
  return demoRoles.find((item) => item.role === role) ?? demoRoles[0]
}

export function isNearbyRole(role: DemoRole) {
  return role === 'traveler' || role === 'local_guide'
}
