import { isSupabaseConfigured } from '@/lib/env'
import { generateId, slugify } from '@/lib/utils'
import { readDemoStore, writeDemoStore } from '@/services/demo-store'
import { getSupabaseClient } from '@/services/supabase/client'
import type { Community, CommunityInput, CommunityMembership } from '@/types'

type CommunityRow = {
  id: string
  slug: string
  name: string
  description: string
  long_description: string | null
  city: string
  vibe: string | null
  tags: string[] | null
  cover_image: string | null
  avatar_image: string | null
  featured: boolean | null
  organizer_ids: string[] | null
  event_ids: string[] | null
  member_count: number | null
}

function mapCommunityRow(row: CommunityRow): Community {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    longDescription: row.long_description ?? row.description,
    city: row.city,
    vibe: row.vibe ?? '',
    tags: row.tags ?? [],
    coverImage:
      row.cover_image ??
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    avatarImage:
      row.avatar_image ??
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=300&q=80',
    featured: Boolean(row.featured),
    organizerIds: row.organizer_ids ?? [],
    eventIds: row.event_ids ?? [],
    memberCount: row.member_count ?? 0,
  }
}

function readFallbackCommunities() {
  return readDemoStore().communities
}

export async function listCommunities() {
  if (!isSupabaseConfigured) {
    return readFallbackCommunities()
  }

  const client = getSupabaseClient()
  if (!client) return []

  const { data, error } = await client
    .from('communities')
    .select('*')
    .order('featured', { ascending: false })
    .order('member_count', { ascending: false })

  if (error) {
    console.warn('Falling back to demo communities because Supabase content could not be loaded:', error.message)
    return readFallbackCommunities()
  }

  return ((data ?? []) as CommunityRow[]).map(mapCommunityRow)
}

export async function listUserManagedCommunities(userId: string) {
  if (!isSupabaseConfigured) {
    return readDemoStore().communities.filter((community) => community.organizerIds.includes(userId))
  }

  const client = getSupabaseClient()
  if (!client) return []

  const { data, error } = await client
    .from('communities')
    .select('*')
    .contains('organizer_ids', [userId])
    .order('created_at', { ascending: false })

  if (error) {
    console.warn('Falling back to demo managed communities because Supabase content could not be loaded:', error.message)
    return readDemoStore().communities.filter((community) => community.organizerIds.includes(userId))
  }

  return ((data ?? []) as CommunityRow[]).map(mapCommunityRow)
}

export async function listFeaturedCommunities(limit = 3) {
  const communities = await listCommunities()
  return communities
    .sort((left, right) => Number(right.featured) - Number(left.featured) || right.memberCount - left.memberCount)
    .slice(0, limit)
}

export async function getCommunityBySlug(slug: string) {
  if (!isSupabaseConfigured) {
    return readDemoStore().communities.find((community) => community.slug === slug) ?? null
  }

  const client = getSupabaseClient()
  if (!client) return null

  const { data, error } = await client.from('communities').select('*').eq('slug', slug).maybeSingle()
  if (error) {
    console.warn('Falling back to demo community detail because Supabase content could not be loaded:', error.message)
    return readDemoStore().communities.find((community) => community.slug === slug) ?? null
  }

  return data ? mapCommunityRow(data as CommunityRow) : null
}

export async function getCommunityById(id: string) {
  if (!isSupabaseConfigured) {
    return readDemoStore().communities.find((community) => community.id === id) ?? null
  }

  const client = getSupabaseClient()
  if (!client) return null

  const { data, error } = await client.from('communities').select('*').eq('id', id).maybeSingle()
  if (error) {
    console.warn('Falling back to demo community lookup because Supabase content could not be loaded:', error.message)
    return readDemoStore().communities.find((community) => community.id === id) ?? null
  }

  return data ? mapCommunityRow(data as CommunityRow) : null
}

export async function toggleCommunityMembership(userId: string, communityId: string) {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const existing = database.memberships.find(
      (entry) => entry.userId === userId && entry.communityId === communityId,
    )

    database.memberships = existing
      ? database.memberships.filter((entry) => entry !== existing)
      : [
          ...database.memberships,
          { userId, communityId, createdAt: new Date().toISOString() } satisfies CommunityMembership,
        ]

    database.communities = database.communities.map((community) =>
      community.id === communityId
        ? {
            ...community,
            memberCount: existing ? Math.max(0, community.memberCount - 1) : community.memberCount + 1,
          }
        : community,
    )

    writeDemoStore(database)
    return !existing
  }

  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')

  const { data } = await client
    .from('community_memberships')
    .select('community_id')
    .eq('user_id', userId)
    .eq('community_id', communityId)
    .maybeSingle()

  if (data) {
    const { error } = await client
      .from('community_memberships')
      .delete()
      .eq('user_id', userId)
      .eq('community_id', communityId)
    if (error) throw new Error(error.message)
    return false
  }

  const { error } = await client.from('community_memberships').insert({
    user_id: userId,
    community_id: communityId,
  })
  if (error) throw new Error(error.message)
  return true
}

export async function getCommunityMembershipState(userId: string | null, communityId: string) {
  if (!userId) return false

  if (!isSupabaseConfigured) {
    return readDemoStore().memberships.some(
      (entry) => entry.userId === userId && entry.communityId === communityId,
    )
  }

  const client = getSupabaseClient()
  if (!client) return false

  const { data } = await client
    .from('community_memberships')
    .select('community_id')
    .eq('user_id', userId)
    .eq('community_id', communityId)
    .maybeSingle()

  return Boolean(data)
}

export async function createCommunity(userId: string, input: CommunityInput) {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const community: Community = {
      id: generateId('community'),
      slug: slugify(input.name),
      name: input.name,
      description: input.description,
      longDescription: input.longDescription,
      city: input.city,
      vibe: input.vibe,
      tags: input.tags,
      coverImage: input.coverImage,
      avatarImage: input.avatarImage,
      featured: input.featured,
      organizerIds: [userId],
      eventIds: [],
      memberCount: 1,
    }

    database.communities = [community, ...database.communities]
    database.memberships = [
      ...database.memberships.filter(
        (entry) => !(entry.userId === userId && entry.communityId === community.id),
      ),
      {
        userId,
        communityId: community.id,
        createdAt: new Date().toISOString(),
      } satisfies CommunityMembership,
    ]

    writeDemoStore(database)
    return community
  }

  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')

  const payload = {
    slug: slugify(input.name),
    name: input.name,
    description: input.description,
    long_description: input.longDescription,
    city: input.city,
    vibe: input.vibe,
    tags: input.tags,
    cover_image: input.coverImage,
    avatar_image: input.avatarImage,
    featured: input.featured,
    organizer_ids: [userId],
    event_ids: [],
    member_count: 0,
  }

  const { data, error } = await client.from('communities').insert(payload).select('*').single()
  if (error) throw new Error(error.message)

  const community = mapCommunityRow(data as CommunityRow)

  const { error: membershipError } = await client.from('community_memberships').upsert({
    user_id: userId,
    community_id: community.id,
  })

  if (membershipError) {
    throw new Error(membershipError.message)
  }

  return { ...community, memberCount: 1 }
}
