'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { portraits } from '@/lib/map-data'
import { saveDemoUser, updateDemoData, type DemoUser } from '@/lib/poc-store'

export function PersonAvatar({
  person,
  large = false,
}: {
  person: DemoUser
  large?: boolean
}) {
  return (
    <Avatar className={large ? 'size-20' : 'size-11'}>
      <AvatarImage src={person.avatar} alt={person.name} />
      <AvatarFallback>{person.name.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  )
}

export function ProfileEditor({
  user,
  onSave,
}: {
  user: DemoUser
  onSave: () => void
}) {
  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio ?? '')
  const [interests, setInterests] = useState(user.interests ?? '')
  const [languages, setLanguages] = useState(user.languages ?? '')
  const [avatar, setAvatar] = useState(user.avatar ?? '')
  const [area, setArea] = useState(user.area)
  function save(event: FormEvent) {
    event.preventDefault()
    if (name.trim().length < 2) return
    const next = {
      ...user,
      name: name.trim(),
      bio: bio.trim(),
      interests: interests.trim(),
      languages: languages.trim(),
      avatar,
      area,
    }
    updateDemoData((current) => ({
      ...current,
      users: current.users.map((person) =>
        person.id === user.id ? next : person,
      ),
      intents: current.intents.map((intent) =>
        intent.travelerId === user.id
          ? { ...intent, travelerName: next.name, area }
          : intent,
      ),
      offers: current.offers.map((offer) =>
        offer.guideId === user.id ? { ...offer, guideName: next.name } : offer,
      ),
    }))
    saveDemoUser(next)
    onSave()
  }
  return (
    <form onSubmit={save} className="editor-form">
      <FieldGroup>
        <Field>
          <FieldLabel>Profile picture</FieldLabel>
          <div className="portrait-options">
            {['', ...portraits].map((photo, index) => (
              <button
                key={photo}
                type="button"
                aria-label={index ? `Use portrait ${index}` : 'Use initials'}
                aria-pressed={avatar === photo}
                onClick={() => setAvatar(photo)}
              >
                <PersonAvatar person={{ ...user, avatar: photo }} />
              </button>
            ))}
          </div>
          <p className="muted text-xs">
            Choose a demo portrait or use your initials.
          </p>
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-name">Display name</FieldLabel>
          <Input
            id="profile-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            minLength={2}
            maxLength={60}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-area">Your area</FieldLabel>
          <select
            id="profile-area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          >
            {Object.keys({ Colombo: 1, Galle: 1, Kandy: 1, Ella: 1 }).map(
              (place) => (
                <option key={place}>{place}</option>
              ),
            )}
          </select>
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-bio">A little about you</FieldLabel>
          <textarea
            id="profile-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Your travel style, favourite places, or what you can show a traveller…"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-interests">Interests</FieldLabel>
          <Input
            id="profile-interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            maxLength={150}
            placeholder="Food, hiking, photography"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="profile-languages">Languages</FieldLabel>
          <Input
            id="profile-languages"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            maxLength={100}
            placeholder="English, Sinhala"
          />
        </Field>
        <Button type="submit" size="lg">
          Save profile
        </Button>
      </FieldGroup>
    </form>
  )
}
