import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { eventCategories } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { DiscoveryFilters, EventCategory } from '@/types'

function FilterButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-2 text-sm font-semibold transition',
        active
          ? 'border-transparent bg-[color:var(--teal)] text-white'
          : 'border-[color:var(--border)] bg-white/70 text-[color:var(--muted)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]',
      )}
    >
      {label}
    </button>
  )
}

export function FilterSidebar({
  filters,
  availableTags,
  onChange,
  onReset,
  mobile,
  onClose,
}: {
  filters: DiscoveryFilters
  availableTags: string[]
  onChange: (nextFilters: DiscoveryFilters) => void
  onReset: () => void
  mobile?: boolean
  onClose?: () => void
}) {
  const toggleCategory = (category: EventCategory) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category]

    onChange({ ...filters, categories })
  }

  const toggleTag = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((item) => item !== tag)
      : [...filters.tags, tag]

    onChange({ ...filters, tags })
  }

  return (
    <aside className={cn('panel h-fit p-5', mobile && 'max-h-[80vh] overflow-y-auto')}>
      <div className="flex items-center justify-between">
        <div>
          <div className="eyebrow">Filters</div>
          <h3 className="mt-3 text-2xl">Tune your city view</h3>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-full border border-[color:var(--border)] bg-white/70"
            aria-label="Close filters"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      <div className="mt-6 space-y-6">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Categories</div>
          <div className="flex flex-wrap gap-2">
            {eventCategories.map((category) => (
              <FilterButton
                key={category}
                label={category}
                active={filters.categories.includes(category)}
                onClick={() => toggleCategory(category)}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold">When</div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Any time', value: 'all' },
              { label: 'Today', value: 'today' },
              { label: 'Weekend', value: 'weekend' },
              { label: 'This week', value: 'week' },
            ].map((option) => (
              <FilterButton
                key={option.value}
                label={option.label}
                active={filters.datePreset === option.value}
                onClick={() => onChange({ ...filters, datePreset: option.value as DiscoveryFilters['datePreset'] })}
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold">Price</div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All', value: 'all' },
              { label: 'Free', value: 'free' },
              { label: 'Paid', value: 'paid' },
            ].map((option) => (
              <FilterButton
                key={option.value}
                label={option.label}
                active={filters.pricePreset === option.value}
                onClick={() =>
                  onChange({ ...filters, pricePreset: option.value as DiscoveryFilters['pricePreset'] })
                }
              />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-semibold">Tags</div>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <FilterButton
                key={tag}
                label={tag}
                active={filters.tags.includes(tag)}
                onClick={() => toggleTag(tag)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onReset}>
          Reset
        </Button>
        {onClose ? (
          <Button className="flex-1" onClick={onClose}>
            Apply
          </Button>
        ) : null}
      </div>
    </aside>
  )
}
