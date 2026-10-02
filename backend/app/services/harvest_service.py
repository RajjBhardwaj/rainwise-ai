"""
Harvest service: engineering calculations for rainwater harvesting.

ACCURATE LOSS CHAIN
-------------------
Rainfall on roof
    ↓
[1] First-flush discard (fixed depth)   — dust, bird droppings, dry-roof soak
    ↓
[2] Runoff coefficient (roof material)  — absorption, splashing
    ↓
[3] Conveyance loss (gutters + pipes)   — leaks, evaporation
    ↓
[4] Filtration loss (sand/charcoal)     — if installed
    ↓
Stored water

FORMULA (per rainfall event)
----------------------------
  gross          = rainfall_mm × area_m2                          (1 mm on 1 m² = 1 L)
  flush_depth    = min(FIRST_FLUSH_DEPTH_MM, rainfall_mm × 0.20)
  after_flush    = (rainfall_mm - flush_depth) × area_m2
  after_runoff   = after_flush × runoff_coeff
  after_convey   = after_runoff × (1 - CONVEYANCE_LOSS)
  net_harvest    = after_convey × (1 - FILTRATION_LOSS)

TANK SIZING (Path A — fixed 7-day buffer)
-----------------------------------------
  daily_demand      = household_size × LITERS_PER_PERSON_PER_DAY
  recommended_tank  = daily_demand × TANK_BUFFER_DAYS

STANDARDS & REFERENCES
----------------------
  • CGWB — Manual on Artificial Recharge of Ground Water
  • IS 15797:2008 — Roof top rainwater harvesting
  • CPHEEO — Manual on Water Supply (per-capita demand = 100 L/day)
"""

# ---- Engineering constants (from Indian standards) ----
FIRST_FLUSH_DEPTH_MM = 1.5           # IS 15797:2008 — discard first 1.5 mm
FIRST_FLUSH_MAX_FRACTION = 0.20      # Never discard more than 20% of rainfall
CONVEYANCE_LOSS = 0.07               # 7% — CGWB manual
FILTRATION_LOSS = 0.05               # 5% — typical sand/charcoal filter
LITERS_PER_PERSON_PER_DAY = 100      # CPHEEO standard for domestic rural
TANK_BUFFER_DAYS = 7                 # Path A — fixed buffer

# ---- Roof material runoff coefficients (CGWB) ----
RUNOFF_COEFFICIENTS = {
    "concrete": 0.85,   # RCC / cement concrete
    "tile":     0.75,   # clay / ceramic tiles
    "metal":    0.90,   # GI / metal sheet
    "asbestos": 0.80,   # asbestos cement sheet
    "green":    0.40,   # green / vegetated roof
}


class HarvestError(ValueError):
    """Raised for invalid inputs to the harvest calculation."""


def calculate_harvest(
    rainfall_mm: float,
    area_m2: float,
    roof_material: str,
    household_size: int = 4,
    include_first_flush: bool = True,
    include_filtration: bool = True,
) -> dict:
    """
    Compute the full harvest breakdown and tank recommendation.
    All inputs and outputs are documented for the viva.
    """
    # ---- Validation ----
    if rainfall_mm < 0:
        raise HarvestError("rainfall_mm must be >= 0")
    if area_m2 <= 0:
        raise HarvestError("area_m2 must be > 0")
    if roof_material not in RUNOFF_COEFFICIENTS:
        raise HarvestError(
            f"roof_material must be one of {list(RUNOFF_COEFFICIENTS.keys())}"
        )
    if household_size < 1:
        raise HarvestError("household_size must be >= 1")

    coeff = RUNOFF_COEFFICIENTS[roof_material]

    # ---- Stage 0: Gross rain on roof ----
    gross_liters = rainfall_mm * area_m2

    # ---- Stage 1: First-flush discard ----
    if include_first_flush:
        flush_depth = min(FIRST_FLUSH_DEPTH_MM, rainfall_mm * FIRST_FLUSH_MAX_FRACTION)
        flush_liters = flush_depth * area_m2
    else:
        flush_depth = 0.0
        flush_liters = 0.0

    after_flush_liters = gross_liters - flush_liters

    # ---- Stage 2: Runoff coefficient ----
    runoff_lost_liters = after_flush_liters * (1 - coeff)
    after_runoff_liters = after_flush_liters * coeff

    # ---- Stage 3: Conveyance loss ----
    conveyance_lost_liters = after_runoff_liters * CONVEYANCE_LOSS
    after_conveyance_liters = after_runoff_liters * (1 - CONVEYANCE_LOSS)

    # ---- Stage 4: Filtration loss (optional) ----
    if include_filtration:
        filtration_lost_liters = after_conveyance_liters * FILTRATION_LOSS
        net_harvest_liters = after_conveyance_liters * (1 - FILTRATION_LOSS)
    else:
        filtration_lost_liters = 0.0
        net_harvest_liters = after_conveyance_liters

    # ---- Household impact ----
    daily_demand_liters = household_size * LITERS_PER_PERSON_PER_DAY
    days_of_supply = (
        net_harvest_liters / daily_demand_liters if daily_demand_liters > 0 else 0.0
    )

    # ---- Tank sizing (Path A — fixed 7-day buffer) ----
    recommended_tank_liters = daily_demand_liters * TANK_BUFFER_DAYS

    return {
        "rainfall_mm": round(rainfall_mm, 2),
        "area_m2": round(area_m2, 2),
        "roof_material": roof_material,
        "household_size": household_size,
        "runoff_coefficient": coeff,

        "gross_rain_liters": round(gross_liters, 2),
        "first_flush_discarded_liters": round(flush_liters, 2),
        "after_first_flush_liters": round(after_flush_liters, 2),
        "runoff_lost_liters": round(runoff_lost_liters, 2),
        "after_runoff_liters": round(after_runoff_liters, 2),
        "conveyance_lost_liters": round(conveyance_lost_liters, 2),
        "after_conveyance_liters": round(after_conveyance_liters, 2),
        "filtration_lost_liters": round(filtration_lost_liters, 2),
        "net_harvest_liters": round(net_harvest_liters, 2),

        "daily_demand_liters": daily_demand_liters,
        "days_of_supply": round(days_of_supply, 2),

        "tank_buffer_days": TANK_BUFFER_DAYS,
        "tank_sizing_method": "fixed_7day_buffer",
        "recommended_tank_liters": round(recommended_tank_liters, 2),
    }


def list_roof_materials() -> list[dict]:
    """Return the supported roof materials with their runoff coefficients."""
    return [
        {"key": k, "coefficient": v}
        for k, v in RUNOFF_COEFFICIENTS.items()
    ]
