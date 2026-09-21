'use client'

import { useState, type FormEvent } from 'react'
import { Compass, LocateFixed, MessageCircle, ShieldCheck } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { getSupabase } from '@/lib/supabase'

type AuthMode = 'sign-in' | 'sign-up'

export function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNotice(null)
    setIsSubmitting(true)

    try {
      const client = getSupabase()

      if (mode === 'sign-in') {
        const { error: signInError } = await client.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      } else {
        const normalizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
        if (normalizedUsername.length < 3) {
          throw new Error('Choose a username with at least 3 letters, numbers, or underscores.')
        }

        const { data, error: signUpError } = await client.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              username: normalizedUsername,
              handle: `@${normalizedUsername}`,
            },
          },
        })

        if (signUpError) throw signUpError
        if (!data.session) {
          setNotice('Check your inbox to confirm your email, then sign in.')
          setMode('sign-in')
        }
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Authentication failed. Try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setError(null)
    setNotice(null)
  }

  return (
    <main className="min-h-screen bg-[#f7f7f3] text-[#172321] lg:grid lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#17362f] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(23,54,47,.3),rgba(23,54,47,.92)),url('https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=85')] bg-cover bg-center" />
        <div className="relative flex items-center gap-2 text-xl font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#ef765d]"><Compass /></span>
          roamly<span className="text-[#ef765d]">.</span>
        </div>
        <div className="relative max-w-xl">
          <h1 className="text-5xl font-semibold leading-[1.04] tracking-[-0.045em]">Find your people, wherever the road takes you.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-white/70">Share your location only when you choose, discover travelers nearby, and make plans in real time.</p>
          <div className="mt-10 flex gap-7 text-sm text-white/75">
            <span className="flex items-center gap-2"><LocateFixed /> Live proximity</span>
            <span className="flex items-center gap-2"><MessageCircle /> Private chat</span>
            <span className="flex items-center gap-2"><ShieldCheck /> Opt-in sharing</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-2 text-xl font-semibold tracking-tight lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#ef765d] text-white"><Compass /></span>
            roamly<span className="text-[#ef765d]">.</span>
          </div>

          <p className="text-sm font-semibold text-[#ef765d]">Travel better together</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
            {mode === 'sign-in' ? 'Welcome back' : 'Create your traveler profile'}
          </h2>
          <p className="mt-2 text-sm text-[#6e7b75]">
            {mode === 'sign-in' ? 'Sign in to find nearby travelers and continue your conversations.' : 'You can change your profile and stop location sharing at any time.'}
          </p>

          <div className="mt-7 grid grid-cols-2 rounded-xl bg-[#ebece7] p-1">
            <Button type="button" variant={mode === 'sign-in' ? 'default' : 'ghost'} className={mode === 'sign-in' ? 'bg-white text-[#172321] shadow-sm hover:bg-white' : ''} onClick={() => switchMode('sign-in')}>Sign in</Button>
            <Button type="button" variant={mode === 'sign-up' ? 'default' : 'ghost'} className={mode === 'sign-up' ? 'bg-white text-[#172321] shadow-sm hover:bg-white' : ''} onClick={() => switchMode('sign-up')}>Create account</Button>
          </div>

          <form className="mt-7" onSubmit={handleSubmit}>
            <FieldGroup>
              {mode === 'sign-up' && (
                <>
                  <Field>
                    <FieldLabel htmlFor="full-name">Full name</FieldLabel>
                    <Input id="full-name" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Alex Morgan" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="username">Username</FieldLabel>
                    <Input id="username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="alex_morgan" minLength={3} required />
                  </Field>
                </>
              )}
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(error)} required />
              </Field>
              <Field data-invalid={Boolean(error)}>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} aria-invalid={Boolean(error)} required />
                {error && <FieldError>{error}</FieldError>}
              </Field>
              <Button type="submit" size="lg" className="h-11 bg-[#172321] text-white hover:bg-[#29413b]" disabled={isSubmitting}>
                {isSubmitting && <Spinner data-icon="inline-start" />}
                {isSubmitting ? 'Please wait' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
              </Button>
            </FieldGroup>
          </form>

          {notice && <Alert className="mt-5 border-[#bcd6c0] bg-[#edf5ed]"><AlertTitle>Email confirmation sent</AlertTitle><AlertDescription>{notice}</AlertDescription></Alert>}
          <p className="mt-7 text-center text-xs leading-5 text-[#89958f]">Location is never requested until you turn on sharing.</p>
        </div>
      </section>
    </main>
  )
}
