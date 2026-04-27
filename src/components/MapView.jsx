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

const URGENCY_SIZES = {
  Critical: 18,
  High: 14,
  Medium: 11,
  Low: 8,
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
      const size = URGENCY_SIZES[r.urgency] || 8
      const isSelected = r.id === selectedId

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: ${size * 2}px;
          height: ${size * 2}px;
          background: ${color};
          border-radius: 50%;
          border: ${isSelected ? '3px solid #1a1a2e' : '2px solid white'};
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          opacity: 0.9;
          transform: ${isSelected ? 'scale(1.3)' : 'scale(1)'};
          transition: transform 0.2s;
        "></div>`,
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
