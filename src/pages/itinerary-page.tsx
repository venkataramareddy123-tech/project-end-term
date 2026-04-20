import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatEventWindow } from '@/lib/formatters'
import { useAuth } from '@/hooks/use-auth'
import { listItinerary, setRsvpStatus } from '@/services/events'
import { queryKeys } from '@/services/query-keys'

export default function ItineraryPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const itineraryQuery = useQuery({
    queryKey: queryKeys.events.itinerary(user!.id),
    queryFn: () => listItinerary(user!.id),
  })

  const statusMutation = useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: 'going' | 'interested' | null }) =>
      setRsvpStatus(user!.id, eventId, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.itinerary(user!.id) })
    },
  })

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <div className="eyebrow">Itinerary</div>
        <h1 className="mt-3 text-5xl leading-none sm:text-6xl">A live view of what your week already looks like.</h1>
      </div>

      {(itineraryQuery.data ?? []).length ? (
        <div className="space-y-4">
          {(itineraryQuery.data ?? []).map((event) => (
            <div key={event.id} className="panel grid gap-5 p-5 lg:grid-cols-[220px_minmax(0,1fr)_220px]">
              <img src={event.coverImage} alt={event.title} className="h-44 w-full rounded-[24px] object-cover" />
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[color:var(--teal-soft)] text-[color:var(--teal)]">{event.rsvpStatus}</Badge>
                  <Badge>{event.category}</Badge>
                </div>
                <h2 className="text-3xl">{event.title}</h2>
                <p className="text-sm leading-6 text-[color:var(--muted)]">{event.summary}</p>
                <div className="text-sm text-[color:var(--muted)]">{formatEventWindow(event.startAt, event.endAt)}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Button variant={event.rsvpStatus === 'going' ? 'secondary' : 'outline'} onClick={() => statusMutation.mutate({ eventId: event.id, status: event.rsvpStatus === 'going' ? null : 'going' })}>
                  {event.rsvpStatus === 'going' ? 'Going' : 'Mark going'}
                </Button>
                <Button variant={event.rsvpStatus === 'interested' ? 'secondary' : 'outline'} onClick={() => statusMutation.mutate({ eventId: event.id, status: event.rsvpStatus === 'interested' ? null : 'interested' })}>
                  {event.rsvpStatus === 'interested' ? 'Interested' : 'Mark interested'}
                </Button>
                <Button variant="ghost" onClick={() => statusMutation.mutate({ eventId: event.id, status: null })}>
                  Remove RSVP
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Your itinerary is empty"
          description="RSVP to events from the detail page to keep track of what you’re attending or watching."
          actionLabel="Find events"
          onAction={() => (window.location.href = '/discover')}
        />
      )}
    </div>
  )
}
