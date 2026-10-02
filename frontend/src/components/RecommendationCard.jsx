/**
 * RecommendationCard.jsx — Tank & System Recommendation Engine (Feature 6)
 *
 * Analyzes:
 *   - Estimated dry-spell length (derived from current month — see comment below)
 *   - Household size (from harvest result)
 *   - Payback period (from CostRoiCard via parent)
 *
 * and produces a natural-language recommendation with an investment badge.
 *
 * Props:
 *   result       — /api/harvest response (recommended_tank_liters, household_size)
 *   paybackYears — number | null (null = not yet computed)
 *
 * No API calls. All logic is pure client-side computation.
 */

// ---------------------------------------------------------------------------
// Dry-spell approximation (days between significant rain events).
//
// We do not have historical dry-spell data in the frontend.
// The values below are rough seasonal averages for India, intentionally
// conservative. They are used ONLY for tank-size guidance, not engineering
// calculations. The actual harvest engineering is done by the backend.
//
// Month index: 0=Jan, 1=Feb, …, 11=Dec
// ---------------------------------------------------------------------------
const DRY_SPELL_BY_MONTH = [
  25,  // Jan  — Winter, long dry spells
  25,  // Feb  — Winter
  35,  // Mar  — Pre-monsoon, driest
  35,  // Apr  — Pre-monsoon
  35,  // May  — Pre-monsoon
   5,  // Jun  — Monsoon onset, short gaps
   5,  // Jul  — Peak monsoon
   5,  // Aug  — Peak monsoon
   5,  // Sep  — Monsoon, still active
  12,  // Oct  — Post-monsoon, gaps increasing
  12,  // Nov  — Post-monsoon
  25,  // Dec  — Winter begins
]

// ---------------------------------------------------------------------------
// Tank size classification based on recommended_tank_liters
// ---------------------------------------------------------------------------
function tankSizeLabel(liters) {
  if (liters <= 2000) return 'Small tank (≤ 2,000 L)'
  if (liters <= 5000) return 'Medium tank (2,000–5,000 L)'
  return 'Large tank (5,000 – 10,000 L)'
}

// ---------------------------------------------------------------------------
// Investment badge: color-coded by payback period
// ---------------------------------------------------------------------------
function InvestmentBadge({ paybackYears }) {
  if (paybackYears === null) {
    return null
  }
  if (paybackYears < 3) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/50 border border-green-700 text-green-300 text-xs font-semibold">
        🟢 Excellent investment — payback in {paybackYears.toFixed(1)} years
      </span>
    )
  }
  if (paybackYears <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-900/50 border border-amber-700 text-amber-300 text-xs font-semibold">
        🟡 Moderate investment — payback in {paybackYears.toFixed(1)} years
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-900/50 border border-red-700 text-red-300 text-xs font-semibold">
      🔴 Long-term investment — payback in {paybackYears.toFixed(1)} years
    </span>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function RecommendationCard({ result, paybackYears }) {
  const month = new Date().getMonth() // 0-indexed
  const drySpellDays = DRY_SPELL_BY_MONTH[month]
  const householdSize = result.household_size
  const tankLiters = result.recommended_tank_liters

  // --- Main recommendation paragraph ---
  let tankMessage
  if (drySpellDays < 5) {
    tankMessage = `During the active monsoon, rain arrives frequently (gaps of ~${drySpellDays} days). A small tank (1,000–2,000 L) is sufficient to bridge the short dry windows and covers a ${householdSize}-person household for a few days.`
  } else if (drySpellDays <= 15) {
    tankMessage = `Dry spells of ~${drySpellDays} days are typical right now. A medium tank (2,000–5,000 L) is recommended — it provides a comfortable buffer for a ${householdSize}-person household without over-sizing the system.`
  } else {
    tankMessage = `Dry spells of ~${drySpellDays} days are common this season. A large tank (5,000–10,000 L) or supplementary water supply is needed to reliably serve a ${householdSize}-person household between rains.`
  }

  // --- Household note ---
  const householdNote = householdSize > 6
    ? 'With more than 6 people, consider pairing your tank with a dual-stage filtration combo to handle the higher daily throughput safely.'
    : null

  // --- Suggested tank capacity range ---
  const suggestedCapacity = tankSizeLabel(tankLiters)

  return (
    <div className="bg-[var(--color-bg-tint)] rounded-2xl p-6 border border-[var(--color-border)]">
      <h3 className="font-semibold text-white mb-4">🎯 Our Recommendation</h3>

      {/* Investment badge */}
      <div className="mb-4">
        <InvestmentBadge paybackYears={paybackYears} />
        {paybackYears === null && (
          <span className="text-xs text-slate-500 italic">
            Open the Cost &amp; ROI card above to see your investment rating.
          </span>
        )}
      </div>

      {/* Main recommendation */}
      <p className="text-sm text-slate-300 leading-relaxed mb-3">
        {tankMessage}
      </p>

      {/* Household note (only for large households) */}
      {householdNote && (
        <p className="text-sm text-slate-400 leading-relaxed mb-3 italic">
          💡 {householdNote}
        </p>
      )}

      {/* Suggested capacity */}
      <div className="flex items-center gap-3 bg-slate-900/60 rounded-xl px-4 py-3 mt-4 border border-slate-700">
        <span className="text-2xl">🛢</span>
        <div>
          <div className="text-xs text-slate-400">Suggested tank capacity</div>
          <div className="text-sm font-semibold text-white">{suggestedCapacity}</div>
          <div className="text-xs text-slate-500">
            Backend sizing: {tankLiters.toLocaleString()} L
            &nbsp;(based on your roof, rainfall &amp; daily demand)
          </div>
        </div>
      </div>

      {/* Next step */}
      <div className="mt-4 flex items-start gap-3 bg-[var(--color-accent)]/10 rounded-xl px-4 py-3 border border-[var(--color-border)]">
        <span className="text-lg">➡️</span>
        <p className="text-sm text-slate-300">
          <strong>Next step:</strong> Get quotes from at least 3 local installers in your area.
          Share the tank size ({tankLiters.toLocaleString()} L) and system specs from the breakdown above.
        </p>
      </div>

      <p className="text-xs text-slate-600 mt-4">
        * Dry-spell estimates are seasonal approximations for India and not location-specific engineering data.
      </p>
    </div>
  )
}
