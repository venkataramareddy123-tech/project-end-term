export const queryKeys = {
  events: {
    all: ['events'] as const,
    featured: ['events', 'featured'] as const,
    detail: (slug: string) => ['events', 'detail', slug] as const,
    byId: (id: string) => ['events', 'id', id] as const,
    saved: (userId: string) => ['events', 'saved', userId] as const,
    itinerary: (userId: string) => ['events', 'itinerary', userId] as const,
    userCreated: (userId: string) => ['events', 'user-created', userId] as const,
    engagement: (userId: string, eventId: string) => ['events', 'engagement', userId, eventId] as const,
  },
  communities: {
    all: ['communities'] as const,
    featured: ['communities', 'featured'] as const,
    detail: (slug: string) => ['communities', 'detail', slug] as const,
    managed: (userId: string) => ['communities', 'managed', userId] as const,
    membership: (userId: string, communityId: string) =>
      ['communities', 'membership', userId, communityId] as const,
  },
}
