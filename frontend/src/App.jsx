

import { useState } from 'react'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { predictByLocation } from './api/client'
import NavBar from './components/NavBar'
import WeatherBackground from './components/WeatherBackground'

import DashboardPage from './pages/DashboardPage'
import CalculatorPage from './pages/CalculatorPage'

import AnalyticsPage from './pages/AnalyticsPage'


// ---------------------------------------------------------------------------
// Weather badge — shows current condition (Sunny / Cloudy / Rainy)
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

const CONDITION_LABELS = {
  rainy: 'Rainy',
  cloudy: 'Cloudy',
  sunny: 'Sunny',
}

function WeatherBadge({ condition }) {
  if (!condition) return null
  const badgeClass =
    CONDITION_BADGE_STYLES[condition] ??
    'bg-slate-700 text-slate-300 border-slate-600'
  const icon = CONDITION_ICONS[condition] ?? '🌡'
  const label = CONDITION_LABELS[condition] ?? condition
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${badgeClass}`}
    >
      {icon} {label}
    </span>
  )
}


// ---------------------------------------------------------------------------
// AppInner — holds all state and routes between pages
// ---------------------------------------------------------------------------
function AppInner() {
  const { condition, setWeather } = useTheme()

  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedCity, setSelectedCity] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  return (
     
    <div className="min-h-screen bg-slate-950 text-white relative">
      <WeatherBackground condition={condition} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-6 rain-header rounded-xl px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-3xl font-bold">Rainfall Harvesting System</h1>
              <p className="text-slate-400 mt-1">
                AI-powered rainfall prediction and rainwater harvesting optimization
              </p>
            </div>
            <WeatherBadge condition={condition} />
          </div>
        </header>

        {/* Navigation */}
        <NavBar currentPage={currentPage} onNavigate={setCurrentPage} />

        {/* Page content */}
        {currentPage === 'dashboard' && (
          <DashboardPage
            selectedCity={selectedCity}
            prediction={prediction}
            loading={loading}
            error={error}
            onLocationPick={handleLocationPick}
          />
        )}

        {currentPage === 'calculator' && (
          <CalculatorPage
            prediction={prediction}
            selectedCity={selectedCity}
          />
        )}

        

        {currentPage === 'analytics' && <AnalyticsPage />}

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