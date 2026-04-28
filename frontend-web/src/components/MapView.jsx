import { useEffect, useRef } from 'react'
import L from 'leaflet'

const CATEGORY_COLORS = {
  Wildfire: '#ef4444',
  Pollution: '#8b5cf6',
  'Snow Closure': '#3b82f6',
  'Illegal Dumping': '#f59e0b',
  'Water Contamination': '#06b6d4',
  Deforestation: '#22c55e',
}

const CATEGORY_ICONS = {
  Wildfire: '🔥',
  Pollution: '☣',
  'Snow Closure': '❄',
  'Illegal Dumping': '🗑',
  'Water Contamination': '💧',
  Deforestation: '🌲',
}

const URGENCY_SIZES = {
  Critical: 22,
  High: 18,
  Medium: 15,
  Low: 12,
}

export default function MapView({ reports = [], selectedId, onSelect }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    mapInstance.current = L.map(mapRef.current).setView([33.5, -5.11], 11)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current)
  }, [])

  useEffect(() => {
    if (!mapInstance.current) return

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    reports.forEach(r => {
      if (!r.latitude || !r.longitude) return
      const color = CATEGORY_COLORS[r.category] || '#64748b'
      const size = URGENCY_SIZES[r.urgency] || 12
      const icon_glyph = CATEGORY_ICONS[r.category] || '?'
      const isSelected = r.id === selectedId
      const isCritical = r.urgency === 'Critical'

      const ringHtml = isCritical
        ? `<span style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${color};opacity:0.6;animation:pulseRing 1.6s ease-out infinite;"></span>`
        : ''

      const icon = L.divIcon({
        className: 'eco-marker',
        html: `<div style="position:relative;display:inline-block;">
          ${ringHtml}
          <div style="
            position: relative;
            width: ${size * 2}px;
            height: ${size * 2}px;
            background: linear-gradient(135deg, ${color}, ${color}dd);
            border-radius: 50%;
            border: ${isSelected ? '3px solid #0f172a' : '2.5px solid white'};
            box-shadow: ${isSelected ? '0 6px 18px rgba(0,0,0,0.45)' : '0 3px 8px rgba(0,0,0,0.3)'};
            transform: ${isSelected ? 'scale(1.35)' : 'scale(1)'};
            transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${Math.max(10, size - 2)}px;
            color: white;
            line-height: 1;
          ">${icon_glyph}</div>
        </div>`,
        iconSize: [size * 2, size * 2],
        iconAnchor: [size, size],
      })

      const marker = L.marker([r.latitude, r.longitude], { icon })
        .addTo(mapInstance.current)
        .bindPopup(`
          <strong>${r.category}</strong><br/>
          ${r.location}<br/>
          <span style="font-size:0.8em;color:#64748b">${r.status} | ${r.urgency || 'Unassigned'}</span>
        `)

      if (onSelect) {
        marker.on('click', () => onSelect(r.id))
      }

      markersRef.current.push(marker)
    })
  }, [reports, selectedId, onSelect])

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
}
