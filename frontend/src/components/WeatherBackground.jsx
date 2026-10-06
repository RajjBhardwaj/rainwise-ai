/**
 * WeatherBackground: full-page animated ambiance based on current weather.
 *
 * Rainy: generates 90 individual raindrops, each with its own fall speed,
 * horizontal position, and delay. Feels much more natural than gradient patterns.
 *
 * Cloudy / Sunny: CSS effects from index.css.
 *
 * Props:
 *   - condition: 'rainy' | 'cloudy' | 'sunny' | null
 */

import { useMemo } from 'react'

function RainLayer() {
  // Generate 90 raindrops with random positions and speeds
  const drops = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,          // 0–100% of viewport width
      duration: 0.6 + Math.random() * 0.8, // 0.6–1.4s per fall
      delay: Math.random() * 2,            // 0–2s stagger
      opacity: 0.35 + Math.random() * 0.5, // 0.35–0.85
      size: Math.random() > 0.7 ? 24 : 16, // some drops longer than others
    }))
  }, [])

  return (
    <div className="rain-layer-full">
      {drops.map((d) => (
        <span
          key={d.id}
          className="drop"
          style={{
            left: `${d.left}%`,
            height: `${d.size}px`,
            opacity: d.opacity,
            animationDuration: `${d.duration}s`,
            animationDelay: `-${d.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function WeatherBackground({ condition }) {
  const cls = ['weather-bg', condition].filter(Boolean).join(' ')

  return (
    <div className={cls} aria-hidden="true">
      {condition === 'rainy' && <RainLayer />}
      <div className="bg-cloud" />
      <div className="bg-sun" />
    </div>
  )
}