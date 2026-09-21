import type { RealtimeChannel } from '@supabase/supabase-js'

import { getSupabase } from './supabase'

export interface Profile {
  id: string
  username: string
  display_name: string
  handle: string
  avatar_url: string | null
  bio: string | null
  interests: string[]
  is_online: boolean
  last_seen_at: string
}

export interface NearbyTraveler extends Profile {
  distance_meters: number
  location_updated_at: string
}

export interface LocationInput {
  latitude: number
  longitude: number
  accuracy?: number | null
  heading?: number | null
  speed?: number | null
}

export async function fetchProfile(profileId: string) {
  const { data, error } = await getSupabase()
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single<Profile>()

  if (error) throw error
  return data
}

export async function fetchNearby(
  latitude: number,
  longitude: number,
  radiusMeters = 25000,
) {
  const { data, error } = await getSupabase()
    .rpc('nearby_travelers', {
      lat: latitude,
      lng: longitude,
      radius_meters: radiusMeters,
    })
    .returns<NearbyTraveler[]>()

  if (error) throw error
  return (data ?? []) as NearbyTraveler[]
}

export async function upsertLocation(location: LocationInput) {
  const client = getSupabase()
  const { data } = await client.auth.getUser()
  if (!data.user) throw new Error('You must be signed in to share your location.')

  const { error } = await client.from('locations').upsert({
    profile_id: data.user.id,
    point: `POINT(${location.longitude} ${location.latitude})`,
    accuracy: location.accuracy ?? null,
    heading: location.heading ?? null,
    speed: location.speed ?? null,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function stopSharingLocation() {
  const client = getSupabase()
  const { data } = await client.auth.getUser()
  if (!data.user) return

  const { error } = await client.from('locations').delete().eq('profile_id', data.user.id)
  if (error) throw error
}

export async function setPresence(isOnline: boolean) {
  const client = getSupabase()
  const { data } = await client.auth.getUser()
  if (!data.user) return

  const { error } = await client
    .from('profiles')
    .update({ is_online: isOnline, last_seen_at: new Date().toISOString() })
    .eq('id', data.user.id)

  if (error) throw error
}

export interface ChatMessage {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
  read_at: string | null
}

export async function fetchMessages(conversationId: string) {
  const { data, error } = await getSupabase()
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200)
    .returns<ChatMessage[]>()

  if (error) throw error
  return data ?? []
}

export function subscribeToConversation(
  conversationId: string,
  onInsert: (message: ChatMessage) => void,
): RealtimeChannel {
  return getSupabase()
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload.new as ChatMessage),
    )
    .subscribe()
}

export async function sendMessage(conversationId: string, content: string) {
  const client = getSupabase()
  const { data } = await client.auth.getUser()
  if (!data.user) throw new Error('You must be signed in to send a message.')

  const trimmedContent = content.trim()
  if (!trimmedContent) throw new Error('Write a message first.')

  const { data: message, error } = await client
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: data.user.id,
      content: trimmedContent,
    })
    .select()
    .single<ChatMessage>()

  if (error) throw error
  return message
}

export async function startConversation(profileId: string) {
  const { data, error } = await getSupabase().rpc('start_direct_conversation', {
    other_profile_id: profileId,
  })

  if (error) throw error
  if (!data) throw new Error('The conversation could not be created.')
  return data as string
}

export async function markConversationRead(conversationId: string) {
  const client = getSupabase()
  const { data } = await client.auth.getUser()
  if (!data.user) return

  const { error } = await client
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', data.user.id)
    .is('read_at', null)

  if (error) throw error
}
