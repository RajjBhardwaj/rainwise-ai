/**
 * weatherTheme.js
 *
 * Defines three weather-condition palettes and helpers to:
 *   - Derive a condition string from rain_probability
 *   - Derive an Indian meteorological season from the current month
 *   - Apply a palette by writing CSS custom properties to :root
 *
 * CSS variables written to document.documentElement:
 *   --color-bg-tint      card / panel backgrounds
 *   --color-border       card borders
 *   --color-accent       prominent numbers, progress bar fill
 *   --color-text-accent  secondary accent text
 *   --rain-animation     'running' | 'paused' — drives the header keyframe
 *
 * Tailwind arbitrary-value usage in components:
 *   bg-[var(--color-bg-tint)]   border-[var(--color-border)]
 *   bg-[var(--color-accent)]    text-[var(--color-text-accent)]
 */

// ---------------------------------------------------------------------------
// Default values (match current hardcoded Tailwind classes exactly):
//   bg-slate-800   → #1e293b
//   border-slate-700 → #334155
//   blue-500       → #3b82f6
//   blue-400       → #60a5fa
// ---------------------------------------------------------------------------
export const DEFAULT_VARS = {
  '--color-bg-tint': '#1e293b',
  '--color-border': '#334155',
  '--color-accent': '#3b82f6',
  '--color-text-accent': '#60a5fa',
  '--rain-animation': 'paused',
}

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------
export const PALETTES = {
  /** rain_probability > 0.7 — cool blues / cyan */
  rainy: {
    '--color-bg-tint': '#0c1f35',   // deep navy
    '--color-border': '#164e75',    // ocean blue
    '--color-accent': '#06b6d4',    // cyan-500
    '--color-text-accent': '#67e8f9', // cyan-300
    '--rain-animation': 'running',
  },

  /** 0.3 ≤ rain_probability ≤ 0.7 — muted grays / amber */
  cloudy: {
    '--color-bg-tint': '#1c1917',   // warm stone-900
    '--color-border': '#57534e',    // stone-600
    '--color-accent': '#f59e0b',    // amber-500
    '--color-text-accent': '#fbbf24', // amber-400
    '--rain-animation': 'paused',
  },

  /** rain_probability < 0.3 — warm oranges / yellow */
  sunny: {
    '--color-bg-tint': '#1c1007',   // very dark warm tone
    '--color-border': '#92400e',    // amber-800
    '--color-accent': '#f97316',    // orange-500
    '--color-text-accent': '#fb923c', // orange-400
    '--rain-animation': 'paused',
  },
}

// ---------------------------------------------------------------------------
// getCondition: maps a rain_probability [0..1] to a condition key
// ---------------------------------------------------------------------------
/**
 * @param {number} rainProbability — value between 0 and 1
 * @returns {'rainy' | 'cloudy' | 'sunny'}
 */
export function getCondition(rainProbability) {
  if (rainProbability > 0.7) return 'rainy'
  if (rainProbability >= 0.3) return 'cloudy'
  return 'sunny'
}

// ---------------------------------------------------------------------------
// getSeason: maps the current month to an Indian meteorological season label
// ---------------------------------------------------------------------------
/**
 * @param {number} month — 1-indexed (1 = January, 12 = December)
 * @returns {string}
 */
export function getSeason(month) {
  if (month >= 6 && month <= 9) return 'Monsoon'
  if (month === 10 || month === 11) return 'Post-Monsoon'
  if (month >= 12 || month <= 2) return 'Winter'
  return 'Pre-Monsoon'  // March–May
}

// ---------------------------------------------------------------------------
// applyTheme: writes CSS custom properties to :root
// ---------------------------------------------------------------------------
/**
 * @param {'rainy' | 'cloudy' | 'sunny' | null} condition
 *   Pass null to reset to defaults (e.g. on first load or error).
 */
export function applyTheme(condition) {
  const vars = condition ? PALETTES[condition] : DEFAULT_VARS
  const root = document.documentElement
  Object.entries(vars).forEach(([prop, value]) => {
    root.style.setProperty(prop, value)
  })
}

// ---------------------------------------------------------------------------
// initThemeDefaults: call once at startup to ensure vars exist before any
// prediction loads, preventing a flash of un-styled CSS-var references.
// ---------------------------------------------------------------------------
export function initThemeDefaults() {
  applyTheme(null)
}
