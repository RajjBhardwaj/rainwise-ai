/**
 * costs.js — client-side constants for the cost/ROI estimator (Feature 5).
 *
 * All prices are approximate Indian market rates as of 2024–25.
 * Update these constants if market conditions change.
 * No backend calls needed — all calculations are pure arithmetic.
 */

// ---------------------------------------------------------------------------
// Tank construction cost per litre of storage capacity
// ---------------------------------------------------------------------------
export const TANK_COSTS = {
  plastic: {
    label: 'Plastic / HDPE tank',
    costPerLiterCapacity: 1.5,   // ₹ per litre of capacity
    lifeYears: 15,
    description: 'Lightweight, portable, lower upfront cost',
  },
  rcc: {
    label: 'RCC / Ferro-cement tank',
    costPerLiterCapacity: 3.5,   // ₹ per litre of capacity
    lifeYears: 30,
    description: 'Permanent structure, higher cost, 30-year lifespan',
  },
}

// ---------------------------------------------------------------------------
// Alternative water-source cost per 1,000 litres (per kL)
// This is the cost of water that the harvested rainwater *replaces*.
// ---------------------------------------------------------------------------
export const WATER_SOURCE_COSTS = {
  municipal: {
    label: 'Municipal / Piped supply',
    costPer1000L: 15,     // ₹15 per kL — typical urban India metered rate
    description: 'Affordable but often unavailable or rationed',
  },
  tanker: {
    label: 'Water tanker delivery',
    costPer1000L: 350,    // ₹350 per kL — private tanker, common in summer
    description: 'Expensive fallback during water shortages',
  },
}

// ---------------------------------------------------------------------------
// One-time fixed system component costs (₹)
// Shown as a breakdown in the investment summary.
// ---------------------------------------------------------------------------
export const SYSTEM_FIXED_COSTS = {
  firstFlush:   { label: 'First-flush diverter',       cost: 3500 },
  filtration:   { label: 'Sand / charcoal filter unit', cost: 8000 },
  gutters:      { label: 'Gutters & downpipes',         cost: 12000 },
  installation: { label: 'Labour & installation',       cost: 8000 },
}

// ---------------------------------------------------------------------------
// Projection constants
// ---------------------------------------------------------------------------

// Payback and net-savings projection window (years)
export const PROJECTION_YEARS = 15

/**
 * Annual harvest multiplier.
 *
 * The /api/harvest result is for ONE rain event (tomorrow's predicted mm).
 * To estimate annual savings we approximate:
 *   annual_harvest ≈ single_event_harvest × ANNUAL_EVENTS_ESTIMATE
 *
 * Derivation:
 *   - Average India rainy days ≈ 60–100 per year
 *   - We use a conservative 60 days × 0.8 system-efficiency reliability = ~48
 *   - But a single event harvest already includes filtration losses, so we use
 *     a more conservative 40 effective events/year as a safe lower estimate.
 *   - This is clearly documented as an approximation.
 */
export const ANNUAL_EVENTS_ESTIMATE = 40

// ---------------------------------------------------------------------------
// Indian Rupee formatter — produces ₹1,25,000 style formatting
// ---------------------------------------------------------------------------
export const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
