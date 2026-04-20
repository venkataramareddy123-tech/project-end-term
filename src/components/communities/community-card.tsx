import { ArrowRight, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Community } from '@/types'

export function CommunityCard({ community }: { community: Community }) {
  return (
    <Card className="group transition duration-200 hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        <img
          src={community.coverImage}
          alt={community.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="rounded-[24px] bg-white/85 p-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <img src={community.avatarImage} alt={community.name} className="size-12 rounded-2xl object-cover" />
              <div>
                <div className="font-display text-xl">{community.name}</div>
                <div className="text-sm text-[color:var(--muted)]">{community.city}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {community.tags.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <p className="text-sm leading-6 text-[color:var(--muted)]">{community.description}</p>
        <div className="flex items-center justify-between border-t border-black/5 pt-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--muted)]">
            <Users className="size-4" />
            {community.memberCount.toLocaleString()} members
          </div>
          <Link to={`/communities/${community.slug}`}>
            <Button variant="outline">
              Explore
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
