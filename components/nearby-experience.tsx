'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import { useRouter } from 'next/navigation'
import { demoRole, isNearbyRole } from '@/lib/demo-roles'
import { ProfileEditor } from '@/components/profile-editor'
import { PocDashboard } from '@/components/poc-dashboard'
import {
  clearDemoUser,
  readDemoData,
  readDemoUser,
  subscribeDemoData,
  type DemoData,
  type DemoUser,
} from '@/lib/poc-store'

export default function NearbyExperience({
  initialTab = 'explore',
}: {
  initialTab?: 'explore' | 'packages' | 'messages' | 'profile'
}) {
  const router = useRouter()
  const loginPath = `/login?next=${encodeURIComponent(initialTab === 'explore' ? '/nearby' : `/nearby?tab=${initialTab}`)}`
  const [data, setData] = useState<DemoData | null>(null)
  const [user, setUser] = useState<DemoUser | null>(null)

  useEffect(() => {
    const refresh = () => {
      setData(readDemoData())
      const selected = readDemoUser()
      setUser(selected)
      if (!selected) router.replace(loginPath)
    }
    refresh()
    return subscribeDemoData(refresh)
  }, [router, loginPath])

  function switchUser() {
    clearDemoUser()
    router.replace(loginPath)
  }

  if (!data) return <main className="min-h-screen bg-[#f7f7f3]" />
  if (!user) return <main className="min-h-screen bg-[#f7f7f3]" aria-label="Opening login" />
  const currentUser = data.users.find((person) => person.id === user.id) ?? user
  if (!isNearbyRole(currentUser.role)) return (
    <main className="mx-auto min-h-screen max-w-xl space-y-5 px-6 py-12">
      <Link href="/">← Travel Buddy</Link>
      <h1 className="text-3xl font-semibold">{currentUser.name}</h1>
      <p>{demoRole(currentUser.role).label} account</p>
      <div className="flex flex-wrap gap-5">
        <Link href={demoRole(currentUser.role).home}>Open your workspace</Link>
        <button onClick={switchUser} className="underline">Switch user</button>
      </div>
      {initialTab === 'profile' ? <ProfileEditor user={currentUser} onSave={() => router.push(demoRole(currentUser.role).home)} /> : <p>Choose a traveller or local buddy profile to join the nearby map.</p>}
    </main>
  )
  return <PocDashboard key={initialTab} initialTab={initialTab} user={currentUser} data={data} onSwitchUser={switchUser} />
}
