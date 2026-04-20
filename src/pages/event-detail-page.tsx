import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, MapPin, Users } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ErrorState } from '@/components/common/error-state'
import { LoadingScreen } from '@/components/common/loading-screen'
import { EventMap } from '@/components/discover/event-map'
import { RsvpPanel } from '@/components/events/rsvp-panel'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatEventWindow } from '@/lib/formatters'
import { useAuth } from '@/hooks/use-auth'
import { getCommunityById } from '@/services/communities'
import { getEventBySlug, getEventEngagement, setRsvpStatus, toggleSaveEvent } from '@/services/events'
import { queryKeys } from '@/services/query-keys'

export default function EventDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const eventQuery = useQuery({
    queryKey: queryKeys.events.detail(slug),
    queryFn: () => getEventBySlug(slug),
    enabled: Boolean(slug),
  })

  const communityQuery = useQuery({
    queryKey: ['communities', 'id', eventQuery.data?.communityId],
    queryFn: () => getCommunityById(eventQuery.data!.communityId),
    enabled: Boolean(eventQuery.data?.communityId),
  })

  const engagementQuery = useQuery({
    queryKey: queryKeys.events.engagement(user?.id ?? 'guest', eventQuery.data?.id ?? slug),
    queryFn: () => getEventEngagement(user?.id ?? null, eventQuery.data!.id),
    enabled: Boolean(eventQuery.data?.id),
  })

  const saveMutation = useMutation({
    mutationFn: () => toggleSaveEvent(user!.id, eventQuery.data!.id),
    onSuccess: () => {
      if (!user || !eventQuery.data) return
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.saved(user.id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.engagement(user.id, eventQuery.data.id) })
    },
  })

  const rsvpMutation = useMutation({
    mutationFn: (status: 'going' | 'interested' | 'not_going' | null) =>
      setRsvpStatus(user!.id, eventQuery.data!.id, status === 'not_going' ? null : status),
    onSuccess: () => {
      if (!eventQuery.data) return
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(slug) })
      if (user) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.events.itinerary(user.id) })
        void queryClient.invalidateQueries({ queryKey: queryKeys.events.engagement(user.id, eventQuery.data.id) })
      }
    },
  })

  const gallery = useMemo(
    () => [eventQuery.data?.coverImage, ...(eventQuery.data?.gallery ?? [])].filter(Boolean) as string[],
    [eventQuery.data?.coverImage, eventQuery.data?.gallery],
  )

  if (eventQuery.isLoading) {
    return <LoadingScreen title="Loading the event" description="Bringing together the details, host, and RSVP options." />
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <div className="shell py-14">
        <ErrorState
          title="That event couldn’t be found"
          description="It may have been removed, turned back into a draft, or the link may be incorrect."
          actionLabel="Back to discover"
          onAction={() => navigate('/discover')}
        />
      </div>
    )
  }

  const event = eventQuery.data
  const community = communityQuery.data
  const engagement = engagementQuery.data ?? { isSaved: false, rsvpStatus: null }

  return (
    <div className="shell py-8 sm:py-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[color:var(--teal-soft)] text-[color:var(--teal)]">{event.category}</Badge>
              {community ? <Badge>{community.name}</Badge> : null}
            </div>
            <h1 className="max-w-4xl text-5xl leading-none sm:text-6xl">{event.title}</h1>
            <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">{event.summary}</p>
          </div>

          <div className="panel overflow-hidden">
            <img src={event.coverImage} alt={event.title} className="h-[420px] w-full object-cover" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: CalendarDays, label: 'When', value: formatEventWindow(event.startAt, event.endAt) },
              { icon: MapPin, label: 'Where', value: `${event.venue}, ${event.city}` },
              { icon: Users, label: 'Attendance', value: `${event.attendees} people already going` },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="panel p-5">
                  <Icon className="size-5 text-[color:var(--accent)]" />
                  <div className="mt-4 text-sm uppercase tracking-[0.2em] text-[color:var(--muted)]">{item.label}</div>
                  <div className="mt-2 text-lg font-semibold">{item.value}</div>
                </div>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="panel space-y-5 p-6">
              <div className="eyebrow">About the event</div>
              <div className="space-y-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                <p>{event.description}</p>
                <p>
                  Hosted at {event.venue}, this event is designed for locals looking for better discovery,
                  more intentional experiences, and a stronger connection to the city’s communities.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </div>

            {community ? (
              <div className="panel space-y-4 p-6">
                <div className="eyebrow">Host community</div>
                <div className="flex items-center gap-3">
                  <img src={community.avatarImage} alt={community.name} className="size-14 rounded-2xl object-cover" />
                  <div>
                    <h2 className="text-2xl">{community.name}</h2>
                    <p className="text-sm text-[color:var(--muted)]">{community.vibe}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-[color:var(--muted)]">{community.description}</p>
                <Link to={`/communities/${community.slug}`}>
                  <Button variant="outline" className="w-full">
                    View community
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>

          <div className="space-y-4">
            <div className="eyebrow">Location</div>
            <EventMap events={[event]} activeEventId={event.id} className="min-h-[360px]" />
          </div>

          {gallery.length > 1 ? (
            <div className="space-y-4">
              <div className="eyebrow">Gallery</div>
              <div className="grid gap-4 md:grid-cols-2">
                {gallery.slice(1).map((image) => (
                  <div key={image} className="panel overflow-hidden">
                    <img src={image} alt={event.title} className="h-64 w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-5 lg:sticky lg:top-28 lg:h-fit">
          <RsvpPanel
            isAuthenticated={Boolean(user)}
            isSaved={engagement.isSaved}
            rsvpStatus={engagement.rsvpStatus}
            attendees={event.attendees}
            isPending={saveMutation.isPending || rsvpMutation.isPending}
            onToggleSave={() => {
              if (!user) {
                navigate('/login')
                return
              }
              saveMutation.mutate()
            }}
            onSelectStatus={(status) => {
              if (!user) {
                navigate('/login')
                return
              }
              rsvpMutation.mutate(status)
            }}
          />

          <div className="panel space-y-4 p-6">
            <div className="eyebrow">Address</div>
            <h3 className="text-2xl">{event.venue}</h3>
            <p className="text-sm leading-6 text-[color:var(--muted)]">{event.address}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
