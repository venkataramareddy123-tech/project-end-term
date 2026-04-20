import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

import { ErrorState } from '@/components/common/error-state'
import { LoadingScreen } from '@/components/common/loading-screen'
import { EventForm } from '@/components/forms/event-form'
import { useAuth } from '@/hooks/use-auth'
import { listUserManagedCommunities } from '@/services/communities'
import { getEventById, updateEvent } from '@/services/events'
import { queryKeys } from '@/services/query-keys'
import type { EventInput } from '@/types'

export default function EditEventPage() {
  const { eventId = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const eventQuery = useQuery({
    queryKey: queryKeys.events.byId(eventId),
    queryFn: () => getEventById(eventId),
    enabled: Boolean(eventId),
  })
  const communitiesQuery = useQuery({
    queryKey: queryKeys.communities.managed(user!.id),
    queryFn: () => listUserManagedCommunities(user!.id),
  })

  const updateMutation = useMutation({
    mutationFn: (input: EventInput) => updateEvent(user!.id, eventId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.byId(eventId) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.userCreated(user!.id) })
      navigate('/app/manage')
    },
  })

  if (eventQuery.isLoading) {
    return <LoadingScreen title="Loading event editor" description="Pulling your current event details into the form." />
  }

  if (eventQuery.isError || !eventQuery.data) {
    return (
      <ErrorState
        title="This event can't be edited"
        description="It may not exist anymore, or you may not have access to it."
        actionLabel="Back to manage"
        onAction={() => navigate('/app/manage')}
      />
    )
  }

  if (communitiesQuery.isLoading) {
    return <LoadingScreen title="Loading your communities" description="Preparing the edit form." />
  }

  if (communitiesQuery.isError) {
    return (
      <ErrorState
        title="Your communities could not be loaded"
        description="Please try again. Event editing depends on the communities you manage."
        actionLabel="Retry"
        onAction={() => void communitiesQuery.refetch()}
      />
    )
  }

  const event = eventQuery.data

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <div className="eyebrow">Edit event</div>
        <h1 className="mt-3 text-5xl leading-none sm:text-6xl">Refine the details before the city sees it.</h1>
      </div>

      <EventForm
        communities={communitiesQuery.data ?? []}
        submitLabel="Save changes"
        isSubmitting={updateMutation.isPending}
        initialValue={{
          title: event.title,
          summary: event.summary,
          description: event.description,
          category: event.category,
          tags: event.tags,
          startAt: event.startAt.slice(0, 16),
          endAt: event.endAt.slice(0, 16),
          venue: event.venue,
          address: event.address,
          city: event.city,
          latitude: event.latitude,
          longitude: event.longitude,
          coverImage: event.coverImage,
          gallery: event.gallery,
          priceLabel: event.priceLabel,
          capacity: event.capacity,
          status: event.status,
          communityId: event.communityId,
        }}
        onSubmit={async (input) => updateMutation.mutateAsync(input)}
      />
    </div>
  )
}
