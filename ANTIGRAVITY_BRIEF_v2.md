# ANTIGRAVITY BRIEF v2 — Feature Expansion

This is the companion to ANTIGRAVITY_BRIEF.md. Feature 1 (weather-adaptive theme) is
already implemented and verified. This document specifies Features 2-7.

## Guiding principles

1. One feature at a time. Commit after each.
2. Extend existing components. Do NOT rewrite from scratch.
3. Do NOT modify backend services unless this brief explicitly says so.
4. Do NOT add new Python dependencies.
5. Do NOT add new npm dependencies unless this brief explicitly says so.
6. Test each feature yourself before committing (acceptance criteria per feature).
7. If you hit a genuine blocker that requires human input, STOP and report.
   Otherwise, work autonomously through all features.

## Product context

The app currently:
- Lets users pick a location on a map
- Shows ML-predicted rain probability + expected rainfall
- Calculates harvestable rainwater from a roof config

The expansion makes it answer real homeowner questions:
- "Should I install a rainwater harvesting system?" → ROI
- "What tank should I buy?" → Recommendation
- "How much water can I actually save?" → Annual projection
- "How does my config compare to alternatives?" → Comparator

## Cost model (locked — do not deviate)

Currency: Indian Rupees (₹)

Constants (define in `frontend/src/config/costs.js`):
- PLASTIC_TANK_COST_PER_LITER = 10
- RCC_TANK_COST_PER_LITER = 25
- INSTALLATION_FLAT_COST = 25000
- MUNICIPAL_WATER_COST_PER_1000L = 15
- TANKER_WATER_COST_PER_1000L = 200
- SYSTEM_LIFESPAN_YEARS = 15
- MAINTENANCE_ANNUAL_PCT = 0.02  (2% of capex per year)

## Priority order

Implement in this exact order. Do not skip.

---

## FEATURE 2 — Full-page weather backgrounds

### What it does

Replaces the current plain background with a dynamic full-page ambiance that
reflects the weather condition of the selected location.

### Conditions

Map rain_probability + cloud_cover to one of 4 states:

| Condition | Trigger | Visual |
|-----------|---------|--------|
| HEAVY_RAIN | rain_prob > 0.75 AND expected_mm > 5 | Dark blue/navy gradient + animated diagonal rain streaks (CSS only) |
| LIGHT_RAIN | rain_prob > 0.5 | Cool slate gradient + subtle diagonal dot pattern |
| CLOUDY | 0.25 < rain_prob <= 0.5 | Muted gray gradient, no animation |
| SUNNY | rain_prob <= 0.25 | Warm orange-amber gradient + subtle sun glow in top-right |

### No-selection state

Default background: current plain slate-950 (no change from today).

### Implementation

- Create `frontend/src/theme/backgrounds.js` — export `getBackground(rainProb, expectedMm)`
  returning `{ className, animated, animationType }`.
- Use CSS custom properties on `<body>` or a fixed-position `<div>` behind content.
- Rain animation: CSS keyframes only. No canvas. No requestAnimationFrame.
- Transition between backgrounds must be smooth (500ms fade).
- Body content must remain readable — add an overlay if needed.

### Acceptance criteria

- [ ] Picking a rainy city shifts background to a blue/navy gradient with visible rain animation
- [ ] Picking a sunny city shifts background to warm orange
- [ ] Transition between them is smooth (not instant)
- [ ] Text remains readable on all backgrounds
- [ ] Zero console errors
- [ ] Default (no city) state shows plain slate background

### Commit message

`feature-2: weather-adaptive full-page backgrounds`

---

## FEATURE 3 — Multi-page navigation

### What it does

Splits the current single-page app into 4 pages with a top navigation bar.

### Pages (routes via React state, not react-router — keep it lightweight)

| Route | Page | Contains |
|-------|------|----------|
| `dashboard` | Dashboard | Map, location selector, prediction card |
| `harvest` | Harvesting | Harvest calculator, cost + ROI (Feature 5), recommendation (Feature 6) |
| `compare` | Compare | Harvest scenario comparator (Feature 4) |
| `analytics` | Analytics | Historical charts, household demand vs supply (Feature 7) |

### Navigation bar

- Position: below the header, above main content
- 4 tabs with icons (emoji is fine)
- Active tab highlighted with the current theme's accent color
- Responsive: on mobile, tabs scroll horizontally if needed

### Implementation

- Create `frontend/src/components/NavBar.jsx`
- Store `currentPage` state in `App.jsx` (default: 'dashboard')
- Conditional rendering: `{currentPage === 'harvest' && <HarvestPage />}`
- Do NOT install react-router. Use simple state.

### Acceptance criteria

- [ ] 4 tabs render in a nav bar
- [ ] Clicking each tab switches content
- [ ] Active tab is visually distinct
- [ ] Theme-adaptive (uses CSS variables)
- [ ] Works on mobile (tabs still usable)
- [ ] Zero console errors

### Commit message

`feature-3: multi-page navigation`

---

## FEATURE 4 — Harvest scenario comparator

### What it does

Side-by-side comparison of up to 3 harvesting configurations.

### UI

On the Compare page:
- 3 columns, each showing one scenario
- Each scenario has its own inputs: roof area, material, household size
- A shared "rainfall" input at the top (defaults to current prediction)
- Each column shows: net harvest (L), tank recommendation (L), annual estimate (L)
- The "best" scenario (highest net harvest per ₹ spent) is highlighted

### Default scenarios (pre-filled)

1. Small home: 100 m², concrete, 3 people
2. Medium home: 150 m², concrete, 4 people
3. Large home: 200 m², metal, 5 people

### Implementation

- Create `frontend/src/components/ScenarioComparator.jsx`
- Reuse the existing `/api/harvest` endpoint (call it 3× — it's fast)
- Debounce: only call API after user stops typing (500ms)
- Show loading state per column, not for the whole page

### Acceptance criteria

- [ ] 3 scenarios render side by side
- [ ] Changing any input updates that column's results
- [ ] "Best" scenario is highlighted
- [ ] Works with no prediction (uses manual rainfall input)
- [ ] Works with prediction (auto-fills rainfall)
- [ ] Zero console errors

### Commit message

`feature-4: harvest scenario comparator`

---

## FEATURE 5 — Cost + ROI estimator

### What it does

Calculates:
- Total system cost (₹)
- Annual water savings (₹)
- Payback period (years)
- 15-year net savings (₹)

### Inputs (extend the existing harvest form)

Add to the Harvest page, below the existing calculator:
- Tank type: Plastic / RCC (radio)
- Water source: Municipal / Tanker (radio)
- Household monthly water bill (₹) — optional, else estimated

### Outputs

A new card titled "💰 Cost & Savings":
- Total capex breakdown: Tank, Installation, Total
- Annual savings: liters × source_cost × 12 months of typical rain
- Payback years: capex / annual_savings
- 15-year net savings: (annual_savings × 15) − capex − (maintenance × 15)

### Formulas
