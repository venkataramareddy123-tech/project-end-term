import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Building2, PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatEventWindow } from '@/lib/formatters'
import { useAuth } from '@/hooks/use-auth'
import { listCommunities, listUserManagedCommunities } from '@/services/communities'
import { deleteEvent, listUserEvents } from '@/services/events'
import { queryKeys } from '@/services/query-keys'

export default function ManagePage() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const userEventsQuery = useQuery({
    queryKey: queryKeys.events.userCreated(user!.id),
    queryFn: () => listUserEvents(user!.id),
  })
  const communitiesQuery = useQuery({
    queryKey: queryKeys.communities.all,
    queryFn: listCommunities,
  })
  const managedCommunitiesQuery = useQuery({
    queryKey: queryKeys.communities.managed(user!.id),
    queryFn: () => listUserManagedCommunities(user!.id),
  })

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => deleteEvent(user!.id, eventId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.userCreated(user!.id) })
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.all })
    },
  })

  const communityById = new Map((communitiesQuery.data ?? []).map((community) => [community.id, community]))
  const managedCommunities = managedCommunitiesQuery.data ?? []
  const userEvents = userEventsQuery.data ?? []

  return (
    <div className="space-y-6">
      <div className="panel p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="eyebrow">Manage</div>
            <h1 className="mt-3 text-5xl leading-none sm:text-6xl">Everything you have published, in one editor view.</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/app/communities/new">
              <Button variant="outline">
                <Building2 className="size-4" />
                Create community
              </Button>
            </Link>
            <Link to="/app/events/new">
              <Button>
                <PlusCircle className="size-4" />
                Create event
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="eyebrow">Your communities</div>
          <h2 className="mt-3 text-3xl">The spaces you manage</h2>
        </div>

        {managedCommunities.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {managedCommunities.map((community) => (
              <div key={community.id} className="panel overflow-hidden">
                <div className="grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
                  <img src={community.coverImage} alt={community.name} className="h-full min-h-48 w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-[color:var(--teal-soft)] text-[color:var(--teal)]">Community</Badge>
                      <Badge>{community.memberCount} members</Badge>
                    </div>
                    <h3 className="text-3xl">{community.name}</h3>
                    <p className="text-sm leading-6 text-[color:var(--muted)]">{community.description}</p>
                    <div className="flex gap-3">
                      <Link to={`/communities/${community.slug}`}>
                        <Button variant="outline">Open public page</Button>
                      </Link>
                      <Link to="/app/events/new">
                        <Button>Create event here</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="You have not created a community yet"
            description="Create one community first so your events have a proper home in the app and in Supabase."
            actionLabel="Create community"
            onAction={() => (window.location.href = '/app/communities/new')}
          />
        )}
      </div>

      {userEvents.length ? (
        <div className="space-y-4">
          <div>
            <div className="eyebrow">Your events</div>
            <h2 className="mt-3 text-3xl">Published and draft events</h2>
          </div>

          {userEvents.map((event) => (
            <div key={event.id} className="panel grid gap-5 p-5 lg:grid-cols-[220px_minmax(0,1fr)_230px]">
              <img src={event.coverImage} alt={event.title} className="h-44 w-full rounded-[24px] object-cover" />
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-[color:var(--teal-soft)] text-[color:var(--teal)]">{event.status}</Badge>
                  {communityById.get(event.communityId) ? <Badge>{communityById.get(event.communityId)?.name}</Badge> : null}
                </div>
                <h2 className="text-3xl">{event.title}</h2>
                <p className="text-sm leading-6 text-[color:var(--muted)]">{event.summary}</p>
                <div className="text-sm text-[color:var(--muted)]">{formatEventWindow(event.startAt, event.endAt)}</div>
              </div>
              <div className="flex flex-col gap-3">
                <Link to={`/events/${event.slug}`}>
                  <Button variant="outline" className="w-full">
                    View live page
                  </Button>
                </Link>
                <Link to={`/app/events/${event.id}/edit`}>
                  <Button className="w-full">Edit event</Button>
                </Link>
                <Button variant="ghost" className="w-full" onClick={() => deleteMutation.mutate(event.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={managedCommunities.length ? 'You have not published an event yet' : 'Create a community first, then publish your first event'}
          description={
            managedCommunities.length
              ? 'Your community is ready. Publish the first event to make the app come alive.'
              : 'Once a community exists, event creation works directly from the dashboard without manual database inserts.'
          }
          actionLabel={managedCommunities.length ? 'Create event' : 'Create community'}
          onAction={() =>
            (window.location.href = managedCommunities.length ? '/app/events/new' : '/app/communities/new')
          }
        />
      )}
    </div>
  )
}
