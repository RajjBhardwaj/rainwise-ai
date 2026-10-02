# Project Brief for Antigravity

## What This Project Is

A full-stack ML web app that:
1. Predicts tomorrow's rainfall for any location in India (Random Forest classifier + regressor)
2. Fetches live weather from Open-Meteo
3. Calculates harvestable rainwater from a roof (4-stage loss chain)
4. Displays interactive map, predictions, and calculator

## Tech Stack (already set up)

- **Backend**: FastAPI + Python 3.9 (runs on port 8001)
- **Frontend**: React 19 + Vite 8 + Tailwind 4 + Leaflet + Recharts (runs on port 5173 or 5174)
- **ML**: scikit-learn Random Forest models (already trained, .pkl files in backend/app/models/)

## What's Working (do NOT rewrite these)

- `backend/app/services/model_service.py` - loads .pkl models
- `backend/app/services/weather_service.py` - Open-Meteo API integration
- `backend/app/services/feature_builder.py` - builds 22 ML features
- `backend/app/services/harvest_service.py` - engineering calculations
- `backend/app/main.py` - 5 endpoints: /api/health, /api/predict, /api/predict-by-location, /api/harvest, /api/roof-materials
- `frontend/src/components/MapView.jsx` - Leaflet map + search
- `frontend/src/components/PredictionCard.jsx` - prediction display
- `frontend/src/components/HarvestCalculator.jsx` - harvest form + results
- `frontend/src/components/LocationSelector.jsx` - city dropdown
- `frontend/src/api/client.js` - API client (points to port 8001)

## What I Want You to ADD (do not modify existing code unless necessary)

### Feature 1: Weather-Adaptive UI Theme

When a user selects a city and prediction loads, the entire app should adapt its color palette based on the weather:

- **Rainy** (rain_probability greater than 0.7): cool blues, cyan accents, subtle rain animation
- **Cloudy** (0.3 to 0.7): muted grays, amber accents
- **Sunny** (below 0.3): warm oranges, yellow accents

Implementation approach:
- Create a `frontend/src/theme/weatherTheme.js` that maps weather conditions to color palettes
- Create a `frontend/src/context/ThemeContext.jsx` to share the theme across components
- Apply theme colors via Tailwind classes or CSS variables
- Add a season badge in the header (Monsoon / Summer / Winter) based on current month + location

### Feature 2: Micro-interactions

- Smooth transitions when switching cities (fade between predictions)
- Loading skeletons instead of "Loading..." text
- Hover states on cards and buttons
- Subtle entrance animations for the result cards

### Feature 3: Better Historical View

Add a section showing:
- Monthly rainfall chart (12 months, avg mm) for the selected city
- Annual rainfall trend (last 15 years)
- Use Recharts (already installed)

## Rules

1. Do NOT modify `backend/app/services/*.py` - these are working correctly.
2. Do NOT change the API contracts (endpoint URLs, request/response shapes).
3. Do NOT add new Python dependencies without asking.
4. Do NOT rewrite existing components from scratch - extend them.
5. Commit to git after each working feature so we have rollback points.

## How to Run (for your testing)

Backend:

    cd backend
    source venv/bin/activate
    uvicorn app.main:app --reload --reload-dir app --port 8001

Frontend:

    cd frontend
    npm run dev

## Files You Should Read First

- `backend/app/main.py` - API surface
- `frontend/src/App.jsx` - app structure
- `frontend/src/components/PredictionCard.jsx` - the component that will use the theme
- `frontend/src/components/MapView.jsx` - map + search