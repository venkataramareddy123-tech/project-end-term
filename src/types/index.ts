export type UserRole = 'member' | 'organizer'
export type EventStatus = 'published' | 'draft'
export type RsvpStatus = 'going' | 'interested' | 'not_going'
export type EventCategory =
  | 'Arts'
  | 'Food'
  | 'Wellness'
  | 'Music'
  | 'Outdoors'
  | 'Learning'
  | 'Nightlife'
  | 'Family'

export type DiscoveryDatePreset = 'all' | 'today' | 'weekend' | 'week'
export type DiscoveryPricePreset = 'all' | 'free' | 'paid'

export interface UserProfile {
  id: string
  email: string
  fullName: string
  username: string
  bio: string
  avatarUrl: string
  city: string
  role: UserRole
  interests: string[]
  createdAt: string
}

export interface AuthSession {
  user: UserProfile | null
}

export interface Community {
  id: string
  slug: string
  name: string
  description: string
  longDescription: string
  city: string
  vibe: string
  tags: string[]
  coverImage: string
  avatarImage: string
  featured: boolean
  organizerIds: string[]
  eventIds: string[]
  memberCount: number
}

export interface EventRecord {
  id: string
  slug: string
  title: string
  summary: string
  description: string
  category: EventCategory
  tags: string[]
  startAt: string
  endAt: string
  venue: string
  address: string
  city: string
  latitude: number
  longitude: number
  coverImage: string
  gallery: string[]
  priceLabel: string
  capacity: number
  status: EventStatus
  communityId: string
  createdBy: string
  attendees: number
  trendingScore: number
  featured: boolean
}

export interface SavedEvent {
  userId: string
  eventId: string
  createdAt: string
}

export interface RSVPRecord {
  userId: string
  eventId: string
  status: RsvpStatus
  createdAt: string
}

export interface CommunityMembership {
  userId: string
  communityId: string
  createdAt: string
}

export interface EventInput {
  title: string
  summary: string
  description: string
  category: EventCategory
  tags: string[]
  startAt: string
  endAt: string
  venue: string
  address: string
  city: string
  latitude: number
  longitude: number
  coverImage: string
  gallery: string[]
  priceLabel: string
  capacity: number
  status: EventStatus
  communityId: string
}

export interface CommunityInput {
  name: string
  description: string
  longDescription: string
  city: string
  vibe: string
  tags: string[]
  coverImage: string
  avatarImage: string
  featured: boolean
}

export interface DiscoveryFilters {
  query: string
  categories: EventCategory[]
  datePreset: DiscoveryDatePreset
  pricePreset: DiscoveryPricePreset
  city: string
  tags: string[]
}

export interface SignInInput {
  email: string
  password: string
}

export interface SignUpInput extends SignInInput {
  fullName: string
  city: string
}

export interface DemoUserRecord extends UserProfile {
  password: string
}

export interface DemoDatabase {
  users: DemoUserRecord[]
  communities: Community[]
  events: EventRecord[]
  savedEvents: SavedEvent[]
  rsvps: RSVPRecord[]
  memberships: CommunityMembership[]
}
