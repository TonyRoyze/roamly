'use client'

import { useDemoProfile } from '@/lib/use-demo-profile'

export function AccountGreeting() {
  const profile = useDemoProfile()
  return <h1>{profile ? `Welcome back, ${profile.name.split(' ')[0]}.` : 'Your travel hub.'}</h1>
}
