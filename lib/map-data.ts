import type { DemoUser } from './poc-store'

export const areaCenters: Record<string, [number, number]> = {
  Colombo: [6.914, 79.866],
  Galle: [6.032, 80.218],
  Kandy: [7.291, 80.638],
  Ella: [6.874, 81.047],
}
export const portraits = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop&crop=faces',
]
export const packagePhotos: Record<string, string> = {
  Explore:
    'https://images.unsplash.com/photo-1528127269322-539801943592?w=800&fit=crop&q=85',
  Food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&fit=crop&q=85',
  Nature:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&fit=crop&q=85',
}
// Demo accounts have an area, not a live location. Keep illustrative pins stable across reloads.
export function demoPosition(person: DemoUser): [number, number] {
  const center = areaCenters[person.area] ?? areaCenters.Colombo
  const hash = [...person.id].reduce(
    (sum, character) => (sum * 31 + character.charCodeAt(0)) >>> 0,
    17,
  )
  const angle = ((hash % 360) * Math.PI) / 180
  const radius = 0.004 + ((hash >>> 8) % 100) / 7500
  return [
    center[0] + Math.sin(angle) * radius,
    center[1] + Math.cos(angle) * radius * 0.65,
  ]
}
