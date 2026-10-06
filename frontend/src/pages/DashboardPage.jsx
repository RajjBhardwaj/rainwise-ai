/**
 * DashboardPage: map + location picker + prediction display + community reviews.
 *
 * Props (all come from App.jsx)
 *   selectedCity, prediction, loading, error, onLocationPick
 */

import LocationSelector from '../components/LocationSelector'
import PredictionCard from '../components/PredictionCard'
import MapView from '../components/MapView'
import ReviewsSection from '../components/ReviewsSection'

export default function DashboardPage({
  selectedCity,
  prediction,
  loading,
  error,
  onLocationPick,
}) {
  function handleMapSelect(lat, lon, name) {
    onLocationPick({ name, lat, lon })
  }

  return (
    <div className="space-y-6">
      <MapView
        lat={selectedCity?.lat ?? null}
        lon={selectedCity?.lon ?? null}
        onSelect={handleMapSelect}
      />

      <LocationSelector
        selected={selectedCity}
        onChange={onLocationPick}
      />

      <PredictionCard
        data={prediction}
        loading={loading}
        error={error}
        locationName={selectedCity?.name ?? ''}
      />

      <ReviewsSection />
    </div>
  )
}
