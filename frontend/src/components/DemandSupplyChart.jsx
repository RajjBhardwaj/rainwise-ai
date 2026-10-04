/**
 * DemandSupplyChart.jsx — Household Demand vs. Harvest Supply (Feature 7)
 *
 * Shows a 12-month ComposedChart with:
 *   - Monthly household water demand (flat line) — changes with householdSize
 *   - Monthly estimated harvest supply (area) — peaks in monsoon months
 *   - Shaded deficit area — months where supply < demand
 *
 * This component is self-contained: it manages its own inputs (householdSize,
 * roofAreaM2, annualRainfallMm) so it works on the Analytics tab without
 * requiring state to be lifted from HarvestCalculator.
 *
 * All values in LITRES. Chart updates instantly on any input change.
 * No API calls. No external dependencies beyond Recharts.
 *
 * ---- Supply calculation model ----
 *
 * Monthly multipliers below are approximate seasonal rainfall weights for India
 * (relative to the annual average; NOT engineering-grade data).
 * They are intentionally documented as approximations.
 *
 * Sum of all multipliers = 17.1
 * Monthly rainfall fraction = multiplier[m] / 17.1
 * Monthly supply (L) = roofAreaM2 × runoffCoeff × annualRainfallMm × fraction × 1000
 *
 * ---- Demand model ----
 *
 * Monthly demand (L) = householdSize × 100 L/person/day × 30 days
 */

import { useState, useMemo } from 'react'
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

// ---------------------------------------------------------------------------
// Seasonal rainfall distribution multipliers for India (monthly approximation)
// Index: 0=Jan … 11=Dec
// Source: rough climatological averages, not location-specific.
// ---------------------------------------------------------------------------
const MONTHLY_MULTIPLIERS = [
  0.2,   // Jan
  0.3,   // Feb
  0.3,   // Mar
  0.4,   // Apr
  0.8,   // May
  2.5,   // Jun
  4.0,   // Jul  ← peak monsoon
  3.8,   // Aug
  3.0,   // Sep
  1.2,   // Oct
  0.4,   // Nov
  0.2,   // Dec
]
const MULTIPLIER_SUM = MONTHLY_MULTIPLIERS.reduce((a, b) => a + b, 0)  // 17.1

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Runoff coefficient used in the supply estimate (matches the default roof type)
const DEFAULT_RUNOFF_COEFF = 0.85

// ---------------------------------------------------------------------------
// Pure data builder — called in useMemo, no side effects
// ---------------------------------------------------------------------------
function buildChartData({ householdSize, roofAreaM2, annualRainfallMm }) {
  const monthlyDemand = householdSize * 100 * 30      // L per month
  const annualSupplyL = roofAreaM2 * DEFAULT_RUNOFF_COEFF * annualRainfallMm

  return MONTH_LABELS.map((month, i) => {
    const fraction = MONTHLY_MULTIPLIERS[i] / MULTIPLIER_SUM
    const supply = Math.round(annualSupplyL * fraction)
    const demand = monthlyDemand
    const deficit = Math.max(0, demand - supply)   // L short of demand
    const surplus = Math.max(0, supply - demand)   // L above demand
    return { month, supply, demand, deficit, surplus }
  })
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const supply = payload.find(p => p.dataKey === 'supply')?.value ?? 0
  const demand = payload.find(p => p.dataKey === 'demand')?.value ?? 0
  const covered = supply >= demand ? '✅ Supply meets demand' : `⚠️ Shortfall: ${(demand - supply).toLocaleString()} L`
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs shadow-xl">
      <div className="font-semibold text-white mb-1">{label}</div>
      <div className="text-blue-300">Supply: {supply.toLocaleString()} L</div>
      <div className="text-orange-300">Demand: {demand.toLocaleString()} L</div>
      <div className="text-slate-400 mt-1">{covered}</div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Number input with label
// ---------------------------------------------------------------------------
function InputRow({ label, value, onChange, min, max, step, unit }) {
  return (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-24 bg-slate-900 text-white border border-slate-700 rounded-lg px-3 py-1.5 text-sm"
        />
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function DemandSupplyChart() {
  const [householdSize, setHouseholdSize]         = useState(4)
  const [roofAreaM2, setRoofAreaM2]               = useState(150)
  const [annualRainfallMm, setAnnualRainfallMm]   = useState(1200)

  const data = useMemo(
    () => buildChartData({ householdSize, roofAreaM2, annualRainfallMm }),
    [householdSize, roofAreaM2, annualRainfallMm]
  )

  const monthlyDemand = householdSize * 100 * 30
  const monthsCovered = data.filter(d => d.supply >= d.demand).length

  return (
    <div className="bg-[var(--color-bg-tint)] rounded-2xl p-6 border border-[var(--color-border)]">
      <h3 className="font-semibold text-white mb-1">📈 Household Demand vs. Harvest Supply</h3>
      <p className="text-xs text-slate-500 mb-5">
        Estimated monthly water budget · 12-month view · Approximations for India
      </p>

      {/* Controls */}
      <div className="flex flex-wrap gap-6 mb-6">
        <InputRow
          label="Household size (people)"
          value={householdSize}
          onChange={setHouseholdSize}
          min={1} max={50}
          unit="people"
        />
        <InputRow
          label="Roof / catchment area"
          value={roofAreaM2}
          onChange={setRoofAreaM2}
          min={10} max={5000}
          unit="m²"
        />
        <InputRow
          label="Annual rainfall estimate"
          value={annualRainfallMm}
          onChange={setAnnualRainfallMm}
          min={100} max={5000}
          step={50}
          unit="mm/year"
        />
      </div>

      {/* Summary stat */}
      <div className="flex gap-4 mb-6">
        <div className="bg-slate-900/60 rounded-xl px-4 py-2 border border-slate-700 text-sm">
          <span className="text-slate-400">Monthly demand: </span>
          <span className="text-white font-medium">{monthlyDemand.toLocaleString()} L</span>
        </div>
        <div className="bg-slate-900/60 rounded-xl px-4 py-2 border border-slate-700 text-sm">
          <span className="text-slate-400">Months supply ≥ demand: </span>
          <span className={`font-medium ${monthsCovered >= 6 ? 'text-green-400' : 'text-amber-400'}`}>
            {monthsCovered} / 12
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#475569' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            unit=" L"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '12px' }}
          />

          {/* Deficit shading — months where supply falls short */}
          <Area
            type="monotone"
            dataKey="deficit"
            fill="rgba(239,68,68,0.12)"
            stroke="transparent"
            name="Deficit (shortfall)"
            legendType="none"
          />

          {/* Harvest supply — blue filled area */}
          <Area
            type="monotone"
            dataKey="supply"
            fill="var(--color-accent)"
            fillOpacity={0.18}
            stroke="var(--color-accent)"
            strokeWidth={2}
            name="Monthly supply (harvest)"
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* Household demand — flat orange dashed line */}
          <Line
            type="monotone"
            dataKey="demand"
            stroke="#f97316"
            strokeWidth={2}
            strokeDasharray="5 4"
            name="Monthly demand"
            dot={false}
            activeDot={{ r: 4 }}
          />

          {/* Reference line at demand level (zero-gap visual anchor) */}
          <ReferenceLine
            y={monthlyDemand}
            stroke="#f97316"
            strokeOpacity={0.25}
            strokeDasharray="2 6"
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p className="text-xs text-slate-600 mt-4">
        * Monthly distribution uses approximate seasonal multipliers for India
        (not location-specific). Runoff coefficient assumed {DEFAULT_RUNOFF_COEFF}.
        Demand = household × 100 L/person/day × 30 days.
      </p>
    </div>
  )
}
