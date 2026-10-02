import { useState } from 'react'
import LocationSelector from './components/LocationSelector'
import PredictionCard from './components/PredictionCard'
import MapView from './components/MapView'
import HarvestCalculator from './components/HarvestCalculator'
import { predictByLocation } from './api/client'
import { ThemeProvider, useTheme } from './context/ThemeContext'


// ---------------------------------------------------------------------------
// SeasonBadge — tiny inline component, no separate file needed
// ---------------------------------------------------------------------------
const CONDITION_BADGE_STYLES = {
  rainy: 'bg-cyan-900/60 text-cyan-300 border-cyan-700',
  cloudy: 'bg-amber-900/60 text-amber-300 border-amber-700',
  sunny: 'bg-orange-900/60 text-orange-300 border-orange-700',
}

const CONDITION_ICONS = {
  rainy: '🌧',
  cloudy: '☁️',
  sunny: '☀️',
}

function SeasonBadge({ season, condition }) {
  if (!season || !condition) return null
  const badgeClass = CONDITION_BADGE_STYLES[condition] ?? 'bg-slate-700 text-slate-300 border-slate-600'
  const icon = CONDITION_ICONS[condition] ?? '🌡'
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${badgeClass}`}>
      {icon} {season}
    </span>
  )
}

// ---------------------------------------------------------------------------
// AppInner — consumes useTheme so it lives inside ThemeProvider
// ---------------------------------------------------------------------------
function AppInner() {
  const { condition, season, setWeather } = useTheme()

  const [selectedCity, setSelectedCity] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Core handler: called from both the dropdown and the map.
  // `city` is always an object: { name, lat, lon }
  async function handleLocationPick(city) {
    setSelectedCity(city)
    setPrediction(null)
    setError(null)
    setLoading(true)

    try {
      const data = await predictByLocation(city.lat, city.lon)
      setPrediction(data)
      setWeather(data.rain_probability)
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Adapter for the map: it calls onSelect(lat, lon, name); we wrap
  // it into an object and pass it to handleLocationPick.
  function handleMapSelect(lat, lon, name) {
    handleLocationPick({ name, lat, lon })
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-8 rain-header rounded-xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-3xl font-bold">Rainfall Harvesting System</h1>
              <p className="text-slate-400 mt-1">
                AI-powered rainfall prediction and rainwater harvesting optimization
              </p>
            </div>
            <SeasonBadge season={season} condition={condition} />
          </div>
        </header>

        {/* Map (top) */}
        <div className="mb-6">
          <MapView
            lat={selectedCity?.lat ?? null}
            lon={selectedCity?.lon ?? null}
            onSelect={handleMapSelect}
          />
        </div>

        {/* Location selector */}
        <div className="mb-6">
          <LocationSelector
            selected={selectedCity}
            onChange={handleLocationPick}
          />
        </div>

        {/* Prediction display */}
        <PredictionCard
          data={prediction}
          loading={loading}
          error={error}
          locationName={selectedCity?.name ?? ''}
        />

        {/* Harvesting calculator */}
        <div className="mt-6">
          <HarvestCalculator
            predictedRainfall={prediction?.expected_rainfall_mm ?? null}
            locationName={selectedCity?.name ?? ''}
          />
        </div>

      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// App — wraps AppInner with ThemeProvider
// ---------------------------------------------------------------------------
function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}

export default App