 /**
 * PredictionCard: displays the prediction result (or loading/empty states).
 *
 * Props:
 *   - data: the response from /api/predict-by-location, or null
 *   - loading: boolean
 *   - error: string or null
 *   - locationName: name of the selected city (for the header)
 *
 * Card backgrounds + borders + accent colors are driven by CSS custom
 * properties set by ThemeContext / weatherTheme.js, using Tailwind's
 * arbitrary-value syntax: bg-[var(--color-bg-tint)], etc.
 */

function probabilityLabel(p) {
  if (p >= 0.7) return 'Likely to rain'
  if (p >= 0.3) return 'Possibly rain'
  return 'Unlikely to rain'
}

export default function PredictionCard({ data, loading, error, locationName }) {
  // --- Loading state ---
  if (loading) {
    return (
      <div className="bg-[var(--color-bg-tint)] rounded-2xl p-8 border border-[var(--color-border)] text-center">
        <div className="text-slate-300 text-lg">🌧 Fetching weather and predicting...</div>
        <div className="text-slate-500 text-sm mt-2">This may take a few seconds</div>
      </div>
    )
  }

  // --- Error state ---
  if (error) {
    return (
      <div className="bg-red-900/30 rounded-2xl p-6 border border-red-700">
        <div className="font-semibold text-red-300 mb-1">Prediction failed</div>
        <div className="text-sm text-red-200">{error}</div>
      </div>
    )
  }

  // --- Empty state ---
  if (!data) {
    return (
      <div className="bg-[var(--color-bg-tint)] rounded-2xl p-8 border border-[var(--color-border)] text-center">
        <div className="text-slate-400">Select a location above to see predictions</div>
      </div>
    )
  }

  // --- Result state ---
  const { rain_probability, will_rain, expected_rainfall_mm, weather_today } = data
  const probPercent = Math.round(rain_probability * 100)

  return (
    <div className="space-y-6">
      {/* Prediction cards row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rain probability */}
        <div className="bg-[var(--color-bg-tint)] rounded-2xl p-6 border border-[var(--color-border)]">
          <div className="text-sm text-slate-400 mb-2">🌧 Rain Probability</div>
          <div className="text-4xl font-bold text-[var(--color-text-accent)]">
            {probPercent}%
          </div>
          <div className="w-full bg-slate-900 rounded-full h-3 mt-4">
            <div
              className="bg-[var(--color-accent)] h-3 rounded-full transition-all duration-500"
              style={{ width: `${probPercent}%` }}
            />
          </div>
          <div className="text-sm mt-2 text-[var(--color-text-accent)]">
            {will_rain ? '✓ ' : '✗ '}
            {probabilityLabel(rain_probability)}
          </div>
        </div>

        {/* Expected rainfall */}
        <div className="bg-[var(--color-bg-tint)] rounded-2xl p-6 border border-[var(--color-border)]">
          <div className="text-sm text-slate-400 mb-2">💧 Expected Rainfall</div>
          <div className="text-4xl font-bold text-[var(--color-text-accent)]">
            {expected_rainfall_mm.toFixed(2)}
            <span className="text-xl text-slate-400 font-normal ml-1">mm</span>
          </div>
          <div className="text-sm text-slate-500 mt-4">
            Predicted for tomorrow
          </div>
        </div>

        {/* Temperature — intentionally text-white; temperature is neutral */}
        <div className="bg-[var(--color-bg-tint)] rounded-2xl p-6 border border-[var(--color-border)]">
          <div className="text-sm text-slate-400 mb-2">🌡 Temperature (today)</div>
          <div className="text-4xl font-bold text-white">
            {weather_today.temperature_2m_max.toFixed(1)}
            <span className="text-xl text-slate-400 font-normal">°C</span>
          </div>
          <div className="text-sm text-slate-500 mt-4">
            Min: {weather_today.temperature_2m_min.toFixed(1)}°C
          </div>
        </div>
      </div>

      {/* Weather details grid */}
      <div className="bg-[var(--color-bg-tint)] rounded-2xl p-6 border border-[var(--color-border)]">
        <h3 className="text-slate-200 font-semibold mb-4">
          📊 Today's Weather — {locationName} ({weather_today.date})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <WeatherRow icon="💧" label="Humidity" value={`${weather_today.relative_humidity_2m_mean}%`} />
          <WeatherRow icon="☁" label="Cloud cover" value={`${weather_today.cloud_cover_mean}%`} />
          <WeatherRow icon="🌬" label="Wind" value={`${weather_today.wind_speed_10m_max} km/h`} />
          <WeatherRow icon="📊" label="Pressure" value={`${weather_today.surface_pressure_mean} hPa`} />
          <WeatherRow icon="☀" label="Radiation" value={`${weather_today.shortwave_radiation_sum} MJ/m²`} />
          <WeatherRow icon="🌧" label="Rain today" value={`${weather_today.precipitation_sum} mm`} />
        </div>
      </div>
    </div>
  )
}

function WeatherRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between bg-slate-900/50 rounded-lg px-4 py-3">
      <span className="text-slate-400">
        {icon} {label}
      </span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}