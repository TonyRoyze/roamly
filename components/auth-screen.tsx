'use client'

import { useState, type FormEvent } from 'react'
import { Compass, Plus, Search, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { demoRole, demoRoles } from '@/lib/demo-roles'
import { openSampleTrip } from '@/lib/sample-trip'
import { type DemoRole, type DemoUser } from '@/lib/poc-store'

interface Props {
  users: DemoUser[]
  onCreate: (user: DemoUser) => void
  onCreateMany: (users: DemoUser[]) => void
  onChoose: (user: DemoUser) => void
  onSample: (user: DemoUser) => void
}

const areas = ['Colombo', 'Galle', 'Kandy', 'Ella']

export function AuthScreen({ users, onCreate, onCreateMany, onChoose, onSample }: Props) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<DemoRole>('traveler')
  const [area, setArea] = useState('Colombo')
  const [bio, setBio] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim()
    if (cleanName.length < 2) { setError('Enter a name with at least 2 characters.'); return }
    const user: DemoUser = { id: crypto.randomUUID(), name: cleanName, role, area, bio: bio.trim() }
    onCreate(user)
    setName(''); setBio(''); setError(null)
  }

  const matchingUsers = users.filter((user) => `${user.name} ${user.area} ${demoRole(user.role).label}`.toLowerCase().includes(search.toLowerCase()))

  function generateUsers() {
    const offset = users.length
    const generated = Array.from({ length: 10 }, (_, index): DemoUser => {
      const role = demoRoles[index % demoRoles.length].role
      return {
        id: crypto.randomUUID(),
        name: `${demoRole(role).label} ${offset + index + 1}`,
        role,
        area: areas[Math.floor(index / 2) % areas.length],
        bio: role === 'local_guide' ? 'Happy to help visitors explore the area.' : '',
      }
    })
    onCreateMany(generated)
  }

  return (
    <main className="min-h-screen bg-[#f5f8fc] text-[#172321] lg:grid lg:grid-cols-[.9fr_1.1fr]">
      <section className="relative flex min-h-72 flex-col justify-between overflow-hidden bg-[#253c4b] p-7 text-white sm:p-10 lg:min-h-screen">
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(23,54,47,.3),rgba(23,54,47,.94)),url('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85')] bg-cover bg-center" />
        <div className="relative flex items-center gap-2 text-xl font-semibold tracking-tight"><span className="flex size-9 items-center justify-center rounded-xl bg-[#2266e2]"><Compass /></span>travelbuddy<span className="text-[#2266e2]">.</span></div>
        <div className="relative mt-16 max-w-xl lg:mt-0"><h1 className="text-4xl font-semibold leading-tight tracking-[-.045em] sm:text-5xl">Good places. Even better company.</h1><p className="mt-5 max-w-md text-base leading-7 text-white/75">Find your people on the map. Share a plan, meet a local buddy, and make a little room for adventure.</p><div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm"><Users className="size-4" /> POC mode · no email or password</div></div>
      </section>

      <section className="mx-auto flex w-full max-w-2xl flex-col justify-center px-5 py-10 sm:px-10 lg:py-14">
        <h2 className="text-3xl font-semibold tracking-tight">Your next adventure starts here</h2>
        <p className="mt-2 text-sm text-[#718078]">Test users and their activity stay in this browser. Open another tab to try different roles at once.</p>

        <Button size="lg" className="mt-6 h-12" onClick={() => onSample(openSampleTrip())}><Compass /> Explore a sample trip</Button><p className="mt-2 text-center text-xs text-muted-foreground">Try the map with sample profiles and experiences, or create your own below.</p>

        <form onSubmit={create} className="mt-7 rounded-[24px] border border-[#e1e4dd] bg-white p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="group" aria-label="Test user role">
            {demoRoles.map((item) => <Button key={item.role} type="button" variant="outline" aria-pressed={role === item.role} onClick={() => setRole(item.role)} className={role === item.role ? 'border-[#253c4b] bg-[#edf3fa]' : ''}>{item.label}</Button>)}
          </div>
          <p className="mt-3 text-sm text-[#718078]" aria-live="polite">{demoRole(role).description}</p>
          <label htmlFor="demo-name" className="mt-5 block text-sm font-medium">Display name</label><Input id="demo-name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={60} required placeholder={role === 'traveler' ? 'e.g. Maya' : 'e.g. Nimal'} className="mt-2 h-11" />
          <label htmlFor="demo-area" className="mt-4 block text-sm font-medium">Demo area</label><select id="demo-area" value={area} onChange={(event) => setArea(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-[#dfe4de] bg-white px-3 text-sm">{areas.map((item) => <option key={item}>{item}</option>)}</select>
          {role === 'local_guide' && <><label htmlFor="demo-bio" className="mt-4 block text-sm font-medium">Short introduction</label><Input id="demo-bio" value={bio} onChange={(event) => setBio(event.target.value)} maxLength={160} placeholder="I know the best walks and food spots..." className="mt-2 h-11" /></>}
          {error && <p role="alert" className="mt-3 text-sm text-[#a43d29]">{error}</p>}
          <Button type="submit" className="mt-5 h-11 w-full bg-[#253c4b] text-white hover:bg-[#315571]"><Plus /> Create test user</Button>
        </form>

        <div className="mt-9"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-semibold">Test users</h3><span className="text-sm text-[#718078]">{users.length} created</span></div><Button type="button" size="sm" variant="outline" onClick={generateUsers}><Plus /> Generate 10 users</Button></div>
          {users.length > 5 && <div className="relative mt-3"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#718078]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a test user" aria-label="Find a test user" className="pl-9" /></div>}
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">{matchingUsers.length === 0 ? <p className="rounded-xl bg-[#edf3fa] p-4 text-sm text-[#718078]">{users.length === 0 ? 'Create your first test user above.' : 'No users match that search.'}</p> : matchingUsers.map((user) => <button key={user.id} type="button" onClick={() => onChoose(user)} className="flex w-full items-center gap-3 rounded-xl border border-[#e1e4dd] bg-white p-3 text-left hover:border-[#2266e2] focus-visible:outline-2 focus-visible:outline-[#2266e2]"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#edf3fa] font-semibold text-[#41684e]">{user.name.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{user.name}</span><span className="text-xs text-[#718078]">{demoRole(user.role).label} · {user.area}</span></span><span className="text-xs font-medium text-[#41684e]">Enter</span></button>)}</div>
        </div>
      </section>
    </main>
  )
}
