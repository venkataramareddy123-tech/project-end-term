import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { RsvpStatus } from '@/types'

export function RsvpPanel({
  isAuthenticated,
  isSaved,
  rsvpStatus,
  attendees,
  onToggleSave,
  onSelectStatus,
  isPending,
}: {
  isAuthenticated: boolean
  isSaved: boolean
  rsvpStatus: RsvpStatus | null
  attendees: number
  onToggleSave: () => void
  onSelectStatus: (status: RsvpStatus | null) => void
  isPending?: boolean
}) {
  if (!isAuthenticated) {
    return (
      <div className="panel space-y-5 p-6">
        <div className="space-y-2">
          <div className="eyebrow">Join the flow</div>
          <h3 className="text-2xl">Save this event or lock it into your week</h3>
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            Create an account to save events, RSVP, and keep your itinerary in one place.
          </p>
        </div>
        <Link to="/signup">
          <Button className="w-full">Create your CityPulse account</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="panel space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Your plan</div>
          <h3 className="mt-3 text-2xl">Keep this in motion</h3>
        </div>
        {isPending ? <Spinner /> : <Badge>{attendees} going</Badge>}
      </div>

      <div className="space-y-3">
        <Button className="w-full" variant={rsvpStatus === 'going' ? 'secondary' : 'primary'} onClick={() => onSelectStatus(rsvpStatus === 'going' ? null : 'going')}>
          {rsvpStatus === 'going' ? 'Going' : 'RSVP Going'}
        </Button>
        <Button className="w-full" variant={rsvpStatus === 'interested' ? 'secondary' : 'outline'} onClick={() => onSelectStatus(rsvpStatus === 'interested' ? null : 'interested')}>
          {rsvpStatus === 'interested' ? 'Interested' : 'Mark Interested'}
        </Button>
        <Button className="w-full" variant={isSaved ? 'secondary' : 'outline'} onClick={onToggleSave}>
          {isSaved ? 'Saved to your list' : 'Save for later'}
        </Button>
      </div>
    </div>
  )
}
