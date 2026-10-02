/**
 * CostRoiCard.jsx — Cost & ROI Estimator (Feature 5)
 *
 * Displays the estimated investment, annual savings, payback period, and
 * 15-year net savings for a rainwater harvesting system.
 *
 * Props:
 *   result          — the /api/harvest response object (must not be null)
 *   onPaybackChange — callback(paybackYears: number | null) called whenever
 *                     the payback calculation changes (used by parent to feed
 *                     RecommendationCard)
 *
 * All calculations are pure client-side arithmetic — no API calls.
 * Currency: Indian Rupees, formatted with Intl.NumberFormat('en-IN').
 */

import { useState, useEffect, useMemo } from 'react'
import {
  TANK_COSTS,
  WATER_SOURCE_COSTS,
  SYSTEM_FIXED_COSTS,
  PROJECTION_YEARS,
  ANNUAL_EVENTS_ESTIMATE,
  INR,
} from '../config/costs'

// ---------------------------------------------------------------------------
// ROI calculator (pure function — easy to test in isolation)
// ---------------------------------------------------------------------------
function computeRoi({ result, tankType, waterSource }) {
  const tankSpec = TANK_COSTS[tankType]
  const sourceSpec = WATER_SOURCE_COSTS[waterSource]

  // --- Investment ---
  const tankCost = result.recommended_tank_liters * tankSpec.costPerLiterCapacity
  const fixedTotal = Object.values(SYSTEM_FIXED_COSTS).reduce((s, v) => s + v.cost, 0)
  const totalInvestment = tankCost + fixedTotal

  // --- Annual savings ---
  // Approximate annual harvest by scaling the single-event result.
  // See ANNUAL_EVENTS_ESTIMATE in costs.js for rationale.
  const annualHarvestL = result.net_harvest_liters * ANNUAL_EVENTS_ESTIMATE
  const annualSavings = (annualHarvestL / 1000) * sourceSpec.costPer1000L

  // --- Payback & projection ---
  const paybackYears = annualSavings > 0
    ? totalInvestment / annualSavings
    : Infinity
  const net15YearSavings = annualSavings * PROJECTION_YEARS - totalInvestment

  return {
    tankCost,
    fixedTotal,
    totalInvestment,
    annualHarvestL,
    annualSavings,
    paybackYears,
    net15YearSavings,
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CostRow({ label, value, dimmed }) {
  return (
    <div className={`flex justify-between text-sm py-1 ${dimmed ? 'text-slate-500' : 'text-slate-300'}`}>
      <span>{label}</span>
      <span className="font-medium tabular-nums">{INR.format(value)}</span>
    </div>
  )
}

function MetricTile({ label, value, sub, highlight }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight
      ? 'bg-[var(--color-bg-tint)] border-[var(--color-border)]'
      : 'bg-slate-900/60 border-slate-700'
    }`}>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-xl font-bold ${highlight ? 'text-[var(--color-text-accent)]' : 'text-white'}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}

function ToggleGroup({ label, options, value, onChange }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1.5">{label}</div>
      <div className="flex rounded-lg overflow-hidden border border-slate-700">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 py-1.5 text-xs font-medium transition ${
              value === opt.value
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function CostRoiCard({ result, onPaybackChange }) {
  const [tankType, setTankType] = useState('plastic')
  const [waterSource, setWaterSource] = useState('municipal')

  const roi = useMemo(
    () => computeRoi({ result, tankType, waterSource }),
    [result, tankType, waterSource]
  )

  // Notify parent whenever payback changes (feeds RecommendationCard)
  useEffect(() => {
    onPaybackChange?.(Number.isFinite(roi.paybackYears) ? roi.paybackYears : null)
  }, [roi.paybackYears, onPaybackChange])

  const paybackDisplay = Number.isFinite(roi.paybackYears)
    ? `${roi.paybackYears.toFixed(1)} years`
    : 'N/A'

  const net15Positive = roi.net15YearSavings > 0

  return (
    <div className="bg-[var(--color-bg-tint)] rounded-2xl p-6 border border-[var(--color-border)]">
      <h3 className="font-semibold text-white mb-5">
        💰 Cost &amp; ROI Estimator
      </h3>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <ToggleGroup
          label="Tank type"
          value={tankType}
          onChange={setTankType}
          options={[
            { value: 'plastic', label: '🪣 Plastic / HDPE' },
            { value: 'rcc',     label: '🧱 RCC / Ferro-cement' },
          ]}
        />
        <ToggleGroup
          label="Current water source (what you're replacing)"
          value={waterSource}
          onChange={setWaterSource}
          options={[
            { value: 'municipal', label: '🚰 Municipal' },
            { value: 'tanker',    label: '🚛 Tanker' },
          ]}
        />
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MetricTile
          label="Total investment"
          value={INR.format(roi.totalInvestment)}
          sub="Tank + system"
        />
        <MetricTile
          label="Annual savings"
          value={INR.format(roi.annualSavings)}
          sub={`vs. ${WATER_SOURCE_COSTS[waterSource].label}`}
          highlight
        />
        <MetricTile
          label="Payback period"
          value={paybackDisplay}
          sub="Break-even point"
          highlight
        />
        <MetricTile
          label={`${PROJECTION_YEARS}-year net savings`}
          value={INR.format(roi.net15YearSavings)}
          sub={net15Positive ? '🟢 Profitable' : '🔴 Loss'}
          highlight={net15Positive}
        />
      </div>

      {/* Investment breakdown */}
      <div className="border-t border-slate-700 pt-4">
        <div className="text-xs text-slate-400 mb-2 uppercase tracking-wide">Investment breakdown</div>
        <CostRow label={`${TANK_COSTS[tankType].label} (${result.recommended_tank_liters.toLocaleString()} L)`} value={roi.tankCost} />
        {Object.values(SYSTEM_FIXED_COSTS).map(({ label, cost }) => (
          <CostRow key={label} label={label} value={cost} dimmed />
        ))}
        <div className="flex justify-between text-sm py-2 border-t border-slate-700 mt-1 font-semibold text-white">
          <span>Total investment</span>
          <span className="tabular-nums">{INR.format(roi.totalInvestment)}</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-slate-600 mt-4">
        * Annual savings estimated assuming ~{ANNUAL_EVENTS_ESTIMATE} equivalent rain events/year.
        Actual savings depend on local rainfall pattern and usage. Prices are 2024–25 Indian market approximations.
      </p>
    </div>
  )
}
