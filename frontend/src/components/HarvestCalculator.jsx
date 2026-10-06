/**
 * HarvestCalculator: form + result display for rainwater harvesting.
 *
 * Props:
 *   - predictedRainfall: number | null — from the ML prediction (mm)
 *   - locationName: string — the currently selected location name
 *
 * Supports two modes:
 *   - Residential: rooftop harvesting for a household
 *   - Farm: land-based harvesting for irrigation and cattle
 */

import { useEffect, useState } from 'react'
import { harvest, getRoofMaterials } from '../api/client'
import CostRoiCard from './CostRoiCard'
import RecommendationCard from './RecommendationCard'

export default function HarvestCalculator({ predictedRainfall, locationName }) {
  // ---- Usage mode ----
  const [usageType, setUsageType] = useState('residential')  // 'residential' | 'farm'

  // ---- Form state ----
  const [areaM2, setAreaM2] = useState(150)
  const [roofMaterial, setRoofMaterial] = useState('concrete')
  const [householdSize, setHouseholdSize] = useState(4)
  const [includeFirstFlush, setIncludeFirstFlush] = useState(true)
  const [includeFiltration, setIncludeFiltration] = useState(true)

  // ---- Rainfall (auto-filled or overridden) ----
  const [useRainfall, setUseRainfall] = useState(true)
  const [rainfall, setRainfall] = useState(predictedRainfall ?? 0)

  useEffect(() => {
    if (useRainfall && predictedRainfall != null) {
      setRainfall(predictedRainfall)
    }
  }, [predictedRainfall, useRainfall])

  // ---- Materials (from backend) ----
  const [materials, setMaterials] = useState([])

  useEffect(() => {
    getRoofMaterials()
      .then(setMaterials)
      .catch(() => setMaterials([]))
  }, [])

  // ---- Result state ----
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [paybackYears, setPaybackYears] = useState(null)

  // When user switches mode, set sensible defaults
  function switchMode(next) {
    if (next === usageType) return
    setUsageType(next)
    setResult(null)
    setError(null)
    if (next === 'farm') {
      setAreaM2(4000)              // ~1 acre
      setRoofMaterial('green')     // vegetated land
      setHouseholdSize(2)
      setIncludeFirstFlush(false)  // not relevant for open land
      setIncludeFiltration(false)
    } else {
      setAreaM2(150)
      setRoofMaterial('concrete')
      setHouseholdSize(4)
      setIncludeFirstFlush(true)
      setIncludeFiltration(true)
    }
  }

  async function handleCalculate() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await harvest({
        rainfall_mm: Number(rainfall),
        area_m2: Number(areaM2),
        roof_material: roofMaterial,
        household_size: Number(householdSize),
        include_first_flush: includeFirstFlush,
        include_filtration: includeFiltration,
      })
      setResult(data)
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Calculation failed'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const isFarm = usageType === 'farm'
  const noPrediction = predictedRainfall == null

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold mb-4">
          🧮 Rainwater Harvesting Calculator
        </h2>

        {/* Usage mode toggle */}
        <div className="mb-5">
          <label className="block text-sm text-slate-400 mb-2">
            🎯 What are you harvesting for?
          </label>
          <div className="flex rounded-lg overflow-hidden border border-slate-700 w-full sm:w-auto">
            <button
              onClick={() => switchMode('residential')}
              className={`flex-1 sm:flex-none px-5 py-2 text-sm font-medium transition ${
                !isFarm ? 'bg-[var(--color-accent)] text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              🏠 Residential
            </button>
            <button
              onClick={() => switchMode('farm')}
              className={`flex-1 sm:flex-none px-5 py-2 text-sm font-medium transition ${
                isFarm ? 'bg-[var(--color-accent)] text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              🌾 Farm / Land
            </button>
          </div>
        </div>

        {noPrediction && (
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 mb-4 text-sm text-amber-200">
            ⓘ No prediction yet. Select a location above for auto-fill, or enter rainfall manually below.
          </div>
        )}

        {predictedRainfall != null && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 mb-4 text-sm text-blue-200">
            📍 {locationName?.split(',')[0]?.trim() || 'Location'} — predicted rainfall tomorrow:{' '}
            <strong>{predictedRainfall.toFixed(2)} mm</strong>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Rainfall */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Rainfall (mm)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={rainfall}
              onChange={(e) => setRainfall(e.target.value)}
              disabled={useRainfall && predictedRainfall != null}
              className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-2 disabled:opacity-60"
            />
            <label className="flex items-center gap-2 text-xs text-slate-400 mt-2">
              <input
                type="checkbox"
                checked={useRainfall}
                onChange={(e) => {
                  setUseRainfall(e.target.checked)
                  if (e.target.checked && predictedRainfall != null) {
                    setRainfall(predictedRainfall)
                  }
                }}
              />
              Use predicted value (uncheck to override)
            </label>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              {isFarm ? 'Land area (m²)' : 'Roof area (m²)'}
            </label>
            <input
              type="number"
              min="1"
              value={areaM2}
              onChange={(e) => setAreaM2(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-2"
            />
            {isFarm && (
              <div className="text-xs text-slate-500 mt-1">
                1 acre ≈ 4,047 m² · 1 hectare ≈ 10,000 m²
              </div>
            )}
          </div>

          {/* Material */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              {isFarm ? 'Land surface' : 'Roof material'}
            </label>
            <select
              value={roofMaterial}
              onChange={(e) => setRoofMaterial(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-2"
            >
              {materials.map((m) => (
                <option key={m.key} value={m.key}>
                  {friendlyMaterialName(m.key, isFarm)} (runoff {m.coefficient})
                </option>
              ))}
            </select>
          </div>

          {/* Household / Demand */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              {isFarm ? 'Cattle + irrigation need (units)' : 'Household size (people)'}
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={householdSize}
              onChange={(e) => setHouseholdSize(e.target.value)}
              className="w-full bg-slate-900 text-white border border-slate-700 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        {/* Toggles — hidden in farm mode */}
        {!isFarm && (
          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={includeFirstFlush}
                onChange={(e) => setIncludeFirstFlush(e.target.checked)}
              />
              Include first-flush diverter
            </label>
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={includeFiltration}
                onChange={(e) => setIncludeFiltration(e.target.checked)}
              />
              Include sand/charcoal filtration
            </label>
          </div>
        )}

        <button
          onClick={handleCalculate}
          disabled={loading}
          className="mt-6 w-full md:w-auto bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          {loading ? 'Calculating…' : 'Calculate Harvest'}
        </button>

        {error && (
          <div className="mt-4 bg-red-900/40 border border-red-500 rounded-lg p-3 text-sm text-red-200">
            ❌ {error}
          </div>
        )}
      </div>

      {result && (
        <>
          <HarvestResult result={result} isFarm={isFarm} />
          <CostRoiCard result={result} cityName={locationName} onPaybackChange={setPaybackYears} />
          <RecommendationCard result={result} paybackYears={paybackYears} />
        </>
      )}
    </div>
  )
}

function friendlyMaterialName(key, isFarm) {
  if (isFarm) {
    const farmNames = {
      concrete: 'Paved / hard surface',
      tile: 'Tiled barn roof',
      metal: 'Metal shed roof',
      asbestos: 'Asbestos barn roof',
      green: 'Vegetated land',
    }
    return farmNames[key] || key
  }
  const homeNames = {
    concrete: 'Concrete / RCC',
    tile: 'Tile',
    metal: 'Metal sheet',
    asbestos: 'Asbestos',
    green: 'Green roof',
  }
  return homeNames[key] || key
}

function HarvestResult({ result, isFarm }) {
  const netLiters = result.net_harvest_liters
  const days = result.days_of_supply
  const tank = result.recommended_tank_liters

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-2xl p-6 border border-blue-700">
        <div className="text-sm text-blue-300 mb-1">💧 Net Harvestable Water</div>
        <div className="text-4xl font-bold text-white">
          {netLiters.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          <span className="text-xl text-blue-300 font-normal ml-2">liters</span>
        </div>
        <div className="text-sm text-blue-300 mt-2">
          {isFarm
            ? `That's enough to irrigate approximately ${(netLiters / 5000).toFixed(1)} acres for one season`
            : `That's ${days.toFixed(2)} days of supply for your ${result.household_size}-person household`}
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <h3 className="font-semibold mb-4">📊 Water Balance Breakdown</h3>
        <table className="w-full text-sm">
          <tbody>
            <BreakdownRow label="Gross rain on surface" value={result.gross_rain_liters} />
            <BreakdownRow label="– First-flush discarded" value={-result.first_flush_discarded_liters} negative />
            <BreakdownRow label="– Runoff loss" value={-result.runoff_lost_liters} negative />
            <BreakdownRow label="– Conveyance loss (7%)" value={-result.conveyance_lost_liters} negative />
            <BreakdownRow label="– Filtration loss (5%)" value={-result.filtration_lost_liters} negative />
            <tr className="border-t border-slate-700">
              <td className="py-2 font-semibold text-white">= Net harvest</td>
              <td className="py-2 text-right font-semibold text-blue-300">
                {netLiters.toLocaleString(undefined, { maximumFractionDigits: 2 })} L
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
        <div className="text-sm text-slate-400 mb-1">
          {isFarm ? '🛢 Recommended Storage (Farm Pond)' : '🛢 Recommended Tank Size'}
        </div>
        <div className="text-3xl font-bold text-white">
          {tank.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          <span className="text-lg text-slate-400 font-normal ml-2">liters</span>
        </div>
        <div className="text-xs text-slate-500 mt-2">
          {isFarm
            ? 'Recommend an open farm pond or lined storage structure'
            : `Based on ${result.daily_demand_liters} L/day × ${result.tank_buffer_days} days buffer`}
        </div>
      </div>
    </div>
  )
}

function BreakdownRow({ label, value, negative }) {
  const sign = negative ? '−' : ''
  const abs = Math.abs(value)
  return (
    <tr>
      <td className="py-1 text-slate-400">{label}</td>
      <td className={`py-1 text-right ${negative ? 'text-red-300' : 'text-slate-200'}`}>
        {sign}{abs.toLocaleString(undefined, { maximumFractionDigits: 2 })} L
      </td>
    </tr>
  )
}