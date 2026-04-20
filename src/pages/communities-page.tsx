import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { CommunityCard } from '@/components/communities/community-card'
import { ErrorState } from '@/components/common/error-state'
import { LoadingScreen } from '@/components/common/loading-screen'
import { SectionHeading } from '@/components/common/section-heading'
import { Input } from '@/components/ui/input'
import { listCommunities } from '@/services/communities'
import { queryKeys } from '@/services/query-keys'

export default function CommunitiesPage() {
  const [search, setSearch] = useState('')
  const communitiesQuery = useQuery({
    queryKey: queryKeys.communities.all,
    queryFn: listCommunities,
  })

  const communities = useMemo(() => {
    const allCommunities = communitiesQuery.data ?? []
    if (!search) return allCommunities

    return allCommunities.filter((community) =>
      [community.name, community.description, community.tags.join(' ')]
        .join(' ')
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
  }, [communitiesQuery.data, search])

  if (communitiesQuery.isLoading) {
    return <LoadingScreen title="Loading communities" description="Gathering the local groups powering the city." />
  }

  if (communitiesQuery.isError) {
    return (
      <div className="shell py-14">
        <ErrorState
          title="Communities are unavailable"
          description="We couldn’t load the community directory right now."
          actionLabel="Retry"
          onAction={() => void communitiesQuery.refetch()}
        />
      </div>
    )
  }

  return (
    <div className="shell py-8 sm:py-10">
      <section className="space-y-8">
        <SectionHeading
          eyebrow="Communities"
          title="Follow the hosts, clubs, and collectives you actually want to hear from"
          description="CityPulse is not just a feed of random events. It is a way to discover the communities repeatedly shaping your city’s best experiences."
        />

        <div className="panel p-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search wellness clubs, supper hosts, walk groups..."
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {communities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </section>
    </div>
  )
}
