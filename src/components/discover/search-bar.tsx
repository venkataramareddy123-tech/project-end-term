import { Search, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function SearchBar({
  value,
  city,
  onChange,
  onOpenFilters,
}: {
  value: string
  city: string
  onChange: (nextValue: string) => void
  onOpenFilters?: () => void
}) {
  return (
    <div className="panel flex flex-col gap-4 p-4 md:flex-row md:items-center">
      <div className="flex flex-1 items-center gap-3 rounded-[22px] border border-[color:var(--border)] bg-white/75 px-4">
        <Search className="size-4 text-[color:var(--muted)]" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search for makers markets, runs, screenings, supper clubs..."
          className="border-0 bg-transparent px-0 focus:ring-0"
        />
      </div>
      <div className="flex items-center justify-between gap-4 md:justify-end">
        <div className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-4 py-3 text-sm font-semibold">
          {city}
        </div>
        {onOpenFilters ? (
          <Button variant="outline" onClick={onOpenFilters}>
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        ) : null}
      </div>
    </div>
  )
}
