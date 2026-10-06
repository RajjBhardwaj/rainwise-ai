# Project State — Rainfall Harvesting System

**Last updated:** 2026-10-06
**Next Antigravity quota reset:** ~Oct 13, 2026 (167h from Oct 6)

## What's Built

### ✅ Complete Features
1. Weather-adaptive theme (color palette shifts: rainy=blue, cloudy=amber, sunny=orange)
2. Weather badge in header (shows Sunny/Cloudy/Rainy based on rain_probability)
3. Multi-page navigation: Dashboard / Calculator / Analytics
4. Live weather integration via Open-Meteo (backend `/api/predict-by-location`)
5. ML rain prediction (Random Forest classifier + regressor)
6. Rainwater harvest calculator with 4-stage loss chain
7. Residential/Farm mode toggle in calculator
8. Cost + ROI estimator (payback period, savings, breakdown)
9. Tank recommendation engine
10. Demand vs Supply chart on Analytics page
11. Testimonials section (4 static cards)
12. Interactive Leaflet map with search
13. GitHub repo: https://github.com/RajjBhardwaj/rainfall-harvesting-system

### ⚠️ Partial / Broken
- **Weather background animation** — component exists (`WeatherBackground.jsx`), CSS in `index.css`, but rain looks like horizontal stripes at top, not falling rain across full viewport. **Needs proper CSS animation.**

### 📋 Not Started
- User-submitted reviews (real backend endpoint + form + JSON storage)
- ~~Compare tab~~ (removed intentionally)
- ~~Farming insights~~ (postponed)

## Tech Stack

- Frontend: React 19 + Vite 8 + Tailwind 4 + Leaflet + Recharts
- Backend: FastAPI + Python 3.9, runs on port 8001
- ML: scikit-learn Random Forest (models in `backend/app/models/*.pkl`)
- Weather API: Open-Meteo (no key)

## File Map

- `frontend/src/App.jsx` — main app, holds state, routes pages
- `frontend/src/components/NavBar.jsx` — 3 tabs (Dashboard/Calculator/Analytics)
- `frontend/src/components/WeatherBackground.jsx` — weather animation (PARTIAL)
- `frontend/src/components/HarvestCalculator.jsx` — calculator with Residential/Farm toggle
- `frontend/src/components/CostRoiCard.jsx` — ROI display
- `frontend/src/components/RecommendationCard.jsx` — tank recommendation
- `frontend/src/components/DemandSupplyChart.jsx` — Analytics chart
- `frontend/src/components/TestimonialsSection.jsx` — testimonials
- `frontend/src/components/MapView.jsx` — Leaflet map + search
- `frontend/src/components/PredictionCard.jsx` — prediction display
- `frontend/src/components/LocationSelector.jsx` — city dropdown
- `frontend/src/context/ThemeContext.jsx` — theme state
- `frontend/src/theme/weatherTheme.js` — theme palettes
- `frontend/src/config/costs.js` — cost constants (₹ prices)
- `frontend/src/pages/DashboardPage.jsx` — Dashboard tab content
- `frontend/src/pages/CalculatorPage.jsx` — Calculator tab content
- `frontend/src/pages/AnalyticsPage.jsx` — Analytics tab content
- `backend/app/main.py` — FastAPI endpoints
- `backend/app/services/harvest_service.py` — harvest math
- `backend/app/services/model_service.py` — ML model loader
- `backend/app/services/weather_service.py` — Open-Meteo API
- `backend/app/services/feature_builder.py` — ML feature builder

## Rules for Any Agent

1. Do NOT modify `backend/app/services/*.py` unless the task explicitly requires it
2. Do NOT modify the API contract (endpoints, request/response shapes)
3. Do NOT add new Python dependencies without asking
4. Do NOT add new npm dependencies without asking
5. Do NOT rewrite existing components from scratch — extend them
6. Commit to git after each working feature
7. Do NOT change the harvest formula (viva-critical)
8. Preserve `feature_list.json` order for ML features

## How to Run

```bash
# Terminal 1 — backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --reload-dir app --port 8001

# Terminal 2 — frontend
cd frontend
npm run dev
