/**
 * ThemeContext.jsx
 *
 * Provides weather-condition and season state to the entire component tree
 * without prop-drilling.
 *
 * Usage:
 *   // Wrap your app (done in App.jsx):
 *   <ThemeProvider><App /></ThemeProvider>
 *
 *   // In any component:
 *   const { condition, season, setWeather } = useTheme()
 *
 * API:
 *   condition  — 'rainy' | 'cloudy' | 'sunny' | null (null before first pick)
 *   season     — 'Monsoon' | 'Post-Monsoon' | 'Winter' | 'Pre-Monsoon' | null
 *   setWeather(rainProbability) — derives + stores condition/season and
 *                                 applies CSS vars to :root
 */

import { createContext, useContext, useState, useEffect } from 'react'
import {
  getCondition,
  getSeason,
  applyTheme,
  initThemeDefaults,
} from '../theme/weatherTheme'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [condition, setCondition] = useState(null)
  const [season, setSeason] = useState(null)

  // Seed CSS variables with defaults on mount so components that reference
  // var(--color-bg-tint) etc. never see an empty value.
  useEffect(() => {
    initThemeDefaults()
  }, [])

  /**
   * Call this every time a new prediction arrives.
   * @param {number} rainProbability — [0..1]
   */
  function setWeather(rainProbability) {
    const newCondition = getCondition(rainProbability)
    const newSeason = getSeason(new Date().getMonth() + 1) // getMonth() is 0-indexed

    setCondition(newCondition)
    setSeason(newSeason)
    applyTheme(newCondition)
  }

  return (
    <ThemeContext.Provider value={{ condition, season, setWeather }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Hook to consume the theme context.
 * Must be used inside a <ThemeProvider>.
 */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return ctx
}
