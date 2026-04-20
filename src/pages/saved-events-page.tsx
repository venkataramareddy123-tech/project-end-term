import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { EmptyState } from '@/components/common/empty-state'
import { EventCard } from '@/components/discover/event-card'
import { useAuth } from '@/hooks/use-auth'
import { listCommunities } from '@/services/communities'
import { listSavedEvents, toggleSaveEvent } from '@/services/events'
import { queryKeys } from '@/services/query-keys'

export default function SavedEventsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const savedEventsQuery = useQuery({
    queryKey: queryKeys.events.saved(user!.id),
    queryFn: () => listSavedEvents(user!.id),
  })
  const communitiesQuery = useQuery({
    queryKey: queryKeys.communities.all,
    queryFn: listCommunities,
  })
  const removeSaveMutation = useMutation({
    mutationFn: (eventId: string) => toggleSaveEvent(user!.id, eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.saved(user!.id) })
    },
  })

  const communityById = new Map((communitiesQuery.data ?? []).map((community) => [community.id, community]))

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <div className="eyebrow">Saved events</div>
        <h1 className="mt-3 text-5xl leading-none sm:text-6xl">Everything that felt worth coming back to.</h1>
      </div>

      {(savedEventsQuery.data ?? []).length ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {(savedEventsQuery.data ?? []).map((event) => (
            <EventCard
              key={event.id}
              event={event}
              community={communityById.get(event.communityId)}
              isSaved
              onToggleSave={() => removeSaveMutation.mutate(event.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="You haven’t saved anything yet"
          description="As you browse CityPulse, save events you want to revisit later. They’ll stay here across sessions."
          actionLabel="Browse discover"
          onAction={() => (window.location.href = '/discover')}
        />
      )}
    </div>
  )
}
