import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { LoadingScreen } from '@/components/common/loading-screen'
import { EventForm } from '@/components/forms/event-form'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { listUserManagedCommunities } from '@/services/communities'
import { createEvent } from '@/services/events'
import { queryKeys } from '@/services/query-keys'
import type { EventInput } from '@/types'

export default function CreateEventPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const communitiesQuery = useQuery({
    queryKey: queryKeys.communities.managed(user!.id),
    queryFn: () => listUserManagedCommunities(user!.id),
  })

  const createMutation = useMutation({
    mutationFn: (input: EventInput) => createEvent(user!.id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.userCreated(user!.id) })
      navigate('/app/manage')
    },
  })

  if (communitiesQuery.isLoading) {
    return <LoadingScreen title="Loading your communities" description="Checking where this event can be published." />
  }

  if (communitiesQuery.isError) {
    return (
      <ErrorState
        title="Your communities could not be loaded"
        description="Please try again. Event creation depends on the communities you manage."
        actionLabel="Retry"
        onAction={() => void communitiesQuery.refetch()}
      />
    )
  }

  const communities = communitiesQuery.data ?? []

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <div className="eyebrow">Create event</div>
        <h1 className="mt-3 text-5xl leading-none sm:text-6xl">Publish a new moment into the city.</h1>
      </div>

      {communities.length ? (
        <EventForm
          communities={communities}
          submitLabel="Publish event"
          isSubmitting={createMutation.isPending}
          onSubmit={async (input) => createMutation.mutateAsync(input)}
        />
      ) : (
        <div className="space-y-4">
          <EmptyState
            title="You need a community before you can create an event"
            description="Create your first community once, then use it as the home for all the events you publish."
          />
          <Link to="/app/communities/new">
            <Button>Create community now</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
