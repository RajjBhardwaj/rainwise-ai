/**
 * MapView: interactive Leaflet map with search box and marker.
 *
 * Props:
 *   - lat, lon: currently selected coordinates (or null for default view)
 *   - onSelect: callback (lat, lon, name) -> called when the user picks a location
 *               (via search now; via map click in Step 13.4)
 */

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet'

import L from 'leaflet'

// Marker icon fix for Vite bundling
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const DEFAULT_CENTER = [22.5, 79.0]
const DEFAULT_ZOOM = 5

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'

/**
 * Flies the map to a new location when lat/lon props change.
 */
function MapController({ lat, lon }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lon != null) {
      map.flyTo([lat, lon], 8, { duration: 1.2 })
    }
  }, [lat, lon, map])
  return null
}
/**
 * ClickHandler: listens for click events on the map and calls onMapClick.
 * Must be inside <MapContainer>.
 */
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onMapClick(lat, lng)
    },
  })
  return null
}

/**
 * Search box with Nominatim geocoding + result dropdown.
 */
function SearchBox({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  // When the user types, debounce for 600ms then fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 3) {
      setResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const url = `${NOMINATIM_URL}?format=json&limit=5&q=${encodeURIComponent(query)}`
        const res = await fetch(url)
        const data = await res.json()
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 600)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const handlePick = (r) => {
    setQuery(r.display_name)
    setResults([])
    onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name)
  }

  return (
    <div className="relative">
      <label className="block text-sm text-slate-400 mb-2">
        🔍 Search for a place
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. Mumbai, Chennai, Varanasi..."
        className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
      />
      {loading && (
        <div className="text-xs text-slate-500 mt-1">Searching...</div>
      )}
      {results.length > 0 && (
        <ul className="absolute z-[1000] mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
          {results.map((r) => (
            <li
              key={r.place_id}
              onClick={() => handlePick(r)}
              className="px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 cursor-pointer border-b border-slate-800 last:border-b-0"
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function MapView({ lat, lon, onSelect }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <div className="mb-4">
        <SearchBox onSelect={onSelect} />
        <p className="text-xs text-slate-500 mt-2">
          💡 Or click anywhere on the map to predict for that location
        </p>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ height: '420px' }}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController lat={lat} lon={lon} />

          <ClickHandler
            onMapClick={(lat, lng) =>
              onSelect(lat, lng, `Clicked location (${lat.toFixed(3)}, ${lng.toFixed(3)})`)
            }
          />
          {lat != null && lon != null && (
            <Marker position={[lat, lon]}>
              <Popup>
                Lat: {lat.toFixed(4)}
                <br />
                Lon: {lon.toFixed(4)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  )
}