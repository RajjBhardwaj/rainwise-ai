/**
 * LocationSelector: dropdown of preset Indian cities + indicator for custom locations.
 */

const CITIES = [
  { name: 'Mumbai',    lat: 19.076,  lon: 72.8777 },
  { name: 'Delhi',     lat: 28.6139, lon: 77.209 },
  { name: 'Chennai',   lat: 13.0827, lon: 80.2707 },
  { name: 'Kolkata',   lat: 22.5726, lon: 88.3639 },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', lat: 17.385,  lon: 78.4867 },
  { name: 'Pune',      lat: 18.5204, lon: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { name: 'Jaipur',    lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow',   lat: 26.8467, lon: 80.9462 },
]

export default function LocationSelector({ selected, onChange }) {
  // Is the current selection one of the preset cities?
  const matchedCity = selected
    ? CITIES.find((c) => c.name === selected.name)
    : null

  const handleChange = (e) => {
    const city = CITIES.find((c) => c.name === e.target.value)
    if (city) onChange(city)
  }

  return (
    <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
      <label
        htmlFor="city-select"
        className="block text-sm text-slate-400 mb-2"
      >
        📍 Select a preset city (or use the map above)
      </label>

      <select
        id="city-select"
        value={matchedCity?.name ?? ''}
        onChange={handleChange}
        className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
      >
        <option value="" disabled>
          Choose a city...
        </option>
        {CITIES.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Info block: shows the ACTUAL selected location, whatever it is */}
      {selected && (
        <div className="mt-3 text-sm">
          {matchedCity ? (
            <span className="text-slate-500">
              {selected.lat}° N, {selected.lon}° E
            </span>
          ) : (
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
              <div className="text-blue-300 font-medium truncate">
                📍 {selected.name}
              </div>
              <div className="text-xs text-blue-400/70 mt-1">
                {selected.lat.toFixed(4)}° N, {selected.lon.toFixed(4)}° E
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}