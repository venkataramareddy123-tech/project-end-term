import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'

export default function ProfileSettingsPage() {
  const { appMode, isAuthBusy, saveProfile, user } = useAuth()
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    fullName: user?.fullName ?? '',
    username: user?.username ?? '',
    city: user?.city ?? '',
    bio: user?.bio ?? '',
    avatarUrl: user?.avatarUrl ?? '',
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    await saveProfile(form)
    setMessage('Profile updated successfully.')
  }

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <div className="eyebrow">Settings</div>
        <h1 className="mt-3 text-5xl leading-none sm:text-6xl">Keep your profile and backend setup in good shape.</h1>
        <p className="mt-4 text-sm text-[color:var(--muted)]">Current mode: {appMode}</p>
      </div>

      <form onSubmit={handleSubmit} className="panel space-y-6 p-8">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold">
            Full name
            <Input value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            Username
            <Input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            City
            <Input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            Avatar URL
            <Input value={form.avatarUrl} onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))} />
          </label>
          <label className="space-y-2 text-sm font-semibold md:col-span-2">
            Bio
            <Textarea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} />
          </label>
        </div>

        {message ? <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div> : null}

        <div className="flex justify-end">
          <Button type="submit" disabled={isAuthBusy}>
            {isAuthBusy ? 'Saving...' : 'Save profile'}
          </Button>
        </div>
      </form>
    </div>
  )
}
