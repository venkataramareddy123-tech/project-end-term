import {
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { LoadingScreen } from '@/components/common/loading-screen'
import { FilterSidebar } from '@/components/discover/filter-sidebar'
import { EventCard } from '@/components/discover/event-card'
import { EventMap } from '@/components/discover/event-map'
import { SearchBar } from '@/components/discover/search-bar'
import { Button } from '@/components/ui/button'
import { defaultDiscoveryFilters } from '@/lib/constants'
import { isFreeEvent, matchesDatePreset } from '@/lib/formatters'
import { unique } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useDiscoveryFilters } from '@/hooks/use-discovery-filters'
import { listCommunities } from '@/services/communities'
import { listPublishedEvents, listSavedEvents, toggleSaveEvent } from '@/services/events'
import { queryKeys } from '@/services/query-keys'

export default function DiscoverPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { filters, setFilters } = useDiscoveryFilters()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const deferredQuery = useDeferredValue(filters.query)
  const queryText = useDebouncedValue(deferredQuery, 220)

  const eventsQuery = useQuery({
    queryKey: queryKeys.events.all,
    queryFn: listPublishedEvents,
  })
  const communitiesQuery = useQuery({
    queryKey: queryKeys.communities.all,
    queryFn: listCommunities,
  })
  const savedEventsQuery = useQuery({
    queryKey: queryKeys.events.saved(user?.id ?? 'guest'),
    queryFn: () => listSavedEvents(user!.id),
    enabled: Boolean(user),
  })

  const saveMutation = useMutation({
    mutationFn: (eventId: string) => toggleSaveEvent(user!.id, eventId),
    onSuccess: () => {
      if (!user) return
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.saved(user.id) })
    },
  })

  const availableTags = useMemo(
    () => unique((eventsQuery.data ?? []).flatMap((event) => event.tags)).slice(0, 10),
    [eventsQuery.data],
  )

  const communityById = useMemo(
    () => new Map((communitiesQuery.data ?? []).map((community) => [community.id, community])),
    [communitiesQuery.data],
  )

  const filteredEvents = useMemo(() => {
    const events = eventsQuery.data ?? []

    return events.filter((event) => {
      const matchesQuery =
        !queryText ||
        [event.title, event.summary, event.venue, event.address, event.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(queryText.toLowerCase())

      const matchesCategory = !filters.categories.length || filters.categories.includes(event.category)
      const matchesPrice =
        filters.pricePreset === 'all' ||
        (filters.pricePreset === 'free' ? isFreeEvent(event) : !isFreeEvent(event))
      const matchesTags = !filters.tags.length || filters.tags.every((tag) => event.tags.includes(tag))
      const matchesCity = !filters.city || event.city.toLowerCase().includes(filters.city.toLowerCase())

      return (
        matchesQuery &&
        matchesCategory &&
        matchesPrice &&
        matchesTags &&
        matchesCity &&
        matchesDatePreset(event, filters.datePreset)
      )
    })
  }, [eventsQuery.data, filters, queryText])

  const activeEventId =
    selectedEventId && filteredEvents.some((event) => event.id === selectedEventId)
      ? selectedEventId
      : filteredEvents[0]?.id ?? null

  const savedEventIds = useMemo(
    () => new Set((savedEventsQuery.data ?? []).map((event) => event.id)),
    [savedEventsQuery.data],
  )

  const handleFilterChange = useCallback(
    (nextFilters: typeof filters) => {
      setFilters(nextFilters)
    },
    [setFilters],
  )

  const resetFilters = useCallback(() => {
    setFilters(defaultDiscoveryFilters)
  }, [setFilters])

  const handleToggleSave = useCallback(
    (eventId: string) => {
      if (!user) {
        navigate('/login')
        return
      }

      saveMutation.mutate(eventId)
    },
    [navigate, saveMutation, user],
  )

  if (eventsQuery.isLoading || communitiesQuery.isLoading) {
    return <LoadingScreen title="Curating the map" description="Gathering events, neighborhoods, and community picks." />
  }

  if (eventsQuery.isError || communitiesQuery.isError) {
    return (
      <div className="shell py-14">
        <ErrorState
          title="Discovery couldn’t load"
          description="The event feed or community directory is unavailable right now."
          actionLabel="Try again"
          onAction={() => {
            void eventsQuery.refetch()
            void communitiesQuery.refetch()
          }}
        />
      </div>
    )
  }

  return (
    <div className="shell py-8 sm:py-10">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="space-y-6"
      >
        <div className="space-y-4">
          <div className="eyebrow">Discover</div>
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="space-y-3">
              <h1 className="text-5xl leading-none sm:text-6xl">Explore the city by neighborhood, vibe, and intent.</h1>
              <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                Use a map-first event feed to spot what is happening around you, then save or RSVP before the city
                moves on.
              </p>
            </div>
            <div className="text-sm text-[color:var(--muted)]">
              {filteredEvents.length} event{filteredEvents.length === 1 ? '' : 's'} currently match your filters.
            </div>
          </div>
        </div>

        <SearchBar
          value={filters.query}
          city={filters.city}
          onChange={(nextQuery) => setFilters((current) => ({ ...current, query: nextQuery }))}
          onOpenFilters={() => setFiltersOpen(true)}
        />

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_440px]">
          <div className="hidden xl:block">
            <FilterSidebar
              filters={filters}
              availableTags={availableTags}
              onChange={handleFilterChange}
              onReset={resetFilters}
            />
          </div>

          <div className="space-y-4">
            {filteredEvents.length ? (
              filteredEvents.map((event) => (
                <div key={event.id} onMouseEnter={() => setSelectedEventId(event.id)}>
                  <EventCard
                    event={event}
                    community={communityById.get(event.communityId)}
                    isSaved={savedEventIds.has(event.id)}
                    selected={activeEventId === event.id}
                    onToggleSave={() => handleToggleSave(event.id)}
                  />
                </div>
              ))
            ) : (
              <EmptyState
                title="No events match this mix yet"
                description="Try removing a filter or changing your search terms. CityPulse updates instantly as the filter set changes."
                actionLabel="Reset filters"
                onAction={resetFilters}
              />
            )}
          </div>

          <div className="xl:sticky xl:top-28 xl:h-fit">
            <EventMap
              events={filteredEvents}
              activeEventId={activeEventId}
              onEventSelect={(eventId) => {
                setSelectedEventId(eventId)
                const selected = filteredEvents.find((event) => event.id === eventId)
                if (selected) navigate(`/events/${selected.slug}`)
              }}
            />
          </div>
        </div>
      </motion.section>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 p-4 xl:hidden">
          <div className="mx-auto mt-10 max-w-xl">
            <FilterSidebar
              filters={filters}
              availableTags={availableTags}
              onChange={handleFilterChange}
              onReset={resetFilters}
              mobile
              onClose={() => setFiltersOpen(false)}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-8 xl:hidden">
        <Button variant="outline" className="w-full" onClick={() => setFiltersOpen(true)}>
          Open filters
        </Button>
      </div>
    </div>
  )
}
