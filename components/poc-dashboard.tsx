'use client'


import { isNearbyRole } from '@/lib/demo-roles'

import { useMemo, useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Compass,
  Globe2,
  LogOut,
  Map,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Message, MessageContent, MessageFooter } from '@/components/ui/message'
import { Bubble, BubbleContent } from '@/components/ui/bubble'
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller'
import { ExploreMap } from '@/components/explore-map'
import { PersonAvatar, ProfileEditor } from '@/components/profile-editor'
import { PackageCard } from '@/components/package-card'
import { cn } from '@/lib/utils'
import {
  type DemoData,
  type DemoIntent,
  type DemoPackage,
  type DemoUser,
  updateDemoData,
} from '@/lib/poc-store'

type Tab = 'explore' | 'packages' | 'messages' | 'profile'
interface Props {
  user: DemoUser
  data: DemoData
  initialTab?: Tab
  onSwitchUser: () => void
}
function Nothing({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{children}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}

export function PocDashboard({
  user,
  data,
  onSwitchUser,
  initialTab = 'explore',
}: Props) {
  const isGuide = user.role === 'local_guide'
  const [tab, setTab] = useState<Tab>(initialTab)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(initialTab !== 'explore')
  const [editor, setEditor] = useState<
    'profile' | 'request' | 'package' | null
  >(null)
  const [draft, setDraft] = useState('')
  const [chatId, setChatId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [showSendPackages, setShowSendPackages] = useState(false)
  const [sendPackage, setSendPackage] = useState<DemoPackage | null>(null)
  const [notice, setNotice] = useState('')
  const [packageTitle, setPackageTitle] = useState('')
  const [packageSummary, setPackageSummary] = useState('')
  const [packagePrice, setPackagePrice] = useState('')
  const [packageDuration, setPackageDuration] = useState('')
  const [category, setCategory] = useState('Explore')
  const ownIntent = data.intents.find(
    (item) => item.travelerId === user.id && item.active,
  )
  const requests = data.intents.filter(
    (item) =>
      item.active && item.area === user.area && item.travelerId !== user.id,
  )
  const people = useMemo(
    () =>
      data.users.filter(
        (person) =>
          isNearbyRole(person.role) && person.area === user.area &&
          (person.id === user.id ||
            ((filter === 'all' ||
              (filter === 'buddies'
                ? person.role === 'local_guide'
                : person.role === 'traveler')) &&
              `${person.name} ${person.bio} ${person.interests}`
                .toLowerCase()
                .includes(search.toLowerCase()))),
      ),
    [data.users, user.area, user.id, filter, search],
  )
  const nearbyPeople = people.filter((person) => person.id !== user.id)
  const buddies = data.users.filter(
    (person) => person.area === user.area && person.role === 'local_guide',
  )
  const ownPackages = data.packages.filter((item) => item.guideId === user.id)
  const areaPackages = data.packages.filter((item) =>
    buddies.some((buddy) => buddy.id === item.guideId),
  )
  const conversations = data.offers.filter(
    (offer) =>
      offer.guideId === user.id ||
      data.intents.some(
        (intent) =>
          intent.id === offer.intentId && intent.travelerId === user.id,
      ),
  )
  const chat = conversations.find((offer) => offer.id === chatId)
  const chatIntent = data.intents.find((intent) => intent.id === chat?.intentId)
  const chatPerson = data.users.find(
    (person) =>
      person.id === (isGuide ? chatIntent?.travelerId : chat?.guideId),
  )
  const selected = data.users.find((person) => person.id === selectedId)
  const profile = tab === 'profile' ? user : selected
  const selectedRequest = requests.find(
    (request) => request.travelerId === selectedId,
  )
  const messages = data.messages.filter((item) => item.offerId === chatId)

  function go(next: Tab) {
    setTab(next)
    setSelectedId(null)
    setExpanded(next !== 'explore')
    setChatId(null)
    setShowSendPackages(false)
  }
  function viewPerson(id: string) {
    setSelectedId(id)
    setTab('explore')
    setExpanded(true)
  }
  function openChat(id: string) {
    setMessage('')
    setChatId(id)
    setTab('messages')
    setExpanded(true)
    setSelectedId(null)
    setShowSendPackages(false)
  }
  function saveRequest(event: FormEvent) {
    event.preventDefault()
    if (draft.trim().length < 3) return
    updateDemoData((current) => ({
      ...current,
      intents: ownIntent
        ? current.intents.map((item) =>
            item.id === ownIntent.id
              ? { ...item, message: draft.trim() }
              : item,
          )
        : [
            {
              id: crypto.randomUUID(),
              travelerId: user.id,
              travelerName: user.name,
              area: user.area,
              message: draft.trim(),
              active: true,
              createdAt: new Date().toISOString(),
            },
            ...current.intents,
          ],
    }))
    setEditor(null)
    setNotice('Your plan is on the map. Local buddies can now respond.')
    setDraft('')
  }
  function sendOffer(intent: DemoIntent, item?: DemoPackage) {
    if (
      !isGuide ||
      intent.area !== user.area ||
      !intent.active ||
      (item && item.guideId !== user.id)
    )
      return
    const existing = conversations.find(
      (offer) => offer.intentId === intent.id && offer.guideId === user.id,
    )
    const id = existing?.id ?? crypto.randomUUID()
    updateDemoData((current) => ({
      ...current,
      offers: existing
        ? current.offers
        : [
            {
              id,
              intentId: intent.id,
              guideId: user.id,
              guideName: user.name,
              type: item ? 'package' : 'profile',
              packageId: item?.id ?? null,
              note: item
                ? `I thought you’d enjoy ${item.title}.`
                : `Hi ${intent.travelerName.split(' ')[0]}, I’d love to show you around!`,
              createdAt: new Date().toISOString(),
            },
            ...current.offers,
          ],
      messages:
        existing && item
          ? [
              ...current.messages,
              {
                id: crypto.randomUUID(),
                offerId: id,
                senderId: user.id,
                content: 'Here’s an experience for your trip.',
                packageId: item.id,
                createdAt: new Date().toISOString(),
              },
            ]
          : current.messages,
    }))
    setSendPackage(null)
    setNotice(
      item
        ? 'Package sent to your conversation.'
        : 'Your profile introduction has been sent.',
    )
    openChat(id)
  }
  function createPackage(event: FormEvent) {
    event.preventDefault()
    const price = Number(packagePrice)
    if (
      packageTitle.trim().length < 3 ||
      packageSummary.trim().length < 10 ||
      !Number.isFinite(price) ||
      price < 0
    )
      return
    updateDemoData((current) => ({
      ...current,
      packages: [
        {
          id: crypto.randomUUID(),
          guideId: user.id,
          title: packageTitle.trim(),
          summary: packageSummary.trim(),
          price,
          duration: packageDuration.trim(),
          category,
        },
        ...current.packages,
      ],
    }))
    setEditor(null)
    setPackageTitle('')
    setPackageSummary('')
    setPackagePrice('')
    setPackageDuration('')
    setNotice('Package created. Ready to send.')
    go('packages')
  }
  function sendMessage(event: FormEvent) {
    event.preventDefault()
    if (!chat || !message.trim()) return
    updateDemoData((current) => ({
      ...current,
      messages: [
        ...current.messages,
        {
          id: crypto.randomUUID(),
          offerId: chat.id,
          senderId: user.id,
          content: message.trim(),
          createdAt: new Date().toISOString(),
        },
      ],
    }))
    setMessage('')
  }
  function shareInChat(item: DemoPackage) {
    if (!chat || !isGuide || item.guideId !== user.id) return
    updateDemoData((current) => ({
      ...current,
      messages: [
        ...current.messages,
        {
          id: crypto.randomUUID(),
          offerId: chat.id,
          senderId: user.id,
          content: 'Take a look at this experience.',
          packageId: item.id,
          createdAt: new Date().toISOString(),
        },
      ],
    }))
    setShowSendPackages(false)
    setNotice('Package sent.')
  }
  function personRow(person: DemoUser) {
    const request = data.intents.find(
      (item) => item.travelerId === person.id && item.active,
    )
    return (
      <button
        className="person-row"
        key={person.id}
        onClick={() => viewPerson(person.id)}
      >
        <PersonAvatar person={person} />
        <span>
          <strong>
            {person.name}
            <span
              className={
                person.role === 'local_guide' ? 'buddy-dot' : 'traveller-dot'
              }
            />
          </strong>
          <small>
            {request?.message ??
              (person.role === 'local_guide'
                ? person.bio || 'Your next local connection'
                : person.bio || 'Exploring the neighbourhood')}
          </small>
        </span>
        <ChevronRight size={16} />
      </button>
    )
  }
  function packageAction(item: DemoPackage) {
    if (isGuide && item.guideId === user.id) setSendPackage(item)
    else viewPerson(item.guideId)
  }

  return (
    <main className="roam-app">
      <ExploreMap
        area={user.area}
        people={people}
        intents={data.intents}
        userId={user.id}
        selectedId={selectedId ?? undefined}
        onSelect={viewPerson}
      />
      <header className="map-header">
        <button
          className="location-pill"
          aria-label="Change your area"
          onClick={() => setEditor('profile')}
        >
          <MapPin size={16} />
          <span>
            {user.area}
            <span className="location-country">, Sri Lanka</span>
          </span>
          <ChevronDown size={14} />
        </button>
        <button
          className="header-avatar"
          onClick={() => go('profile')}
          aria-label="Open your profile"
        >
          <PersonAvatar person={user} />
        </button>
      </header>
      <div className="map-heading">
        <div className="map-eyebrow">
          <span /> A little closer to your next adventure
        </div>
        <h1>
          Good places.
          <br />
          Even better company.
        </h1>
        <p>Find your people. See their side of {user.area}.</p>
      </div>
      <section
        className={cn(
          'activity-panel',
          expanded && 'panel-expanded',
          chat && 'conversation-panel',
        )}
        aria-label={chat ? 'Conversation' : 'Travel activity'}
      >
        <button
          className="panel-handle"
          onClick={() => setExpanded(!expanded)}
          aria-label={
            expanded ? 'Collapse activity panel' : 'Expand activity panel'
          }
        >
          <span />
        </button>
      <nav className="nearby-tabs" aria-label="Nearby tools">
        {(
          [
            { id: 'explore', label: 'Map', icon: Map },
            { id: 'packages', label: 'Experiences', icon: Compass },
            { id: 'messages', label: 'Messages', icon: MessageCircle },
            { id: 'profile', label: 'Profile', icon: UserRound },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => go(id)}
          >
            <Icon size={21} />
            <span>{label}</span>
            {id === 'messages' && conversations.length > 0 && (
              <i className="dock-count">{conversations.length}</i>
            )}
          </button>
        ))}
      </nav>
        <div className="panel-top">
          <div className="panel-title">
            {(selected || chat) && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Back"
                onClick={() => {
                  setSelectedId(null)
                  setChatId(null)
                }}
              >
                <ArrowLeft />
              </Button>
            )}
            <h2>
              {chat
                ? (chatPerson?.name ?? 'Conversation')
                : profile
                  ? tab === 'profile'
                    ? 'Your profile'
                    : 'Meet your next connection'
                  : tab === 'packages'
                    ? 'Local experiences'
                    : tab === 'messages'
                      ? 'Your conversations'
                      : 'Around you'}
            </h2>
          </div>
          <Button
            className="panel-collapse"
            variant="ghost"
            size="icon"
            aria-label={expanded ? 'Collapse panel' : 'Expand panel'}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronDown /> : <ChevronUp />}
          </Button>
          {!selected && !chat && tab === 'explore' && (
            <span className="count-pill">{nearbyPeople.length} people</span>
          )}
        </div>
        {chat ? (
          <>
            <p className="conversation-context">
              About “{chatIntent?.message ?? 'Your travel plan'}”
            </p>
            <MessageScrollerProvider key={chat.id} autoScroll>
              <MessageScroller>
                <MessageScrollerViewport>
                  <MessageScrollerContent className="p-5">
                    <MessageScrollerItem>
                      <p className="chat-start">
                        Your next adventure starts with hello.
                      </p>
                      {chat.packageId &&
                        (() => {
                          const item = data.packages.find(
                            (p) => p.id === chat.packageId,
                          )
                          return item ? (
                            <PackageCard
                              item={item}
                              buddy={chat.guideName}
                              compact
                            />
                          ) : null
                        })()}
                      {chat.note && (
                        <Message align={isGuide ? 'end' : 'start'}>
                          <MessageContent>
                            <Bubble variant={isGuide ? 'default' : 'secondary'}>
                              <BubbleContent>{chat.note}</BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      )}
                    </MessageScrollerItem>
                    {messages.map((msg) => {
                      const item = data.packages.find(
                        (p) => p.id === msg.packageId,
                      )
                      return (
                        <MessageScrollerItem key={msg.id}>
                          <Message
                            align={msg.senderId === user.id ? 'end' : 'start'}
                          >
                            <MessageContent>
                              {item ? (
                                <PackageCard item={item} compact />
                              ) : (
                                <Bubble
                                  variant={
                                    msg.senderId === user.id
                                      ? 'default'
                                      : 'secondary'
                                  }
                                >
                                  <BubbleContent>{msg.content}</BubbleContent>
                                </Bubble>
                              )}
                              <MessageFooter>
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: '2-digit', minute: '2-digit' },
                                )}
                              </MessageFooter>
                            </MessageContent>
                          </Message>
                        </MessageScrollerItem>
                      )
                    })}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
            {showSendPackages && (
              <div className="chat-package-picker">
                <strong>Send an experience</strong>
                {ownPackages.length ? (
                  ownPackages.map((item) => (
                    <button key={item.id} onClick={() => shareInChat(item)}>
                      <Package size={16} />
                      <span>
                        {item.title}
                        <small>${item.price.toFixed(2)}</small>
                      </span>
                      <Send size={15} />
                    </button>
                  ))
                ) : (
                  <p>Create your first package in Experiences.</p>
                )}
              </div>
            )}
            <form className="chat-compose" onSubmit={sendMessage}>
              {isGuide && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  aria-label="Attach a package"
                  aria-expanded={showSendPackages}
                  onClick={() => setShowSendPackages(!showSendPackages)}
                >
                  <Package />
                </Button>
              )}
              <Input
                aria-label="Message"
                placeholder="Say hello…"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
              />
              <Button
                type="submit"
                size="icon-lg"
                aria-label="Send message"
                disabled={!message.trim()}
              >
                <Send />
              </Button>
            </form>
          </>
        ) : (
          <div className="panel-scroll">
            {profile ? (
              <div className="profile-view">
                <div className="profile-hero">
                  <PersonAvatar person={profile} large />
                  <span className="role-label">
                    {profile.role === 'local_guide'
                      ? 'Local buddy'
                      : 'Traveller'}
                  </span>
                  <h3>{profile.name}</h3>
                  <p>
                    <MapPin size={14} /> {profile.area}, Sri Lanka
                  </p>
                </div>
                <p className="profile-bio">
                  {profile.bio ||
                    'Every great trip starts with a new connection.'}
                </p>
                <div className="profile-tags">
                  {profile.interests
                    ?.split(',')
                    .filter(Boolean)
                    .map((interest) => (
                      <span key={interest}>{interest.trim()}</span>
                    ))}
                </div>
                {profile.languages && (
                  <p className="profile-languages">
                    <Globe2 size={16} /> Speaks {profile.languages}
                  </p>
                )}
                {profile.id === user.id ? (
                  <div className="profile-actions">
                    <Button
                      variant="outline"
                      onClick={() => setEditor('profile')}
                    >
                      <Pencil data-icon="inline-start" /> Edit profile
                    </Button>
                    <Button variant="ghost" onClick={onSwitchUser}>
                      <LogOut data-icon="inline-start" /> Switch user
                    </Button>
                  </div>
                ) : isGuide && selectedRequest ? (
                  <div className="request-detail">
                    <small>Has a plan in {profile.area}</small>
                    <p>“{selectedRequest.message}”</p>
                    <Button onClick={() => sendOffer(selectedRequest)}>
                      <Send data-icon="inline-start" /> Send my profile
                    </Button>
                    <h4>Or send an experience</h4>
                    {ownPackages.length ? (
                      ownPackages.map((item) => (
                        <PackageCard
                          key={item.id}
                          item={item}
                          compact
                          onAction={() => sendOffer(selectedRequest, item)}
                        />
                      ))
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => setEditor('package')}
                      >
                        <Plus /> Create a package
                      </Button>
                    )}
                  </div>
                ) : profile.role === 'traveler' ? (
                  <p className="helper-note">
                    {selectedRequest
                      ? `“${selectedRequest.message}”`
                      : 'No active plan yet.'}
                  </p>
                ) : (
                  <p className="helper-note">
                    Post a plan to let this buddy know what you’d like to
                    explore.
                  </p>
                )}
                {profile.role === 'local_guide' && (
                  <div className="profile-packages">
                    <h4>
                      {profile.id === user.id
                        ? 'Your experiences'
                        : `Explore with ${profile.name.split(' ')[0]}`}
                    </h4>
                    {data.packages
                      .filter((item) => item.guideId === profile.id)
                      .map((item) => (
                        <PackageCard key={item.id} item={item} compact />
                      ))}
                  </div>
                )}
              </div>
            ) : tab === 'explore' ? (
              <>
                <p className="panel-subtitle">
                  A new place feels better with a familiar face.
                </p>
                <div className="people-search">
                  <Search size={17} />
                  <Input
                    aria-label="Search people"
                    placeholder="Find a buddy or an interest"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <ToggleGroup
                  value={[filter]}
                  onValueChange={(value) => {
                    if (value[0]) setFilter(value[0])
                  }}
                  className="people-filters"
                  aria-label="People to show"
                >
                  <ToggleGroupItem value="all">Everyone</ToggleGroupItem>
                  <ToggleGroupItem value="buddies">
                    <Sparkles size={14} /> Local buddies
                  </ToggleGroupItem>
                  <ToggleGroupItem value="travellers">
                    Travellers
                  </ToggleGroupItem>
                </ToggleGroup>
                <div className="people-list">
                  {nearbyPeople.length ? (
                    nearbyPeople.map(personRow)
                  ) : (
                    <Nothing title="Your next connection is on its way">
                      {search
                        ? 'Try another name or interest.'
                        : 'Switch users to create a buddy or traveller in this area.'}
                    </Nothing>
                  )}
                </div>
                {!isGuide && (
                  <div className="plan-prompt">
                    <span className="plan-icon">
                      <MapPin size={21} />
                    </span>
                    <div>
                      <h3>
                        {ownIntent
                          ? 'Your plan is out there'
                          : 'What’s your kind of adventure?'}
                      </h3>
                      <p>
                        {ownIntent?.message ??
                          'Share a plan. Let a local make it special.'}
                      </p>
                    </div>
                    <button
                      aria-label={ownIntent ? 'Edit your plan' : 'Post a plan'}
                      onClick={() => {
                        setDraft(ownIntent?.message ?? '')
                        setEditor('request')
                      }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                )}
                <div className="section-heading">
                  <h3>
                    {isGuide
                      ? 'Plans to be part of'
                      : 'A little local inspiration'}
                  </h3>
                  <button onClick={() => go('packages')}>
                    See all <ArrowUpRight size={14} />
                  </button>
                </div>
                {isGuide ? (
                  requests.length ? (
                    requests.map((request) => (
                      <button
                        className="request-row"
                        key={request.id}
                        onClick={() => viewPerson(request.travelerId)}
                      >
                        <span>“{request.message}”</span>
                        <small>
                          {request.travelerName}
                          <ChevronRight size={14} />
                        </small>
                      </button>
                    ))
                  ) : (
                    <Nothing title="No plans yet">
                      Travellers’ plans in {user.area} will appear here.
                    </Nothing>
                  )
                ) : areaPackages.length ? (
                  <PackageCard
                    item={areaPackages[0]}
                    buddy={
                      data.users.find((p) => p.id === areaPackages[0].guideId)
                        ?.name
                    }
                    action="Meet buddy"
                    onAction={() => viewPerson(areaPackages[0].guideId)}
                  />
                ) : (
                  <Nothing title="Make room for something local">
                    Experiences from buddies in {user.area} will appear here.
                  </Nothing>
                )}
              </>
            ) : tab === 'packages' ? (
              <>
                <p className="panel-subtitle">
                  {isGuide
                    ? 'Your favourite days out, ready to share.'
                    : 'Small adventures. A local by your side.'}
                </p>
                {isGuide && (
                  <Button
                    className="new-package"
                    onClick={() => setEditor('package')}
                  >
                    <Plus /> Create a package
                  </Button>
                )}
                <div className="package-list">
                  {(isGuide ? ownPackages : areaPackages).map((item) => (
                    <PackageCard
                      key={item.id}
                      item={item}
                      buddy={
                        data.users.find((p) => p.id === item.guideId)?.name
                      }
                      action={isGuide ? 'Send package' : 'Meet buddy'}
                      onAction={() => packageAction(item)}
                    />
                  ))}
                  {!(isGuide ? ownPackages : areaPackages).length && (
                    <Nothing title="Your next adventure starts here">
                      {isGuide
                        ? 'Create a package with your itinerary and price, then send it to a traveller in one tap.'
                        : 'Local buddies haven’t added experiences in this area yet.'}
                    </Nothing>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="panel-subtitle">
                  From a quick hello to a plan worth making.
                </p>
                {conversations.map((offer) => {
                  const person = data.users.find(
                    (p) =>
                      p.id ===
                      (isGuide
                        ? data.intents.find((i) => i.id === offer.intentId)
                            ?.travelerId
                        : offer.guideId),
                  )
                  const last = data.messages
                    .filter((m) => m.offerId === offer.id)
                    .at(-1)
                  const item = data.packages.find(
                    (p) => p.id === offer.packageId,
                  )
                  return (
                    <button
                      key={offer.id}
                      className="person-row"
                      onClick={() => openChat(offer.id)}
                    >
                      {person && <PersonAvatar person={person} />}
                      <span>
                        <strong>{person?.name ?? offer.guideName}</strong>
                        <small>
                          {last?.packageId
                            ? 'Shared an experience'
                            : (last?.content ?? item?.title ?? offer.note)}
                        </small>
                      </span>
                      <ChevronRight size={16} />
                    </button>
                  )
                })}
                {!conversations.length && (
                  <Nothing title="A hello goes a long way">
                    {isGuide
                      ? 'Select a traveller’s plan and send your profile or an experience to start talking.'
                      : 'Post a plan. Your buddy introductions and package offers will appear here.'}
                  </Nothing>
                )}
              </>
            )}
          </div>
        )}
        {!chat && (
          <footer className="panel-footer">
            <span className="demo-dot" /> Demo mode{' '}
            <span>Locations are illustrative</span>
          </footer>
        )}
      </section>
      <div className="map-legend">
        <span>
          <i className="buddy-dot" /> Local buddies
        </span>
        <span>
          <i className="traveller-dot" /> Travellers
        </span>
      </div>

      {!isGuide && (
        <Button
          className="floating-plan"
          size="lg"
          onClick={() => {
            setDraft(ownIntent?.message ?? '')
            setEditor('request')
          }}
        >
          <Plus data-icon="inline-start" />
          {ownIntent ? 'Your plan' : 'Post a plan'}
        </Button>
      )}
      {notice && (
        <div className="roam-notice" role="status">
          <Check size={17} />
          <span>{notice}</span>
          <button
            onClick={() => setNotice('')}
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      )}
      <Sheet
        open={editor !== null || sendPackage !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditor(null)
            setSendPackage(null)
          }
        }}
      >
        <SheetContent className="roam-sheet">
          <SheetHeader>
            <SheetTitle>
              {sendPackage
                ? 'Send an experience'
                : editor === 'profile'
                  ? 'Make yourself at home'
                  : editor === 'request'
                    ? 'What do you have in mind?'
                    : 'Create a local experience'}
            </SheetTitle>
            <SheetDescription>
              {sendPackage
                ? `Choose a traveller for “${sendPackage.title}”.`
                : editor === 'profile'
                  ? 'Give your next connection a little introduction.'
                  : editor === 'request'
                    ? `Buddies in ${user.area} can reply with an introduction or a package.`
                    : 'Build it once. Share it whenever the right plan comes along.'}
            </SheetDescription>
          </SheetHeader>
          <div className="sheet-scroll">
            {sendPackage ? (
              requests.length ? (
                requests.map((request) => (
                  <button
                    className="request-row"
                    key={request.id}
                    onClick={() => sendOffer(request, sendPackage)}
                  >
                    <span>{request.travelerName}</span>
                    <small>
                      {request.message}
                      <Send size={16} />
                    </small>
                  </button>
                ))
              ) : (
                <Nothing title="No active traveller plans">
                  When a traveller posts a plan in {user.area}, you can send
                  them this package.
                </Nothing>
              )
            ) : editor === 'profile' ? (
              <ProfileEditor
                key={user.id}
                user={user}
                onSave={() => {
                  setEditor(null)
                  setNotice('Profile saved.')
                }}
              />
            ) : editor === 'request' ? (
              <form className="editor-form" onSubmit={saveRequest}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="travel-plan">Your plan</FieldLabel>
                    <textarea
                      id="travel-plan"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      minLength={3}
                      maxLength={160}
                      required
                      rows={4}
                      placeholder="A sunset walk, the best kottu in town, or a day off the beaten path…"
                    />
                  </Field>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={draft.trim().length < 3}
                  >
                    <Send />
                    {ownIntent ? 'Update plan' : 'Put my plan on the map'}
                  </Button>
                  {ownIntent && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        updateDemoData((current) => ({
                          ...current,
                          intents: current.intents.map((item) =>
                            item.id === ownIntent.id
                              ? { ...item, active: false }
                              : item,
                          ),
                        }))
                        setEditor(null)
                        setNotice('Your plan has been removed from the map.')
                      }}
                    >
                      Remove plan
                    </Button>
                  )}
                </FieldGroup>
              </form>
            ) : (
              <form className="editor-form" onSubmit={createPackage}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="package-title">
                      Experience name
                    </FieldLabel>
                    <Input
                      id="package-title"
                      value={packageTitle}
                      onChange={(e) => setPackageTitle(e.target.value)}
                      minLength={3}
                      maxLength={100}
                      required
                      placeholder="Colombo, one bite at a time"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="package-summary">
                      What’s included?
                    </FieldLabel>
                    <textarea
                      id="package-summary"
                      value={packageSummary}
                      onChange={(e) => setPackageSummary(e.target.value)}
                      minLength={10}
                      maxLength={300}
                      required
                      rows={4}
                      placeholder="Tell travellers what makes this day special…"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="package-price">
                      Price per person (USD)
                    </FieldLabel>
                    <Input
                      id="package-price"
                      type="number"
                      min="0"
                      max="100000"
                      step="0.01"
                      value={packagePrice}
                      onChange={(e) => setPackagePrice(e.target.value)}
                      required
                      placeholder="35.00"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="package-duration">Duration</FieldLabel>
                    <Input
                      id="package-duration"
                      value={packageDuration}
                      onChange={(e) => setPackageDuration(e.target.value)}
                      maxLength={40}
                      required
                      placeholder="3 hours"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="package-category">Category</FieldLabel>
                    <select
                      id="package-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Explore</option>
                      <option>Food</option>
                      <option>Nature</option>
                    </select>
                  </Field>
                  <Button type="submit" size="lg">
                    Create package
                  </Button>
                </FieldGroup>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}
