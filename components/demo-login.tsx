'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthScreen } from '@/components/auth-screen'
import { demoRole, isNearbyRole } from '@/lib/demo-roles'
import { readDemoData, saveDemoUser, subscribeDemoData, updateDemoData, type DemoUser } from '@/lib/poc-store'

export function DemoLogin({ next }: { next?: string }) {
  const router = useRouter()
  const [users, setUsers] = useState<DemoUser[] | null>(null)
  useEffect(() => {
    const refresh = () => setUsers(readDemoData().users)
    refresh()
    return subscribeDemoData(refresh)
  }, [])
  function choose(user: DemoUser, sample = false) {
    saveDemoUser(user)
    // Only accept known map destinations; never forward arbitrary redirect URLs.
    const mapDestination = next && ['/nearby', '/nearby?tab=profile', '/nearby?tab=packages', '/nearby?tab=messages'].includes(next) ? next : null
    router.replace(sample ? '/nearby' : mapDestination && isNearbyRole(user.role) ? mapDestination : demoRole(user.role).home)
  }
  if (!users) return <main className="min-h-screen bg-[#f5f8fc]" aria-label="Loading login" />
  return <>
    <Link href="/" className="nearby-back-link">← Back to Travel Buddy</Link>
    <AuthScreen users={users} onChoose={choose} onSample={(user) => choose(user, true)} onCreate={(user) => {
      updateDemoData((data) => ({ ...data, users: [...data.users, user] }))
      choose(user)
    }} onCreateMany={(created) => updateDemoData((data) => ({ ...data, users: [...data.users, ...created] }))} />
  </>
}
