/**
 * CalculatorPage: rainwater harvesting calculator + ROI + recommendation.
 *
 * Props (from App.jsx):
 *   - prediction      — used to auto-fill rainfall
 *   - selectedCity    — used for the location banner + ROI city lookup
 */

import HarvestCalculator from '../components/HarvestCalculator'

export default function CalculatorPage({ prediction, selectedCity }) {
  return (
    <div className="space-y-6">
      {/* Info banner when no prediction yet */}
      {!prediction && (
        <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 text-slate-400 text-sm">
          💡 Tip: pick a city on the <strong className="text-white">Dashboard</strong> tab
          to auto-fill rainfall here. You can also enter rainfall manually.
        </div>
      )}

      <HarvestCalculator
  predictedRainfall={prediction?.expected_rainfall_mm ?? null}
  locationName={selectedCity?.name?.split(',')[0]?.trim() ?? ''}
/>
    </div>
  )
}
