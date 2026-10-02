import axios from 'axios'

// Central place for the backend URL. Change in one place if needed.
const API_BASE = 'http://127.0.0.1:8000'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30 seconds — the predict endpoint calls Open-Meteo, so allow enough time
})

/**
 * Check if the backend is alive.
 */
export async function healthCheck() {
  const res = await client.get('/api/health')
  return res.data
}

/**
 * Full pipeline: fetch live weather for a location and predict rain.
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 */
export async function predictByLocation(lat, lon) {
  const res = await client.get('/api/predict-by-location', {
    params: { lat, lon },
  })
  return res.data
}

/**
 * Predict from raw 22 features (used for testing / advanced mode).
 */
export async function predictFromFeatures(features) {
  const res = await client.post('/api/predict', features)
  return res.data
}
/**
 * Calculate harvestable rainwater from roof/catchment configuration.
 */
export async function harvest(params) {
  const res = await client.post('/api/harvest', params)
  return res.data
}

/**
 * Fetch the supported roof materials and their runoff coefficients.
 */
export async function getRoofMaterials() {
  const res = await client.get('/api/roof-materials')
  return res.data
}
export default client