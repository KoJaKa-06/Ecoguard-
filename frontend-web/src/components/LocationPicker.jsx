import { useEffect, useRef } from 'react'
import L from 'leaflet'

export default function LocationPicker({ lat, lng, onPick }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return
    mapInstance.current = L.map(mapRef.current).setView([33.5, -5.11], 12)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current)

    mapInstance.current.on('click', (e) => {
      onPick(e.latlng.lat, e.latlng.lng)
    })
  }, [])

  useEffect(() => {
    if (!mapInstance.current) return
    if (markerRef.current) markerRef.current.remove()
    if (lat && lng) {
      const icon = L.divIcon({
        className: '',
        html: `<div style="
          width: 32px; height: 32px;
          background: #0d9488;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
          animation: dropIn 0.3s ease-out;
        "></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })
      markerRef.current = L.marker([lat, lng], { icon }).addTo(mapInstance.current)
      markerRef.current.bindPopup(
        `<strong>Report Location</strong><br/>${lat.toFixed(5)}, ${lng.toFixed(5)}`
      ).openPopup()
    }
  }, [lat, lng])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapRef} style={{ height: '280px', borderRadius: '12px', width: '100%' }} />
      {!lat && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.95)', padding: '0.75rem 1.25rem', borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', pointerEvents: 'none',
          fontSize: '0.85rem', color: '#475569', fontWeight: 600, textAlign: 'center',
          animation: 'pulse 2s infinite',
        }}>
          Click on the map to mark the exact location
        </div>
      )}
    </div>
  )
}
