import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function unique<T>(items: T[]) {
  return Array.from(new Set(items))
}

export function generateId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function averageCoordinates(items: Array<{ latitude: number; longitude: number }>) {
  if (!items.length) {
    return { latitude: 12.9716, longitude: 77.5946 }
  }

  const latitude = items.reduce((sum, item) => sum + item.latitude, 0) / items.length
  const longitude = items.reduce((sum, item) => sum + item.longitude, 0) / items.length

  return { latitude, longitude }
}

export function createUsername(fullName: string) {
  const base = slugify(fullName.replace(/\s+/g, ' '))
  return base || `citypulse-${Math.random().toString(36).slice(2, 6)}`
}
