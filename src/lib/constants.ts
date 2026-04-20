import type { DiscoveryFilters, EventCategory } from '@/types'

export const eventCategories: EventCategory[] = [
  'Arts',
  'Food',
  'Wellness',
  'Music',
  'Outdoors',
  'Learning',
  'Nightlife',
  'Family',
]

export const defaultDiscoveryFilters: DiscoveryFilters = {
  query: '',
  categories: [],
  datePreset: 'all',
  pricePreset: 'all',
  city: 'Bengaluru',
  tags: [],
}

export const publicNav = [
  { label: 'Discover', href: '/discover' },
  { label: 'Communities', href: '/communities' },
  { label: 'Dashboard', href: '/app/dashboard' },
]

export const dashboardNav = [
  { label: 'Dashboard', href: '/app/dashboard' },
  { label: 'Saved Events', href: '/app/saved' },
  { label: 'Itinerary', href: '/app/itinerary' },
  { label: 'Create Event', href: '/app/events/new' },
  { label: 'Manage', href: '/app/manage' },
  { label: 'Settings', href: '/app/settings' },
]

export const featurePillars = [
  {
    title: 'Map-first discovery',
    description:
      'Scan what is happening by neighborhood, not by random social-post chance.',
  },
  {
    title: 'Community-powered curation',
    description:
      'Follow local collectives, clubs, and hosts whose vibe matches how you spend your evenings.',
  },
  {
    title: 'A personal event rhythm',
    description:
      'Save the good ones, RSVP in one tap, and keep your week organized in a living itinerary.',
  },
]
