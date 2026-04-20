import { useRef, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { eventCategories } from '@/lib/constants'
import type { Community, EventInput } from '@/types'

const defaultValues: EventInput = {
  title: '',
  summary: '',
  description: '',
  category: 'Arts',
  tags: [],
  startAt: '',
  endAt: '',
  venue: '',
  address: '',
  city: 'Bengaluru',
  latitude: 12.9716,
  longitude: 77.5946,
  coverImage: '',
  gallery: [],
  priceLabel: 'Free',
  capacity: 120,
  status: 'published',
  communityId: '',
}

export function EventForm({
  initialValue,
  communities,
  submitLabel,
  onSubmit,
  isSubmitting,
}: {
  initialValue?: EventInput
  communities: Community[]
  submitLabel: string
  onSubmit: (value: EventInput) => Promise<unknown>
  isSubmitting?: boolean
}) {
  const titleRef = useRef<HTMLInputElement | null>(null)
  const [form, setForm] = useState<EventInput>(initialValue ?? { ...defaultValues, communityId: communities[0]?.id ?? '' })
  const [tagsField, setTagsField] = useState((initialValue?.tags ?? []).join(', '))
  const [galleryField, setGalleryField] = useState((initialValue?.gallery ?? []).join(', '))
  const [error, setError] = useState('')
  const selectedCommunityId = form.communityId || communities[0]?.id || ''

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!form.title || !form.summary || !form.description || !form.coverImage) {
      setError('Title, summary, description, and cover image are required.')
      titleRef.current?.focus()
      return
    }

    const nextForm: EventInput = {
      ...form,
      tags: tagsField
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      gallery: galleryField
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      communityId: form.communityId || communities[0]?.id || '',
    }

    await onSubmit(nextForm)
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-6 p-8">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold md:col-span-2">
          Event title
          <Input
            ref={titleRef}
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="Designers' Supper Club"
          />
        </label>

        <label className="space-y-2 text-sm font-semibold md:col-span-2">
          Summary
          <Input
            value={form.summary}
            onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
            placeholder="A beautifully curated long-table dinner for culture builders."
          />
        </label>

        <label className="space-y-2 text-sm font-semibold md:col-span-2">
          Description
          <Textarea
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Describe the mood, flow, guest experience, and why someone should care."
          />
        </label>

        <label className="space-y-2 text-sm font-semibold">
          Category
          <select
            value={form.category}
            onChange={(event) =>
              setForm((current) => ({ ...current, category: event.target.value as EventInput['category'] }))
            }
            className="h-12 w-full rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[color:var(--accent)]"
          >
            {eventCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-semibold">
          Community
          <select
            value={selectedCommunityId}
            onChange={(event) => setForm((current) => ({ ...current, communityId: event.target.value }))}
            className="h-12 w-full rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[color:var(--accent)]"
          >
            {communities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-semibold">
          Start time
          <Input
            type="datetime-local"
            value={form.startAt}
            onChange={(event) => setForm((current) => ({ ...current, startAt: event.target.value }))}
          />
        </label>
        <label className="space-y-2 text-sm font-semibold">
          End time
          <Input
            type="datetime-local"
            value={form.endAt}
            onChange={(event) => setForm((current) => ({ ...current, endAt: event.target.value }))}
          />
        </label>

        <label className="space-y-2 text-sm font-semibold">
          Venue
          <Input
            value={form.venue}
            onChange={(event) => setForm((current) => ({ ...current, venue: event.target.value }))}
            placeholder="Courtyard 17"
          />
        </label>
        <label className="space-y-2 text-sm font-semibold">
          Address
          <Input
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            placeholder="100 Feet Road, Indiranagar"
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
          Price label
          <Input
            value={form.priceLabel}
            onChange={(event) => setForm((current) => ({ ...current, priceLabel: event.target.value }))}
            placeholder="Free or ₹650"
          />
        </label>

        <label className="space-y-2 text-sm font-semibold">
          Latitude
          <Input
            type="number"
            step="0.0001"
            value={form.latitude}
            onChange={(event) =>
              setForm((current) => ({ ...current, latitude: Number(event.target.value) || 0 }))
            }
          />
        </label>
        <label className="space-y-2 text-sm font-semibold">
          Longitude
          <Input
            type="number"
            step="0.0001"
            value={form.longitude}
            onChange={(event) =>
              setForm((current) => ({ ...current, longitude: Number(event.target.value) || 0 }))
            }
          />
        </label>

        <label className="space-y-2 text-sm font-semibold">
          Capacity
          <Input
            type="number"
            value={form.capacity}
            onChange={(event) =>
              setForm((current) => ({ ...current, capacity: Number(event.target.value) || 0 }))
            }
          />
        </label>

        <label className="space-y-2 text-sm font-semibold">
          Status
          <select
            value={form.status}
            onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as EventInput['status'] }))}
            className="h-12 w-full rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 text-sm outline-none focus:border-[color:var(--accent)]"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
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
          Tags
          <Input value={tagsField} onChange={(event) => setTagsField(event.target.value)} placeholder="Dinner, Networking, Premium" />
        </label>

        <label className="space-y-2 text-sm font-semibold md:col-span-2">
          Gallery image URLs
          <Input
            value={galleryField}
            onChange={(event) => setGalleryField(event.target.value)}
            placeholder="https://image1..., https://image2..."
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
