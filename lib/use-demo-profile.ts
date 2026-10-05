'use client'

import { useEffect, useState } from 'react'
import { readDemoData, readDemoUser, subscribeDemoData, type DemoUser } from '@/lib/poc-store'

/** Reuse Nearby's selected demo identity when entering marketplace routes. */
export function useDemoProfile() {
  const [profile, setProfile] = useState<DemoUser | null>(null)
  useEffect(() => {
    const refresh = () => {
      const selected = readDemoUser()
      setProfile(selected ? readDemoData().users.find((user) => user.id === selected.id) ?? selected : null)
    }
    refresh()
    return subscribeDemoData(refresh)
  }, [])
  return profile
}
