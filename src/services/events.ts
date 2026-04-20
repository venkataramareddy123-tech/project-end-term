import { isSupabaseConfigured } from '@/lib/env'
import { formatPriceLabel } from '@/lib/formatters'
import { generateId, slugify } from '@/lib/utils'
import { readDemoStore, writeDemoStore } from '@/services/demo-store'
import { getSupabaseClient } from '@/services/supabase/client'
import type { EventInput, EventRecord, RSVPRecord, RsvpStatus, SavedEvent } from '@/types'

type EventRow = {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  category: EventRecord['category']
  tags: string[] | null
  start_at: string
  end_at: string
  venue: string
  address: string
  city: string
  latitude: number
  longitude: number
  cover_image: string
  gallery: string[] | null
  price_label: string
  capacity: number
  status: EventRecord['status']
  community_id: string
  created_by: string
  attendees: number | null
  trending_score: number | null
  featured: boolean | null
}

function mapEventRow(row: EventRow): EventRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    description: row.description,
    category: row.category,
    tags: row.tags ?? [],
    startAt: row.start_at,
    endAt: row.end_at,
    venue: row.venue,
    address: row.address,
    city: row.city,
    latitude: row.latitude,
    longitude: row.longitude,
    coverImage: row.cover_image,
    gallery: row.gallery ?? [],
    priceLabel: row.price_label,
    capacity: row.capacity,
    status: row.status,
    communityId: row.community_id,
    createdBy: row.created_by,
    attendees: row.attendees ?? 0,
    trendingScore: row.trending_score ?? 0,
    featured: Boolean(row.featured),
  }
}

function toEventPayload(userId: string, input: EventInput, current?: EventRecord) {
  return {
    slug: slugify(input.title),
    title: input.title,
    summary: input.summary,
    description: input.description,
    category: input.category,
    tags: input.tags,
    start_at: input.startAt,
    end_at: input.endAt,
    venue: input.venue,
    address: input.address,
    city: input.city,
    latitude: input.latitude,
    longitude: input.longitude,
    cover_image: input.coverImage,
    gallery: input.gallery,
    price_label: formatPriceLabel(input.priceLabel),
    capacity: input.capacity,
    status: input.status,
    community_id: input.communityId,
    created_by: current?.createdBy ?? userId,
    attendees: current?.attendees ?? 0,
    trending_score: current?.trendingScore ?? 60,
    featured: current?.featured ?? false,
  }
}

function recalculateAttendees(eventId: string) {
  const database = readDemoStore()
  const attendees = database.rsvps.filter((entry) => entry.eventId === eventId && entry.status === 'going').length
  database.events = database.events.map((event) => (event.id === eventId ? { ...event, attendees } : event))
  writeDemoStore(database)
}

function readFallbackPublishedEvents() {
  return readDemoStore().events.filter((event) => event.status === 'published')
}

export async function listPublishedEvents() {
  if (!isSupabaseConfigured) {
    return readFallbackPublishedEvents()
  }

  const client = getSupabaseClient()
  if (!client) return []

  const { data, error } = await client
    .from('events')
    .select('*')
    .eq('status', 'published')
    .order('start_at', { ascending: true })

  if (error) {
    console.warn('Falling back to demo events because Supabase content could not be loaded:', error.message)
    return readFallbackPublishedEvents()
  }

  return ((data ?? []) as EventRow[]).map(mapEventRow)
}

export async function listFeaturedEvents(limit = 3) {
  const events = await listPublishedEvents()
  return events
    .sort((left, right) => Number(right.featured) - Number(left.featured) || right.trendingScore - left.trendingScore)
    .slice(0, limit)
}

export async function getEventBySlug(slug: string) {
  if (!isSupabaseConfigured) {
    return readDemoStore().events.find((event) => event.slug === slug) ?? null
  }

  const client = getSupabaseClient()
  if (!client) return null

  const { data, error } = await client.from('events').select('*').eq('slug', slug).maybeSingle()
  if (error) {
    console.warn('Falling back to demo event detail because Supabase content could not be loaded:', error.message)
    return readDemoStore().events.find((event) => event.slug === slug) ?? null
  }

  return data ? mapEventRow(data as EventRow) : null
}

export async function getEventById(id: string) {
  if (!isSupabaseConfigured) {
    return readDemoStore().events.find((event) => event.id === id) ?? null
  }

  const client = getSupabaseClient()
  if (!client) return null

  const { data, error } = await client.from('events').select('*').eq('id', id).maybeSingle()
  if (error) {
    console.warn('Falling back to demo event lookup because Supabase content could not be loaded:', error.message)
    return readDemoStore().events.find((event) => event.id === id) ?? null
  }

  return data ? mapEventRow(data as EventRow) : null
}

export async function listUserEvents(userId: string) {
  if (!isSupabaseConfigured) {
    return readDemoStore().events.filter((event) => event.createdBy === userId)
  }

  const client = getSupabaseClient()
  if (!client) return []

  const { data, error } = await client.from('events').select('*').eq('created_by', userId).order('start_at')
  if (error) throw new Error(error.message)
  return ((data ?? []) as EventRow[]).map(mapEventRow)
}

export async function createEvent(userId: string, input: EventInput) {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const event: EventRecord = {
      ...input,
      id: generateId('event'),
      slug: slugify(input.title),
      createdBy: userId,
      attendees: 0,
      trendingScore: 60,
      featured: false,
      priceLabel: formatPriceLabel(input.priceLabel),
    }

    database.events = [event, ...database.events]
    database.communities = database.communities.map((community) =>
      community.id === input.communityId
        ? {
            ...community,
            eventIds: [event.id, ...community.eventIds],
          }
        : community,
    )
    writeDemoStore(database)
    return event
  }

  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')

  const payload = toEventPayload(userId, input)
  const { data, error } = await client.from('events').insert(payload).select('*').single()
  if (error) throw new Error(error.message)
  return mapEventRow(data as EventRow)
}

export async function updateEvent(userId: string, eventId: string, input: EventInput) {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const existing = database.events.find((event) => event.id === eventId)

    if (!existing) throw new Error('Event not found.')
    if (existing.createdBy !== userId) throw new Error('You can only edit your own events.')

    const updated: EventRecord = {
      ...existing,
      ...input,
      slug: slugify(input.title),
      priceLabel: formatPriceLabel(input.priceLabel),
    }

    database.events = database.events.map((event) => (event.id === eventId ? updated : event))
    database.communities = database.communities.map((community) => {
      const without = community.eventIds.filter((id) => id !== eventId)

      if (community.id === input.communityId) {
        return { ...community, eventIds: [eventId, ...without] }
      }

      return { ...community, eventIds: without }
    })
    writeDemoStore(database)
    return updated
  }

  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')

  const current = await getEventById(eventId)
  if (!current) throw new Error('Event not found.')
  if (current.createdBy !== userId) throw new Error('You can only edit your own events.')

  const { data, error } = await client
    .from('events')
    .update(toEventPayload(userId, input, current))
    .eq('id', eventId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return mapEventRow(data as EventRow)
}

export async function deleteEvent(userId: string, eventId: string) {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const existing = database.events.find((event) => event.id === eventId)

    if (!existing) throw new Error('Event not found.')
    if (existing.createdBy !== userId) throw new Error('You can only delete your own events.')

    database.events = database.events.filter((event) => event.id !== eventId)
    database.savedEvents = database.savedEvents.filter((entry) => entry.eventId !== eventId)
    database.rsvps = database.rsvps.filter((entry) => entry.eventId !== eventId)
    database.communities = database.communities.map((community) => ({
      ...community,
      eventIds: community.eventIds.filter((id) => id !== eventId),
    }))
    writeDemoStore(database)
    return
  }

  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')

  const current = await getEventById(eventId)
  if (!current) throw new Error('Event not found.')
  if (current.createdBy !== userId) throw new Error('You can only delete your own events.')

  const { error } = await client.from('events').delete().eq('id', eventId)
  if (error) throw new Error(error.message)
}

export async function listSavedEvents(userId: string) {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const savedIds = new Set(database.savedEvents.filter((entry) => entry.userId === userId).map((entry) => entry.eventId))
    return database.events.filter((event) => savedIds.has(event.id))
  }

  const client = getSupabaseClient()
  if (!client) return []

  const { data, error } = await client.from('saved_events').select('event_id').eq('user_id', userId)
  if (error) throw new Error(error.message)

  const savedIds = (data ?? []).map((entry) => entry.event_id)
  if (!savedIds.length) return []

  const { data: events, error: eventsError } = await client.from('events').select('*').in('id', savedIds)
  if (eventsError) throw new Error(eventsError.message)

  return ((events ?? []) as EventRow[]).map(mapEventRow)
}

export async function listItinerary(userId: string): Promise<Array<EventRecord & { rsvpStatus: RsvpStatus }>> {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const rsvps = database.rsvps.filter((entry) => entry.userId === userId)
    return rsvps
      .map((rsvp) => {
        const event = database.events.find((entry) => entry.id === rsvp.eventId)
        return event ? { ...event, rsvpStatus: rsvp.status } : null
      })
      .filter((entry): entry is EventRecord & { rsvpStatus: RsvpStatus } => Boolean(entry))
      .sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime())
  }

  const client = getSupabaseClient()
  if (!client) return []

  const { data, error } = await client.from('rsvps').select('event_id, status').eq('user_id', userId)
  if (error) throw new Error(error.message)

  const eventIds = (data ?? []).map((entry) => entry.event_id)
  if (!eventIds.length) return []

  const { data: events, error: eventsError } = await client.from('events').select('*').in('id', eventIds)
  if (eventsError) throw new Error(eventsError.message)

  const byId = new Map(((events ?? []) as EventRow[]).map((entry) => [entry.id, mapEventRow(entry)]))
  return (data ?? [])
    .map((entry) => {
      const event = byId.get(entry.event_id)
      return event ? { ...event, rsvpStatus: entry.status as RsvpStatus } : null
    })
    .filter((entry): entry is EventRecord & { rsvpStatus: RsvpStatus } => Boolean(entry))
}

export async function getEventEngagement(userId: string | null, eventId: string) {
  if (!userId) {
    return { isSaved: false, rsvpStatus: null as RsvpStatus | null }
  }

  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    return {
      isSaved: database.savedEvents.some((entry) => entry.userId === userId && entry.eventId === eventId),
      rsvpStatus:
        database.rsvps.find((entry) => entry.userId === userId && entry.eventId === eventId)?.status ?? null,
    }
  }

  const client = getSupabaseClient()
  if (!client) return { isSaved: false, rsvpStatus: null }

  const [{ data: saved }, { data: rsvp }] = await Promise.all([
    client.from('saved_events').select('event_id').eq('user_id', userId).eq('event_id', eventId).maybeSingle(),
    client.from('rsvps').select('status').eq('user_id', userId).eq('event_id', eventId).maybeSingle(),
  ])

  return {
    isSaved: Boolean(saved),
    rsvpStatus: (rsvp?.status as RsvpStatus | undefined) ?? null,
  }
}

export async function toggleSaveEvent(userId: string, eventId: string) {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const existing = database.savedEvents.find((entry) => entry.userId === userId && entry.eventId === eventId)

    database.savedEvents = existing
      ? database.savedEvents.filter((entry) => entry !== existing)
      : [...database.savedEvents, { userId, eventId, createdAt: new Date().toISOString() } satisfies SavedEvent]

    writeDemoStore(database)
    return !existing
  }

  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')

  const { data } = await client
    .from('saved_events')
    .select('event_id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .maybeSingle()

  if (data) {
    const { error } = await client.from('saved_events').delete().eq('user_id', userId).eq('event_id', eventId)
    if (error) throw new Error(error.message)
    return false
  }

  const { error } = await client.from('saved_events').insert({ user_id: userId, event_id: eventId })
  if (error) throw new Error(error.message)
  return true
}

export async function setRsvpStatus(userId: string, eventId: string, status: RsvpStatus | null) {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const withoutCurrent = database.rsvps.filter((entry) => !(entry.userId === userId && entry.eventId === eventId))

    database.rsvps = status
      ? [...withoutCurrent, { userId, eventId, status, createdAt: new Date().toISOString() } satisfies RSVPRecord]
      : withoutCurrent

    writeDemoStore(database)
    recalculateAttendees(eventId)
    return status
  }

  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')

  await client.from('rsvps').delete().eq('user_id', userId).eq('event_id', eventId)

  if (status) {
    const { error } = await client.from('rsvps').insert({
      user_id: userId,
      event_id: eventId,
      status,
    })
    if (error) throw new Error(error.message)
  }

  return status
}
