'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { CircleAlert, Compass, LocateFixed, LogOut, MessageCircle, Navigation, Radar, ShieldCheck, Users } from 'lucide-react'

import { ChatPanel } from '@/components/chat-panel'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Spinner } from '@/components/ui/spinner'
import {
  fetchNearby,
  fetchProfile,
  setPresence,
  stopSharingLocation,
  upsertLocation,
  type NearbyTraveler,
  type Profile,
} from '@/lib/geo-chat'
import { getSupabase } from '@/lib/supabase'

interface TravelDashboardProps {
  session: Session
}

interface Coordinates {
  latitude: number
  longitude: number
}

type LocationState = 'idle' | 'requesting' | 'sharing' | 'error'

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.max(1, Math.round(meters))} m` : `${(meters / 1000).toFixed(1)} km`
}

function radarPosition(id: string, distanceMeters: number) {
  const hash = [...id].reduce((total, character) => total + character.charCodeAt(0), 0)
  const angle = (hash % 360) * (Math.PI / 180)
  const radius = Math.min(39, 12 + (distanceMeters / 25000) * 28)
  return {
    left: `${50 + Math.cos(angle) * radius}%`,
    top: `${50 + Math.sin(angle) * radius}%`,
  }
}

export function TravelDashboard({ session }: TravelDashboardProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [travelers, setTravelers] = useState<NearbyTraveler[]>([])
  const [locationState, setLocationState] = useState<LocationState>('idle')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)
  const [selectedTraveler, setSelectedTraveler] = useState<NearbyTraveler | null>(null)
  const [chatOpen, setChatOpen] = useState(false)
  const coordinatesRef = useRef<Coordinates | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const lastUploadRef = useRef(0)

  const refreshNearby = useCallback(async (coordinates?: Coordinates) => {
    const current = coordinates ?? coordinatesRef.current
    if (!current) return

    setIsLoadingNearby(true)
    try {
      const nearby = await fetchNearby(current.latitude, current.longitude)
      setTravelers(nearby)
      setLocationError(null)
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Could not refresh nearby travelers.')
    } finally {
      setIsLoadingNearby(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    void fetchProfile(session.user.id)
      .then((data) => { if (active) setProfile(data) })
      .catch((error) => { if (active) setLocationError(error instanceof Error ? error.message : 'Could not load your profile.') })
    void setPresence(true)

    function updateVisibility() {
      void setPresence(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', updateVisibility)

    return () => {
      active = false
      document.removeEventListener('visibilitychange', updateVisibility)
      void setPresence(false)
    }
  }, [session.user.id])

  useEffect(() => {
    const client = getSupabase()
    const channel = client
      .channel('nearby-travelers')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => void refreshNearby())
      .subscribe()
    const refreshTimer = window.setInterval(() => void refreshNearby(), 15_000)

    return () => {
      window.clearInterval(refreshTimer)
      void client.removeChannel(channel)
    }
  }, [refreshNearby])

  useEffect(() => () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
  }, [])

  function startLocationSharing() {
    if (!('geolocation' in navigator)) {
      setLocationState('error')
      setLocationError('This browser does not support location sharing.')
      return
    }

    setLocationState('requesting')
    setLocationError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
        coordinatesRef.current = coordinates
        setLocationState('sharing')

        const now = Date.now()
        if (now - lastUploadRef.current > 10_000) {
          lastUploadRef.current = now
          void upsertLocation({
            ...coordinates,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          }).then(() => refreshNearby(coordinates)).catch((error) => {
            setLocationState('error')
            setLocationError(error instanceof Error ? error.message : 'Could not share your location.')
          })
        }
      },
      (error) => {
        setLocationState('error')
        setLocationError(error.code === error.PERMISSION_DENIED ? 'Location permission was denied. Allow access in your browser settings and try again.' : 'Your location could not be determined. Try again outdoors or check your device settings.')
      },
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 },
    )
  }

  async function stopLocation() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    coordinatesRef.current = null
    setLocationState('idle')
    setTravelers([])
    setLocationError(null)

    try {
      await stopSharingLocation()
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : 'Could not stop location sharing.')
    }
  }

  function openChat(traveler: NearbyTraveler) {
    setSelectedTraveler(traveler)
    setChatOpen(true)
  }

  async function signOut() {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
    await setPresence(false).catch(() => undefined)
    await getSupabase().auth.signOut()
  }

  const displayName = profile?.display_name ?? session.user.user_metadata.full_name ?? 'Traveler'

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-[#172321]">
      <header className="sticky top-0 z-30 border-b border-[#e4e7e1] bg-[#f7f7f3]/95 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-360 items-center justify-between px-5 lg:px-10">
          <a className="flex items-center gap-2 text-xl font-semibold tracking-tight" href="#top">
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#ef765d] text-white"><Compass /></span>
            roamly<span className="text-[#ef765d]">.</span>
          </a>
          <div className="flex items-center gap-3">
            {locationState === 'sharing' && <Badge className="hidden border-0 bg-[#dcebdd] text-[#41684e] sm:flex"><span className="size-1.5 rounded-full bg-[#62b879]" /> Location live</Badge>}
            <div className="flex items-center gap-2 rounded-full border border-[#dfe4de] bg-white py-1.5 pl-1.5 pr-3 shadow-sm">
              <Avatar>
                <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                <AvatarFallback>{initials(displayName)}</AvatarFallback>
                <AvatarBadge className="bg-[#62b879]" />
              </Avatar>
              <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{displayName}</span>
            </div>
            <Button variant="ghost" size="icon-lg" onClick={signOut} aria-label="Sign out"><LogOut /></Button>
          </div>
        </div>
      </header>

      <div id="top" className="mx-auto max-w-360 px-5 pb-16 pt-9 lg:px-10 lg:pt-12">
        <section className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-[#ef765d]">Your travel circle</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">See who’s nearby.<br />Make the next move.</h1>
          </div>
          <div className="flex gap-2">
            {locationState === 'sharing' ? (
              <Button variant="outline" size="lg" className="h-11 border-[#d7ded7] bg-white" onClick={() => void stopLocation()}><ShieldCheck data-icon="inline-start" /> Stop sharing</Button>
            ) : (
              <Button size="lg" className="h-11 bg-[#172321] px-5 text-white hover:bg-[#29413b]" onClick={startLocationSharing} disabled={locationState === 'requesting'}>
                {locationState === 'requesting' ? <Spinner data-icon="inline-start" /> : <LocateFixed data-icon="inline-start" />}
                {locationState === 'requesting' ? 'Finding you' : 'Share my location'}
              </Button>
            )}
          </div>
        </section>

        {locationError && <Alert variant="destructive" className="mb-6 bg-white p-4"><CircleAlert /><AlertTitle>Location unavailable</AlertTitle><AlertDescription>{locationError}</AlertDescription></Alert>}

        <section className="grid min-h-130 gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <div className="relative min-h-105 overflow-hidden rounded-[28px] bg-[#17362f] p-6 text-white sm:p-8">
            <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_center,transparent_0,transparent_24%,white_24.4%,transparent_25%,transparent_49%,white_49.4%,transparent_50%,transparent_74%,white_74.4%,transparent_75%)]" />
            <div className="absolute left-1/2 top-1/2 size-[min(80vw,390px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10">
              <div className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ef765d] ring-8 ring-[#ef765d]/20" />
              {travelers.slice(0, 12).map((traveler) => (
                <button key={traveler.id} style={radarPosition(traveler.id, traveler.distance_meters)} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full outline-none ring-[#ef765d] focus-visible:ring-4" onClick={() => openChat(traveler)} aria-label={`Chat with ${traveler.display_name}`}>
                  <Avatar size="lg" className="ring-4 ring-white/15">
                    <AvatarImage src={traveler.avatar_url ?? undefined} alt={traveler.display_name} />
                    <AvatarFallback className="bg-white text-[#17362f]">{initials(traveler.display_name)}</AvatarFallback>
                    {traveler.is_online && <AvatarBadge className="bg-[#62b879] ring-[#17362f]" />}
                  </Avatar>
                </button>
              ))}
            </div>
            <div className="relative flex items-start justify-between">
              <div><p className="text-sm font-semibold">Live proximity</p><p className="mt-1 text-xs text-white/55">People within 25 km</p></div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/10"><Radar /></span>
            </div>
            {locationState !== 'sharing' && (
              <div className="relative flex h-[calc(100%-64px)] items-center justify-center">
                <div className="max-w-xs text-center"><Navigation className="mx-auto mb-4 size-8 text-[#ef765d]" /><h2 className="text-xl font-semibold">You’re off the radar</h2><p className="mt-2 text-sm leading-6 text-white/60">Turn on sharing to find travelers nearby. Your live location is removed when you stop.</p></div>
              </div>
            )}
            {locationState === 'sharing' && travelers.length === 0 && !isLoadingNearby && (
              <div className="relative flex h-[calc(100%-64px)] items-center justify-center"><p className="max-w-xs text-center text-sm leading-6 text-white/60">No travelers are sharing nearby yet. Keep this tab open and we’ll update the radar live.</p></div>
            )}
          </div>

          <div className="flex min-h-105 flex-col rounded-[28px] border border-[#e1e4dd] bg-white p-5 sm:p-7">
            <div className="flex items-start justify-between">
              <div><div className="flex items-center gap-2"><Users className="text-[#ef765d]" /><h2 className="text-xl font-semibold tracking-[-0.025em]">Travelers nearby</h2></div><p className="mt-2 text-sm text-[#718078]">Only people actively sharing location appear here.</p></div>
              {isLoadingNearby && <Spinner className="text-[#ef765d]" />}
            </div>

            <div className="mt-6 flex flex-1 flex-col gap-2">
              {travelers.map((traveler) => (
                <article key={traveler.id} className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-[#f6f7f3]">
                  <Avatar size="lg">
                    <AvatarImage src={traveler.avatar_url ?? undefined} alt={traveler.display_name} />
                    <AvatarFallback>{initials(traveler.display_name)}</AvatarFallback>
                    {traveler.is_online && <AvatarBadge className="bg-[#62b879]" />}
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2"><h3 className="truncate text-sm font-semibold">{traveler.display_name}</h3><span className="shrink-0 text-xs text-[#9aa49e]">{traveler.handle}</span></div>
                    <p className="mt-0.5 text-xs text-[#718078]">{formatDistance(traveler.distance_meters)} away · {traveler.is_online ? 'Online now' : 'Recently active'}</p>
                    {traveler.interests.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{traveler.interests.slice(0, 3).map((interest) => <Badge key={interest} variant="secondary" className="bg-[#edf2eb] text-[10px] text-[#5e7667]">{interest}</Badge>)}</div>}
                  </div>
                  <Button variant="outline" size="icon-lg" onClick={() => openChat(traveler)} aria-label={`Message ${traveler.display_name}`}><MessageCircle /></Button>
                </article>
              ))}

              {locationState !== 'sharing' && (
                <Empty className="my-auto border-0">
                  <EmptyHeader><EmptyMedia variant="icon"><LocateFixed /></EmptyMedia><EmptyTitle>Share to discover</EmptyTitle><EmptyDescription>Location sharing is opt-in and stops as soon as you turn it off.</EmptyDescription></EmptyHeader>
                  <EmptyContent><Button className="bg-[#172321] text-white" onClick={startLocationSharing}><LocateFixed data-icon="inline-start" /> Share my location</Button></EmptyContent>
                </Empty>
              )}
              {locationState === 'sharing' && travelers.length === 0 && !isLoadingNearby && (
                <Empty className="my-auto border-0"><EmptyHeader><EmptyMedia variant="icon"><Users /></EmptyMedia><EmptyTitle>No one nearby yet</EmptyTitle><EmptyDescription>The list refreshes automatically when another traveler starts sharing.</EmptyDescription></EmptyHeader></Empty>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 rounded-2xl border border-[#dfe5df] bg-[#edf2eb] p-5 text-sm text-[#556a60] sm:grid-cols-3 sm:p-6">
          <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 shrink-0 text-[#41684e]" /><span><strong className="block text-[#294137]">You control visibility</strong>Stop sharing to remove your live location.</span></p>
          <p className="flex items-start gap-2"><Users className="mt-0.5 shrink-0 text-[#41684e]" /><span><strong className="block text-[#294137]">Meet safely</strong>Choose public places and tell someone your plans.</span></p>
          <p className="flex items-start gap-2"><MessageCircle className="mt-0.5 shrink-0 text-[#41684e]" /><span><strong className="block text-[#294137]">Chats stay private</strong>Only conversation participants can read messages.</span></p>
        </section>
      </div>

      <ChatPanel currentUserId={session.user.id} traveler={selectedTraveler} open={chatOpen} onOpenChange={setChatOpen} />
    </main>
  )
}
