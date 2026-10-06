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
  // Reduce drop count on mobile for performance.
  // matchMedia evaluated once per mount — no resize listener needed.
  const dropCount =
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 768px)').matches
      ? 40
      : 90

  const drops = useMemo(() => {
    return Array.from({ length: dropCount }, (_, i) => ({
      id: i,
      left: Math.random() * 100,           // 0–100% of viewport width
      duration: 0.55 + Math.random() * 0.9, // 0.55–1.45s per fall
      delay: Math.random() * 2.5,           // 0–2.5s stagger
      opacity: 0.30 + Math.random() * 0.55, // 0.30–0.85
      size: Math.random() > 0.65 ? 22 : 14, // some drops longer than others
    }))
  }, [dropCount])


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