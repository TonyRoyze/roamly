'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CircleAlert, MapPin, Send } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import {
  fetchMessages,
  markConversationRead,
  sendMessage,
  startConversation,
  subscribeToConversation,
  type ChatMessage,
  type NearbyTraveler,
} from '@/lib/geo-chat'
import { getSupabase } from '@/lib/supabase'

interface ChatPanelProps {
  currentUserId: string
  traveler: NearbyTraveler | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function initials(name: string) {
  return name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(value))
}

export function ChatPanel({ currentUserId, traveler, open, onOpenChange }: ChatPanelProps) {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !traveler) return

    let active = true
    let channel: ReturnType<typeof subscribeToConversation> | null = null

    async function connect() {
      setIsLoading(true)
      setError(null)
      setMessages([])
      setConversationId(null)

      try {
        const id = await startConversation(traveler!.id)
        if (!active) return

        setConversationId(id)
        const history = await fetchMessages(id)
        if (!active) return
        setMessages(history)
        void markConversationRead(id)

        channel = subscribeToConversation(id, (incoming) => {
          if (!active) return
          setMessages((current) => current.some((message) => message.id === incoming.id) ? current : [...current, incoming])
          if (incoming.sender_id !== currentUserId) void markConversationRead(id)
        })
      } catch (connectionError) {
        if (active) setError(connectionError instanceof Error ? connectionError.message : 'Could not open this conversation.')
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void connect()

    return () => {
      active = false
      if (channel) void getSupabase().removeChannel(channel)
    }
  }, [currentUserId, open, traveler])

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' })
  }, [messages])

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!conversationId || !draft.trim() || isSending) return

    const content = draft.trim()
    setDraft('')
    setIsSending(true)
    setError(null)

    try {
      const sent = await sendMessage(conversationId, content)
      setMessages((current) => current.some((message) => message.id === sent.id) ? current : [...current, sent])
    } catch (sendError) {
      setDraft(content)
      setError(sendError instanceof Error ? sendError.message : 'Message not sent. Try again.')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 border-[#dde3dd] bg-white p-0 sm:max-w-md" showCloseButton>
        {traveler && (
          <>
            <SheetHeader className="border-b border-[#edf0ec] px-5 py-4 pr-14">
              <div className="flex items-center gap-3">
                <Avatar size="lg">
                  <AvatarImage src={traveler.avatar_url ?? undefined} alt={traveler.display_name} />
                  <AvatarFallback>{initials(traveler.display_name)}</AvatarFallback>
                  {traveler.is_online && <AvatarBadge className="bg-[#62b879]" />}
                </Avatar>
                <div className="min-w-0">
                  <SheetTitle className="truncate text-[#172321]">{traveler.display_name}</SheetTitle>
                  <SheetDescription className="flex items-center gap-1 text-xs"><MapPin /> {traveler.distance_meters < 1000 ? `${Math.max(1, Math.round(traveler.distance_meters))} m away` : `${(traveler.distance_meters / 1000).toFixed(1)} km away`}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <ScrollArea className="min-h-0 flex-1 bg-[#fafbf9]">
              <div className="flex min-h-full flex-col gap-3 p-5" aria-live="polite">
                {isLoading && <div className="flex flex-1 items-center justify-center"><Spinner className="size-5 text-[#ef765d]" /><span className="sr-only">Loading messages</span></div>}
                {!isLoading && messages.length === 0 && !error && (
                  <Empty className="my-auto border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon"><Send /></EmptyMedia>
                      <EmptyTitle>Start the conversation</EmptyTitle>
                      <EmptyDescription>Say hello and make a plan you’ll both feel comfortable with.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
                {messages.map((message) => {
                  const mine = message.sender_id === currentUserId
                  return (
                    <article key={message.id} className={mine ? 'flex flex-col items-end' : 'flex flex-col items-start'}>
                      <div className={mine ? 'max-w-[82%] rounded-2xl rounded-tr-sm bg-[#ef765d] px-4 py-2.5 text-sm leading-5 text-white' : 'max-w-[82%] rounded-2xl rounded-tl-sm bg-[#e9efea] px-4 py-2.5 text-sm leading-5 text-[#40544a]'}>{message.content}</div>
                      <time className="mt-1 px-1 text-[10px] text-[#98a29c]" dateTime={message.created_at}>{formatMessageTime(message.created_at)}</time>
                    </article>
                  )
                })}
                <div ref={endRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-[#edf0ec] bg-white p-4">
              {error && <Alert variant="destructive" className="mb-3"><CircleAlert /><AlertDescription>{error}</AlertDescription></Alert>}
              <form className="flex items-center gap-2" onSubmit={handleSend}>
                <Input value={draft} onChange={(event) => setDraft(event.target.value)} className="h-10 flex-1 bg-[#fafbf9]" placeholder="Write a message..." aria-label="Message" maxLength={4000} disabled={!conversationId || isLoading} />
                <Button type="submit" size="icon-lg" className="bg-[#172321] text-white hover:bg-[#ef765d]" disabled={!conversationId || !draft.trim() || isSending} aria-label="Send message">
                  {isSending ? <Spinner /> : <Send />}
                </Button>
              </form>
              <p className="mt-2 text-center text-[10px] text-[#9aa49e]">Private chat · Be kind and meet in public places</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
