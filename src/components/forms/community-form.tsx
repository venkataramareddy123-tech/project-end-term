import { useRef, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { CommunityInput } from '@/types'

const defaultValues: CommunityInput = {
  name: '',
  description: '',
  longDescription: '',
  city: 'Bengaluru',
  vibe: '',
  tags: [],
  coverImage: '',
  avatarImage: '',
  featured: false,
}

export function CommunityForm({
  initialValue,
  submitLabel,
  onSubmit,
  isSubmitting,
}: {
  initialValue?: CommunityInput
  submitLabel: string
  onSubmit: (value: CommunityInput) => Promise<unknown>
  isSubmitting?: boolean
}) {
  const nameRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<CommunityInput>(initialValue ?? defaultValues)
  const [tagsField, setTagsField] = useState((initialValue?.tags ?? []).join(', '))
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!form.name || !form.description || !form.longDescription || !form.coverImage || !form.avatarImage) {
      setError('Name, descriptions, cover image, and avatar image are required.')
      nameRef.current?.focus()
      return
    }

    await onSubmit({
      ...form,
      tags: tagsField
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-6 p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold md:col-span-2">
          Community name
          <Input
            ref={nameRef}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Street Stories Club"
          />
        </label>

        <label className="space-y-2 text-sm font-semibold md:col-span-2">
          Short description
          <Input
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Pop-up walks, film nights, and neighborhood storytelling sessions."
          />
        </label>

        <label className="space-y-2 text-sm font-semibold md:col-span-2">
          Long description
          <Textarea
            value={form.longDescription}
            onChange={(event) => setForm((current) => ({ ...current, longDescription: event.target.value }))}
            placeholder="Tell people what this community is about, what it hosts, and why they should follow it."
          />
        </label>

        <label className="space-y-2 text-sm font-semibold">
          City
          <Input
            value={form.city}
            onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
            placeholder="Bengaluru"
          />
        </label>

        <label className="space-y-2 text-sm font-semibold">
          Vibe
          <Input
            value={form.vibe}
            onChange={(event) => setForm((current) => ({ ...current, vibe: event.target.value }))}
            placeholder="Cultural, walkable, and beautifully local"
          />
        </label>

        <label className="space-y-2 text-sm font-semibold md:col-span-2">
          Tags
          <Input value={tagsField} onChange={(event) => setTagsField(event.target.value)} placeholder="Arts, Walks, Film" />
        </label>

        <label className="space-y-2 text-sm font-semibold md:col-span-2">
          Cover image URL
          <Input
            value={form.coverImage}
            onChange={(event) => setForm((current) => ({ ...current, coverImage: event.target.value }))}
            placeholder="https://images.unsplash.com/..."
          />
        </label>

        <label className="space-y-2 text-sm font-semibold md:col-span-2">
          Avatar image URL
          <Input
            value={form.avatarImage}
            onChange={(event) => setForm((current) => ({ ...current, avatarImage: event.target.value }))}
            placeholder="https://images.unsplash.com/..."
          />
        </label>
      </div>

      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
