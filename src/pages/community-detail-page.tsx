import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { ErrorState } from '@/components/common/error-state'
import { LoadingScreen } from '@/components/common/loading-screen'
import { EventCard } from '@/components/discover/event-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { getCommunityBySlug, getCommunityMembershipState, toggleCommunityMembership } from '@/services/communities'
import { listPublishedEvents } from '@/services/events'
import { queryKeys } from '@/services/query-keys'

export default function CommunityDetailPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const communityQuery = useQuery({
    queryKey: queryKeys.communities.detail(slug),
    queryFn: () => getCommunityBySlug(slug),
    enabled: Boolean(slug),
  })
  const eventsQuery = useQuery({
    queryKey: queryKeys.events.all,
    queryFn: listPublishedEvents,
  })
  const membershipQuery = useQuery({
    queryKey: queryKeys.communities.membership(user?.id ?? 'guest', communityQuery.data?.id ?? slug),
    queryFn: () => getCommunityMembershipState(user?.id ?? null, communityQuery.data!.id),
    enabled: Boolean(communityQuery.data?.id),
  })

  const membershipMutation = useMutation({
    mutationFn: () => toggleCommunityMembership(user!.id, communityQuery.data!.id),
    onSuccess: () => {
      if (!user || !communityQuery.data) return
      void queryClient.invalidateQueries({ queryKey: queryKeys.communities.detail(slug) })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.communities.membership(user.id, communityQuery.data.id),
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.communities.all })
    },
  })

  if (communityQuery.isLoading || eventsQuery.isLoading) {
    return <LoadingScreen title="Loading community" description="Pulling together the host, members, and upcoming events." />
  }

  if (communityQuery.isError || !communityQuery.data) {
    return (
      <div className="shell py-14">
        <ErrorState
          title="That community couldn’t be found"
          description="It may have been renamed, removed, or the link is incorrect."
          actionLabel="Browse communities"
          onAction={() => navigate('/communities')}
        />
      </div>
    )
  }

  const community = communityQuery.data
  const communityEvents = (eventsQuery.data ?? []).filter((event) => event.communityId === community.id)
  const isMember = membershipQuery.data ?? false

  return (
    <div className="shell py-8 sm:py-10">
      <section className="space-y-8">
        <div className="panel hero-mesh overflow-hidden">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6 p-8 sm:p-10">
              <div className="eyebrow">Community spotlight</div>
              <div className="flex items-center gap-4">
                <img src={community.avatarImage} alt={community.name} className="size-18 rounded-[26px] object-cover" />
                <div>
                  <h1 className="text-5xl leading-none sm:text-6xl">{community.name}</h1>
                  <p className="mt-2 text-base text-[color:var(--muted)]">{community.city}</p>
                </div>
              </div>
              <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                {community.longDescription}
              </p>
              <div className="flex flex-wrap gap-2">
                {community.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={() => {
                    if (!user) {
                      navigate('/login')
                      return
                    }
                    membershipMutation.mutate()
                  }}
                >
                  {isMember ? 'Following this community' : 'Follow community'}
                </Button>
                <Link to="/discover">
                  <Button variant="outline">Discover more events</Button>
                </Link>
              </div>
            </div>
            <div className="relative min-h-[320px]">
              <img src={community.coverImage} alt={community.name} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {[
            { label: 'Members', value: community.memberCount.toLocaleString() },
            { label: 'Upcoming events', value: String(communityEvents.length) },
            { label: 'Vibe', value: community.vibe },
          ].map((item) => (
            <div key={item.label} className="panel p-6">
              <div className="eyebrow">{item.label}</div>
              <div className="mt-4 text-3xl">{item.value}</div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <div className="eyebrow">Upcoming events</div>
            <h2 className="mt-3 text-4xl">What this community is hosting next</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {communityEvents.map((event) => (
              <EventCard key={event.id} event={event} community={community} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
