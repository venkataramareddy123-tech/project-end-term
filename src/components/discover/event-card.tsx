import { Heart, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatEventDate, formatEventDay, formatEventWindow } from '@/lib/formatters'
import { cn } from '@/lib/utils'
import type { Community, EventRecord } from '@/types'

export function EventCard({
  event,
  community,
  isSaved,
  selected,
  onToggleSave,
}: {
  event: EventRecord
  community?: Community | null
  isSaved?: boolean
  selected?: boolean
  onToggleSave?: (eventId: string) => void
}) {
  return (
    <Card className={cn('group transition duration-200 hover:-translate-y-1', selected && 'ring-2 ring-[color:var(--accent)]')}>
      <div className="relative h-56 overflow-hidden">
        <img
          src={event.coverImage}
          alt={event.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-[22px] bg-white/88 px-3 py-2 text-center shadow-lg backdrop-blur">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
            {formatEventDay(event.startAt)}
          </div>
          <div className="font-display text-2xl">{formatEventDate(event.startAt)}</div>
        </div>
        {onToggleSave ? (
          <button
            type="button"
            onClick={() => onToggleSave(event.id)}
            className="absolute right-4 top-4 inline-flex size-11 items-center justify-center rounded-full bg-white/88 text-[color:var(--foreground)] shadow-lg backdrop-blur"
            aria-label={isSaved ? 'Unsave event' : 'Save event'}
          >
            <Heart className={cn('size-4', isSaved && 'fill-[color:var(--accent)] text-[color:var(--accent)]')} />
          </button>
        ) : null}
      </div>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-[color:var(--teal-soft)] text-[color:var(--teal)]">{event.category}</Badge>
          {community ? <Badge>{community.name}</Badge> : null}
        </div>

        <div className="space-y-2">
          <Link to={`/events/${event.slug}`}>
            <h3 className="text-2xl leading-tight transition group-hover:text-[color:var(--accent)]">{event.title}</h3>
          </Link>
          <p className="text-sm leading-6 text-[color:var(--muted)]">{event.summary}</p>
        </div>

        <div className="space-y-2 text-sm text-[color:var(--muted)]">
          <div>{formatEventWindow(event.startAt, event.endAt)}</div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            {event.venue}, {event.city}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-4">
          <div>
            <div className="text-sm font-semibold">{event.priceLabel}</div>
            <div className="text-xs text-[color:var(--muted)]">{event.attendees} people already in</div>
          </div>
          <Link to={`/events/${event.slug}`}>
            <Button variant="outline">View details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
