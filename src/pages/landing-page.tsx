import { useQuery } from '@tanstack/react-query'
import { ArrowRight, CalendarRange, MapPinned, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { CommunityCard } from '@/components/communities/community-card'
import { ErrorState } from '@/components/common/error-state'
import { LoadingScreen } from '@/components/common/loading-screen'
import { SectionHeading } from '@/components/common/section-heading'
import { EventCard } from '@/components/discover/event-card'
import { Button } from '@/components/ui/button'
import { featurePillars } from '@/lib/constants'
import { useAuth } from '@/hooks/use-auth'
import { listFeaturedCommunities } from '@/services/communities'
import { listFeaturedEvents } from '@/services/events'
import { queryKeys } from '@/services/query-keys'

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.55, ease: 'easeOut' as const },
}

export default function LandingPage() {
  const { user } = useAuth()
  const eventsQuery = useQuery({
    queryKey: queryKeys.events.featured,
    queryFn: () => listFeaturedEvents(3),
  })
  const communitiesQuery = useQuery({
    queryKey: queryKeys.communities.featured,
    queryFn: () => listFeaturedCommunities(3),
  })

  if (eventsQuery.isLoading || communitiesQuery.isLoading) {
    return <LoadingScreen title="Opening CityPulse" description="Setting the city stage with the best local picks." />
  }

  if (eventsQuery.isError || communitiesQuery.isError) {
    return (
      <div className="shell py-14">
        <ErrorState
          title="CityPulse couldn’t load the front page"
          description="Please try again. If the problem persists, check your backend environment variables."
          actionLabel="Retry"
          onAction={() => {
            void eventsQuery.refetch()
            void communitiesQuery.refetch()
          }}
        />
      </div>
    )
  }

  const featuredEvents = eventsQuery.data ?? []
  const featuredCommunities = communitiesQuery.data ?? []

  return (
    <div className="pb-16">
      <section className="shell pt-8 md:pt-10">
        <motion.div {...reveal} className="hero-mesh panel overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="eyebrow">Community-based event discovery</div>
                <h1 className="max-w-3xl text-5xl leading-none sm:text-6xl lg:text-7xl">
                  The city feels better when discovery stops being accidental.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[color:var(--muted)] sm:text-lg">
                  CityPulse helps locals discover hyperlocal events from communities they actually want to follow,
                  then save, RSVP, and organize their week in one thoughtful interface.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/discover">
                  <Button size="lg">
                    Explore events
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link to={user ? '/app/dashboard' : '/signup'}>
                  <Button variant="outline" size="lg">
                    {user ? 'Open dashboard' : 'Create your account'}
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: MapPinned, label: 'Neighborhood-first discovery', value: 'Map-first' },
                  { icon: Users, label: 'Local communities to follow', value: 'Curated' },
                  { icon: CalendarRange, label: 'Personal planning flow', value: 'Save + RSVP' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-[28px] border border-white/65 bg-white/72 p-4 backdrop-blur">
                      <Icon className="size-5 text-[color:var(--accent)]" />
                      <div className="mt-4 text-2xl font-semibold">{item.value}</div>
                      <div className="mt-1 text-sm text-[color:var(--muted)]">{item.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-panel p-5">
                <div className="eyebrow">Why it matters</div>
                <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--muted)]">
                  <p>
                    City events are scattered across Instagram pages, WhatsApp groups, venue posters, and private
                    circles.
                  </p>
                  <p>
                    That means great local events stay invisible, people miss communities they would love, and
                    organizers struggle to reach the right audience.
                  </p>
                </div>
              </div>

              {featuredEvents[0] ? (
                <div className="panel overflow-hidden">
                  <img src={featuredEvents[0].coverImage} alt={featuredEvents[0].title} className="h-64 w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <div className="eyebrow">Featured tonight</div>
                    <h2 className="text-3xl">{featuredEvents[0].title}</h2>
                    <p className="text-sm leading-6 text-[color:var(--muted)]">{featuredEvents[0].summary}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </section>

      <section className="shell mt-14 space-y-8">
        <SectionHeading
          eyebrow="Product pillars"
          title="Built for real local discovery, not generic event browsing"
          description="Each core feature answers a real problem in how people currently find, save, and show up to city events."
        />
        <div className="grid gap-5 md:grid-cols-3">
          {featurePillars.map((pillar) => (
            <motion.div key={pillar.title} {...reveal} className="panel p-6">
              <div className="eyebrow">Core feature</div>
              <h3 className="mt-4 text-3xl">{pillar.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{pillar.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="shell mt-16 space-y-8">
        <SectionHeading
          eyebrow="Featured events"
          title="Hand-picked experiences worth keeping on your radar"
          description="CityPulse highlights the kinds of events people normally find too late or through the wrong channel."
          action={
            <Link to="/discover">
              <Button variant="outline">Open discovery</Button>
            </Link>
          }
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredEvents.map((event) => (
            <motion.div key={event.id} {...reveal}>
              <EventCard event={event} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="shell mt-16 space-y-8">
        <SectionHeading
          eyebrow="Communities"
          title="Follow the people already shaping the best nights in the city"
          description="From creative collectives to wellness clubs and supper hosts, communities are the backbone of CityPulse."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {featuredCommunities.map((community) => (
            <motion.div key={community.id} {...reveal}>
              <CommunityCard community={community} />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="shell mt-16">
        <div className="panel hero-mesh overflow-hidden px-6 py-10 sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <div className="eyebrow">Ready to use it?</div>
              <h2 className="text-4xl sm:text-5xl">Turn missed events into a curated weekly rhythm.</h2>
              <p className="max-w-2xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
                Sign up, follow communities, save events, and keep everything in one clean dashboard built for actual
                city life.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/discover">
                <Button size="lg">Start discovering</Button>
              </Link>
              <Link to={user ? '/app/dashboard' : '/signup'}>
                <Button variant="outline" size="lg">
                  {user ? 'Go to dashboard' : 'Join CityPulse'}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
