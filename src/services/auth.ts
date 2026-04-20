import type { Session, SupabaseClient } from '@supabase/supabase-js'

import { isSupabaseConfigured } from '@/lib/env'
import { createUsername, generateId } from '@/lib/utils'
import { getDemoSessionUserId, readDemoStore, setDemoSessionUserId, writeDemoStore } from '@/services/demo-store'
import { getSupabaseClient } from '@/services/supabase/client'
import type { AuthSession, DemoUserRecord, SignInInput, SignUpInput, UserProfile } from '@/types'

function toPublicUser(user: DemoUserRecord): UserProfile {
  const { password, ...rest } = user
  void password
  return rest
}

function buildFallbackProfile(session: Session): UserProfile {
  const email = session.user.email ?? 'member@citypulse.app'

  return {
    id: session.user.id,
    email,
    fullName: String(session.user.user_metadata.full_name ?? email.split('@')[0] ?? 'CityPulse Member'),
    username: String(session.user.user_metadata.username ?? createUsername(email.split('@')[0] ?? 'member')),
    bio: String(session.user.user_metadata.bio ?? 'New to CityPulse and discovering the city one event at a time.'),
    avatarUrl: String(
      session.user.user_metadata.avatar_url ??
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    ),
    city: String(session.user.user_metadata.city ?? 'Bengaluru'),
    role: 'member',
    interests: Array.isArray(session.user.user_metadata.interests)
      ? session.user.user_metadata.interests
      : [],
    createdAt: session.user.created_at ?? new Date().toISOString(),
  }
}

async function upsertSupabaseProfile(client: SupabaseClient, profile: UserProfile) {
  await client.from('profiles').upsert({
    id: profile.id,
    email: profile.email,
    full_name: profile.fullName,
    username: profile.username,
    bio: profile.bio,
    avatar_url: profile.avatarUrl,
    city: profile.city,
    role: profile.role,
    interests: profile.interests,
    created_at: profile.createdAt,
  })
}

async function readSupabaseProfile(client: SupabaseClient, session: Session): Promise<UserProfile> {
  const { data, error } = await client.from('profiles').select('*').eq('id', session.user.id).maybeSingle()

  if (error || !data) {
    const fallback = buildFallbackProfile(session)
    await upsertSupabaseProfile(client, fallback)
    return fallback
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    username: data.username,
    bio: data.bio ?? '',
    avatarUrl:
      data.avatar_url ??
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
    city: data.city ?? 'Bengaluru',
    role: data.role ?? 'member',
    interests: Array.isArray(data.interests) ? data.interests : [],
    createdAt: data.created_at ?? session.user.created_at ?? new Date().toISOString(),
  }
}

export async function getSession(): Promise<AuthSession> {
  if (!isSupabaseConfigured) {
    const userId = getDemoSessionUserId()
    if (!userId) return { user: null }

    const user = readDemoStore().users.find((entry) => entry.id === userId)
    return { user: user ? toPublicUser(user) : null }
  }

  const client = getSupabaseClient()
  if (!client) return { user: null }

  const { data, error } = await client.auth.getSession()
  if (error || !data.session) return { user: null }

  return { user: await readSupabaseProfile(client, data.session) }
}

export async function signIn(input: SignInInput): Promise<AuthSession> {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const user = database.users.find(
      (entry) => entry.email.toLowerCase() === input.email.toLowerCase() && entry.password === input.password,
    )

    if (!user) {
      throw new Error('Invalid credentials. Try ava@citypulse.app / citypulse123 in demo mode.')
    }

    setDemoSessionUserId(user.id)
    return { user: toPublicUser(user) }
  }

  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')

  const { error } = await client.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return getSession()
}

export async function signUp(input: SignUpInput): Promise<AuthSession> {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    const existingUser = database.users.find((entry) => entry.email.toLowerCase() === input.email.toLowerCase())

    if (existingUser) {
      throw new Error('An account with that email already exists.')
    }

    const newUser: DemoUserRecord = {
      id: generateId('user'),
      email: input.email,
      password: input.password,
      fullName: input.fullName,
      username: createUsername(input.fullName),
      bio: 'New to CityPulse and ready to build a better social calendar.',
      avatarUrl:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
      city: input.city,
      role: 'member',
      interests: [],
      createdAt: new Date().toISOString(),
    }

    database.users = [newUser, ...database.users]
    writeDemoStore(database)
    setDemoSessionUserId(newUser.id)

    return { user: toPublicUser(newUser) }
  }

  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')

  const { data, error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
        city: input.city,
      },
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data.user) {
    await upsertSupabaseProfile(client, {
      id: data.user.id,
      email: data.user.email ?? input.email,
      fullName: input.fullName,
      username: createUsername(input.fullName),
      bio: 'New to CityPulse and ready to build a better social calendar.',
      avatarUrl:
        'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
      city: input.city,
      role: 'member',
      interests: [],
      createdAt: data.user.created_at ?? new Date().toISOString(),
    })
  }

  return getSession()
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    setDemoSessionUserId(null)
    return
  }

  const client = getSupabaseClient()
  await client?.auth.signOut()
}

export async function updateProfile(userId: string, input: Partial<UserProfile>) {
  if (!isSupabaseConfigured) {
    const database = readDemoStore()
    database.users = database.users.map((entry) =>
      entry.id === userId
        ? {
            ...entry,
            ...input,
          }
        : entry,
    )
    writeDemoStore(database)

    const updated = database.users.find((entry) => entry.id === userId)
    if (!updated) {
      throw new Error('Profile not found.')
    }

    return toPublicUser(updated)
  }

  const client = getSupabaseClient()
  if (!client) throw new Error('Supabase is not configured.')

  const existing = await getSession()
  if (!existing.user) {
    throw new Error('No authenticated user found.')
  }

  const nextProfile = {
    ...existing.user,
    ...input,
    id: userId,
  }

  await upsertSupabaseProfile(client, nextProfile)
  return nextProfile
}

export function subscribeToAuthChanges(callback: () => Promise<void> | void) {
  if (!isSupabaseConfigured) {
    return () => undefined
  }

  const client = getSupabaseClient()
  if (!client) return () => undefined

  const subscription = client.auth.onAuthStateChange(() => {
    void callback()
  })

  return () => {
    subscription.data.subscription.unsubscribe()
  }
}
