import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useEffect, useMemo, useRef } from 'react'

import { Badge } from '@/components/ui/badge'
import { env, isMapboxConfigured } from '@/lib/env'
import { averageCoordinates, cn } from '@/lib/utils'
import type { EventRecord } from '@/types'

export function EventMap({
  events,
  activeEventId,
  onEventSelect,
  className,
}: {
  events: EventRecord[]
  activeEventId?: string | null
  onEventSelect?: (eventId: string) => void
  className?: string
}) {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const center = useMemo(() => averageCoordinates(events), [events])
  const activeEvent = events.find((event) => event.id === activeEventId) ?? events[0] ?? null

  useEffect(() => {
    if (!isMapboxConfigured || !containerRef.current || mapRef.current) return

    mapboxgl.accessToken = env.mapboxToken
    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [center.longitude, center.latitude],
      zoom: 11.6,
    })

    mapRef.current.scrollZoom.disable()
    mapRef.current.dragRotate.disable()
    mapRef.current.touchZoomRotate.disableRotation()

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [center.latitude, center.longitude])

  useEffect(() => {
    if (!isMapboxConfigured || !mapRef.current) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    events.forEach((event) => {
      const markerElement = document.createElement('button')
      markerElement.type = 'button'
      markerElement.className = `flex size-11 items-center justify-center rounded-full border border-white/70 text-sm font-bold shadow-lg transition ${
        event.id === activeEventId ? 'bg-[#113f3b] text-white' : 'bg-[#f06d4f] text-[#fff7f2]'
      }`
      markerElement.textContent = String(event.attendees)
      markerElement.setAttribute('aria-label', event.title)
      markerElement.onclick = () => onEventSelect?.(event.id)

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([event.longitude, event.latitude])
        .addTo(mapRef.current!)

      markersRef.current.push(marker)
    })

    if (!events.length) return

    if (activeEvent) {
      mapRef.current.flyTo({
        center: [activeEvent.longitude, activeEvent.latitude],
        zoom: 12.8,
      })
      return
    }

    const bounds = new mapboxgl.LngLatBounds()
    events.forEach((event) => bounds.extend([event.longitude, event.latitude]))
    mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 12.2 })
  }, [activeEvent, activeEventId, events, onEventSelect])

  const fallbackMarkers = useMemo(() => {
    if (!events.length) return []

    const latitudes = events.map((event) => event.latitude)
    const longitudes = events.map((event) => event.longitude)
    const minLat = Math.min(...latitudes)
    const maxLat = Math.max(...latitudes)
    const minLng = Math.min(...longitudes)
    const maxLng = Math.max(...longitudes)

    return events.map((event) => {
      const left = ((event.longitude - minLng) / Math.max(maxLng - minLng, 0.01)) * 78 + 10
      const top = ((maxLat - event.latitude) / Math.max(maxLat - minLat, 0.01)) * 68 + 12
      return { event, left, top }
    })
  }, [events])

  if (!isMapboxConfigured) {
    return (
      <div className={cn('panel relative min-h-[420px] overflow-hidden p-5', className)}>
        <div className="absolute inset-0 grid-fade opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(240,109,79,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(17,63,59,0.18),transparent_24%)]" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="eyebrow">Map preview</div>
            <h3 className="mt-3 text-3xl">Interactive map unlocks automatically with your Mapbox token</h3>
          </div>
          <Badge className="bg-[color:var(--teal-soft)] text-[color:var(--teal)]">Demo grid</Badge>
        </div>
        <div className="relative mt-10 h-[300px]">
          {fallbackMarkers.map(({ event, left, top }) => (
            <button
              key={event.id}
              type="button"
              onClick={() => onEventSelect?.(event.id)}
              className={cn(
                'absolute inline-flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 text-xs font-bold text-white shadow-xl transition hover:scale-105',
                event.id === activeEventId ? 'bg-[color:var(--teal)]' : 'bg-[color:var(--accent)]',
              )}
              style={{ left: `${left}%`, top: `${top}%` }}
              aria-label={event.title}
            >
              {event.attendees}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return <div ref={containerRef} className={cn('panel min-h-[420px] overflow-hidden', className)} />
}
