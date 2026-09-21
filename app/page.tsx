'use client'

import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AlertTriangle, Compass } from 'lucide-react'

import { AuthScreen } from '@/components/auth-screen'
import { TravelDashboard } from '@/components/travel-dashboard'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setIsLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setIsLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f7f3] p-6 text-[#172321]">
        <div className="w-full max-w-lg">
          <div className="mb-7 flex items-center gap-2 text-xl font-semibold"><span className="flex size-9 items-center justify-center rounded-xl bg-[#ef765d] text-white"><Compass /></span>roamly<span className="text-[#ef765d]">.</span></div>
          <Alert className="border-[#e0c8a8] bg-white p-5">
            <AlertTriangle />
            <AlertTitle>Connect Supabase to continue</AlertTitle>
            <AlertDescription>Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`, then apply `supabase/migrations/0001_geo_chat.sql` to your Supabase project.</AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  if (isLoading) {
    return <main className="flex min-h-screen items-center justify-center bg-[#f7f7f3]"><Spinner className="size-6 text-[#ef765d]" /><span className="sr-only">Loading session</span></main>
  }

  return session ? <TravelDashboard session={session} /> : <AuthScreen />
}
