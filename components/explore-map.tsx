'use client'

import { useEffect, useRef, useState } from 'react'
import type * as Leaflet from 'leaflet'
import { Layers, LocateFixed, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { areaCenters, demoPosition } from '@/lib/map-data'
import type { DemoIntent, DemoUser } from '@/lib/poc-store'

interface Props {
  area: string
  people: DemoUser[]
  intents: DemoIntent[]
  userId: string
  selectedId?: string
  onSelect: (id: string) => void
}

export function ExploreMap({
  area,
  people,
  intents,
  userId,
  selectedId,
  onSelect,
}: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<Leaflet.Map | null>(null)
  const library = useRef<typeof Leaflet | null>(null)
  const layer = useRef<Leaflet.TileLayer | null>(null)
  const [ready, setReady] = useState(false)
  const [satellite, setSatellite] = useState(true)
  const [tileError, setTileError] = useState(false)
  const select = useRef(onSelect)
  select.current = onSelect

  useEffect(() => {
    let disposed = false
    let observer: ResizeObserver | undefined
    import('leaflet')
      .then((L) => {
        if (disposed || !container.current) return
        library.current = L
        map.current = L.map(container.current, {
          zoomControl: false,
          attributionControl: false,
          minZoom: 4,
          maxZoom: 18,
          zoomAnimation: !matchMedia('(prefers-reduced-motion: reduce)')
            .matches,
        }).setView(areaCenters[area] ?? areaCenters.Colombo, 14, {
          animate: false,
        })
        L.control
          .attribution({ position: 'topright', prefix: false })
          .addTo(map.current)
        observer = new ResizeObserver(() => map.current?.invalidateSize())
        observer.observe(container.current)
        setReady(true)
      })
      .catch(() => setTileError(true))
    return () => {
      disposed = true
      observer?.disconnect()
      map.current?.remove()
      map.current = null
    }
    // The map instance is created once; area changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ready || !map.current || !library.current) return
    layer.current?.remove()
    setTileError(false)
    layer.current = library.current
      .tileLayer(
        satellite
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: satellite
            ? 'Tiles &copy; Esri, Maxar, Earthstar Geographics'
            : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        },
      )
      .addTo(map.current)
    layer.current.on('tileerror', () => setTileError(true))
    layer.current.on('tileload', () => setTileError(false))
  }, [ready, satellite])

  useEffect(() => {
    if (!ready) return
    map.current?.setView(areaCenters[area] ?? areaCenters.Colombo, 14, {
      animate: false,
    })
    map.current?.panBy(window.innerWidth <= 700 ? [0, 95] : [-140, 0], {
      animate: false,
    })
  }, [area, ready])

  useEffect(() => {
    const L = library.current
    if (!ready || !map.current || !L) return
    const group = L.layerGroup().addTo(map.current)
    people.forEach((person) => {
      const root = document.createElement('div')
      root.className = `person-pin ${person.role === 'local_guide' ? 'buddy-pin' : ''} ${selectedId === person.id ? 'selected-pin' : ''} ${person.id === userId ? 'self-pin' : ''}`
      const request = intents.find(
        (intent) => intent.active && intent.travelerId === person.id,
      )
      if (request && person.id === selectedId) {
        const bubble = document.createElement('span')
        bubble.className = 'pin-bubble'
        bubble.textContent = request.message
        root.append(bubble)
      }
      const face = document.createElement('span')
      face.className = 'pin-face'
      face.textContent = person.name.slice(0, 1).toUpperCase()
      if (person.avatar) {
        const img = document.createElement('img')
        img.src = person.avatar
        img.alt = ''
        img.onload = () => {
          face.textContent = ''
          face.append(img)
        }
      }
      root.append(face)
      const name = document.createElement('span')
      name.className = 'pin-name'
      name.textContent =
        person.id === userId ? 'You' : person.name.split(' ')[0]
      root.append(name)
      if (person.role === 'local_guide') {
        const badge = document.createElement('span')
        badge.className = 'pin-badge'
        badge.textContent = '✦'
        root.append(badge)
      }
      L.marker(demoPosition(person), {
        icon: L.divIcon({
          html: root,
          className: 'roam-marker',
          iconSize: [64, 80],
          iconAnchor: [32, 40],
        }),
        title: `View ${person.name}'s profile`,
        keyboard: true,
        zIndexOffset: selectedId === person.id ? 1000 : 0,
      })
        .on('click', () => select.current(person.id))
        .addTo(group)
    })
    return () => {
      group.remove()
    }
  }, [people, intents, ready, selectedId, userId])

  return (
    <>
      <div
        ref={container}
        className="explore-map"
        aria-label={`Interactive map of ${area}`}
      />
      {tileError && (
        <p className="map-error" role="status">
          Map tiles couldn’t load. Check your connection or switch map style.
        </p>
      )}
      <div className="map-controls">
        <Button
          variant="outline"
          size="icon-lg"
          aria-label={satellite ? 'Show street map' : 'Show satellite map'}
          aria-pressed={satellite}
          onClick={() => setSatellite(!satellite)}
        >
          <Layers />
        </Button>
        <div className="zoom-controls">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Zoom in"
            onClick={() => map.current?.zoomIn()}
          >
            <Plus />
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="Zoom out"
            onClick={() => map.current?.zoomOut()}
          >
            <Minus />
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon-lg"
          aria-label={`Recenter on ${area}`}
          onClick={() => {
            map.current?.setView(areaCenters[area] ?? areaCenters.Colombo, 14, {
              animate: false,
            })
            map.current?.panBy(window.innerWidth <= 700 ? [0, 95] : [-140, 0], {
              animate: false,
            })
          }}
        >
          <LocateFixed />
        </Button>
      </div>
    </>
  )
}
