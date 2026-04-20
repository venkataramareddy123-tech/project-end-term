import { endOfWeek, format, isSameDay, isWeekend, isWithinInterval, startOfDay } from 'date-fns'

import type { DiscoveryDatePreset, EventRecord } from '@/types'

export function formatEventWindow(startAt: string, endAt: string) {
  const start = new Date(startAt)
  const end = new Date(endAt)
  const sameDay = isSameDay(start, end)

  return sameDay
    ? `${format(start, 'EEE, d MMM')} · ${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`
    : `${format(start, 'EEE, d MMM h:mm a')} - ${format(end, 'EEE, d MMM h:mm a')}`
}

export function formatEventDay(startAt: string) {
  return format(new Date(startAt), 'EEE')
}

export function formatEventDate(startAt: string) {
  return format(new Date(startAt), 'd MMM')
}

export function formatPriceLabel(priceLabel: string) {
  return priceLabel.toLowerCase() === 'free' ? 'Free entry' : priceLabel
}

export function matchesDatePreset(event: EventRecord, preset: DiscoveryDatePreset) {
  const start = new Date(event.startAt)

  if (preset === 'all') return true
  if (preset === 'today') return isSameDay(start, new Date())
  if (preset === 'weekend') return isWeekend(start)

  return isWithinInterval(start, {
    start: startOfDay(new Date()),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  })
}

export function isFreeEvent(event: EventRecord) {
  return event.priceLabel.toLowerCase().includes('free')
}
