import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { defaultDiscoveryFilters } from '@/lib/constants'
import type { DiscoveryFilters, EventCategory } from '@/types'

function parseCategories(value: string | null): EventCategory[] {
  if (!value) return []
  return value.split(',').filter(Boolean) as EventCategory[]
}

function parseTags(value: string | null) {
  if (!value) return []
  return value.split(',').filter(Boolean)
}

function toSearchString(filters: DiscoveryFilters) {
  const params = new URLSearchParams()

  if (filters.query) params.set('query', filters.query)
  if (filters.categories.length) params.set('categories', filters.categories.join(','))
  if (filters.datePreset !== 'all') params.set('date', filters.datePreset)
  if (filters.pricePreset !== 'all') params.set('price', filters.pricePreset)
  if (filters.city && filters.city !== defaultDiscoveryFilters.city) params.set('city', filters.city)
  if (filters.tags.length) params.set('tags', filters.tags.join(','))

  return params.toString()
}

function fromSearchParams(searchParams: URLSearchParams): DiscoveryFilters {
  return {
    query: searchParams.get('query') ?? defaultDiscoveryFilters.query,
    categories: parseCategories(searchParams.get('categories')),
    datePreset: (searchParams.get('date') as DiscoveryFilters['datePreset']) ?? defaultDiscoveryFilters.datePreset,
    pricePreset:
      (searchParams.get('price') as DiscoveryFilters['pricePreset']) ?? defaultDiscoveryFilters.pricePreset,
    city: searchParams.get('city') ?? defaultDiscoveryFilters.city,
    tags: parseTags(searchParams.get('tags')),
  }
}

export function useDiscoveryFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => fromSearchParams(searchParams), [searchParams])
  const setFilters = useCallback(
    (nextFilters: DiscoveryFilters | ((current: DiscoveryFilters) => DiscoveryFilters)) => {
      const resolvedFilters = typeof nextFilters === 'function' ? nextFilters(filters) : nextFilters
      setSearchParams(toSearchString(resolvedFilters))
    },
    [filters, setSearchParams],
  )

  return {
    filters,
    setFilters,
  }
}
