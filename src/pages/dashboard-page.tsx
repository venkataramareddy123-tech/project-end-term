import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarRange, Heart, PlusCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/empty-state'
import { EventCard } from '@/components/discover/event-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { listCommunities } from '@/services/communities'
import { listFeaturedEvents, listItinerary, listSavedEvents, listUserEvents } from '@/services/events'
import { queryKeys } from '@/services/query-keys'

function StatCard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="panel p-6">
      <div className="eyebrow">{label}</div>
      <div className="mt-4 text-4xl">{value}</div>
      <p className="mt-2 text-sm text-[color:var(--muted)]">{caption}</p>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  const communitiesQuery = useQuery({
    queryKey: queryKeys.communities.all,
    queryFn: listCommunities,
  })
  const savedEventsQuery = useQuery({
    queryKey: queryKeys.events.saved(user!.id),
    queryFn: () => listSavedEvents(user!.id),
  })
  const itineraryQuery = useQuery({
    queryKey: queryKeys.events.itinerary(user!.id),
    queryFn: () => listItinerary(user!.id),
  })
  const userEventsQuery = useQuery({
    queryKey: queryKeys.events.userCreated(user!.id),
    queryFn: () => listUserEvents(user!.id),
  })
  const recommendationsQuery = useQuery({
    queryKey: queryKeys.events.featured,
    queryFn: () => listFeaturedEvents(2),
  })

  const communityById = useMemo(
    () => new Map((communitiesQuery.data ?? []).map((community) => [community.id, community])),
    [communitiesQuery.data],
  )

  const nextEvent = itineraryQuery.data?.[0] ?? null

  return (
    <div className="space-y-6">
      <div className="hero-mesh panel overflow-hidden p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="space-y-4">
            <div className="eyebrow">Dashboard</div>
            <h1 className="text-5xl leading-none sm:text-6xl">Your city week, in one place.</h1>
            <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
              Track what you saved, what you’re attending, and what you’re hosting without juggling multiple tools.
            </p>
          </div>
          <Link to="/app/events/new">
            <Button size="lg">
              <PlusCircle className="size-4" />
              Create event
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          label="Saved events"
          value={String(savedEventsQuery.data?.length ?? 0)}
          caption="Experiences you wanted to keep on your radar."
        />
        <StatCard
          label="Upcoming RSVPs"
          value={String(itineraryQuery.data?.filter((entry) => entry.rsvpStatus === 'going').length ?? 0)}
          caption="Events you already committed to."
        />
        <StatCard
          label="Hosted by you"
          value={String(userEventsQuery.data?.length ?? 0)}
          caption="Events you can still edit, publish, or manage."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="eyebrow">Next up</div>
                <h2 className="mt-3 text-3xl">Your upcoming rhythm</h2>
              </div>
              <CalendarRange className="size-5 text-[color:var(--accent)]" />
            </div>
            {nextEvent ? (
              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_220px]">
                <div className="space-y-3">
                  <Badge className="bg-[color:var(--teal-soft)] text-[color:var(--teal)]">{nextEvent.rsvpStatus}</Badge>
                  <h3 className="text-3xl">{nextEvent.title}</h3>
                  <p className="text-sm leading-6 text-[color:var(--muted)]">{nextEvent.summary}</p>
                  <Link to={`/events/${nextEvent.slug}`}>
                    <Button variant="outline">Open event</Button>
                  </Link>
                </div>
                <img src={nextEvent.coverImage} alt={nextEvent.title} className="h-48 w-full rounded-[24px] object-cover" />
              </div>
            ) : (
              <div className="mt-5">
                <EmptyState
                  title="Your itinerary is empty"
                  description="RSVP to events so CityPulse can build your week around what you’re actually attending."
                  actionLabel="Discover events"
                  onAction={() => (window.location.href = '/discover')}
                />
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">Recommendations</div>
                <h2 className="mt-3 text-3xl">A couple more good picks</h2>
              </div>
              <Sparkles className="size-5 text-[color:var(--accent)]" />
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {(recommendationsQuery.data ?? []).map((event) => (
                <EventCard key={event.id} event={event} community={communityById.get(event.communityId)} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="eyebrow">Quick links</div>
                <h2 className="mt-3 text-3xl">Jump where you need</h2>
              </div>
              <Heart className="size-5 text-[color:var(--accent)]" />
            </div>
            <div className="mt-5 grid gap-3">
              {[
                { href: '/app/saved', label: 'Open saved events' },
                { href: '/app/itinerary', label: 'Review itinerary' },
                { href: '/app/manage', label: 'Manage your events' },
                { href: '/app/settings', label: 'Edit profile' },
              ].map((item) => (
                <Link key={item.href} to={item.href}>
                  <Button variant="outline" className="w-full justify-start">
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          <div className="panel p-6">
            <div className="eyebrow">Account</div>
            <h2 className="mt-3 text-3xl">{user?.fullName}</h2>
            <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{user?.bio}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
