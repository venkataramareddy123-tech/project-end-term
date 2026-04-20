import { AlertCircle } from 'lucide-react'
import { startTransition, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | undefined)?.from ?? '/app/dashboard'
  const { appMode, isAuthBusy, login, signup } = useAuth()
  const [form, setForm] = useState({
    fullName: '',
    city: 'Bengaluru',
    email: '',
    password: '',
  })
  const [error, setError] = useState('')

  const submitLabel = mode === 'login' ? 'Log in' : 'Create account'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    try {
      if (mode === 'login') {
        await login({
          email: form.email,
          password: form.password,
        })
      } else {
        await signup(form)
      }

      startTransition(() => {
        navigate(redirectTo)
      })
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Something went wrong.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel w-full max-w-xl space-y-6 p-8">
      <div className="space-y-3">
        <div className="eyebrow">{mode === 'login' ? 'Welcome back' : 'Join CityPulse'}</div>
        <div className="space-y-2">
          <h2 className="text-4xl">{mode === 'login' ? 'Sign in to your city rhythm' : 'Build your smarter social calendar'}</h2>
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            {mode === 'login'
              ? 'Access your saved events, RSVP history, and organizer tools.'
              : 'Create an account to save events, RSVP, follow communities, and host your own gatherings.'}
          </p>
        </div>
      </div>

      {mode === 'signup' ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold">
            Full name
            <Input
              value={form.fullName}
              onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
              placeholder="Ava Dsouza"
              required
            />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            City
            <Input
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              placeholder="Bengaluru"
              required
            />
          </label>
        </div>
      ) : null}

      <div className="space-y-4">
        <label className="space-y-2 text-sm font-semibold">
          Email
          <Input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            required
          />
        </label>
        <label className="space-y-2 text-sm font-semibold">
          Password
          <Input
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="••••••••"
            required
          />
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4" />
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      {appMode === 'Demo Mode' ? (
        <div className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--surface-strong)] p-4 text-sm text-[color:var(--muted)]">
          Demo login: <span className="font-semibold text-[color:var(--foreground)]">ava@citypulse.app</span> /{' '}
          <span className="font-semibold text-[color:var(--foreground)]">citypulse123</span>
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isAuthBusy}>
        {isAuthBusy ? 'Please wait...' : submitLabel}
      </Button>

      <p className="text-sm text-[color:var(--muted)]">
        {mode === 'login' ? 'New here?' : 'Already have an account?'}{' '}
        <Link to={mode === 'login' ? '/signup' : '/login'} className="font-semibold text-[color:var(--accent)]">
          {mode === 'login' ? 'Create one now' : 'Log in'}
        </Link>
      </p>
    </form>
  )
}
