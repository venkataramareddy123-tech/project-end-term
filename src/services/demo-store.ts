import { demoDatabaseSeed } from '@/data/mock-data'
import type { DemoDatabase } from '@/types'

const DEMO_DB_KEY = 'citypulse-demo-db'
const DEMO_SESSION_KEY = 'citypulse-demo-session'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function ensureDemoStore() {
  if (!canUseStorage()) return

  const existing = window.localStorage.getItem(DEMO_DB_KEY)

  if (!existing) {
    window.localStorage.setItem(DEMO_DB_KEY, JSON.stringify(demoDatabaseSeed))
  }
}

export function readDemoStore(): DemoDatabase {
  ensureDemoStore()

  if (!canUseStorage()) {
    return demoDatabaseSeed
  }

  const raw = window.localStorage.getItem(DEMO_DB_KEY)
  return raw ? (JSON.parse(raw) as DemoDatabase) : demoDatabaseSeed
}

export function writeDemoStore(database: DemoDatabase) {
  if (!canUseStorage()) return
  window.localStorage.setItem(DEMO_DB_KEY, JSON.stringify(database))
}

export function getDemoSessionUserId() {
  if (!canUseStorage()) return null
  return window.localStorage.getItem(DEMO_SESSION_KEY)
}

export function setDemoSessionUserId(userId: string | null) {
  if (!canUseStorage()) return

  if (userId) {
    window.localStorage.setItem(DEMO_SESSION_KEY, userId)
    return
  }

  window.localStorage.removeItem(DEMO_SESSION_KEY)
}
