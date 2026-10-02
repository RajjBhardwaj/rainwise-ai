"""
Pydantic schemas for the /api/predict endpoint.

This mirrors the 22 features from feature_list.json (order doesn't matter here;
the model_service reorders them internally using the JSON file).
"""

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    # Location
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in degrees")

    # Weather features
    temperature_2m_max: float = Field(..., description="Max temperature (°C)")
    temperature_2m_min: float = Field(..., description="Min temperature (°C)")
    relative_humidity_2m_mean: float = Field(..., ge=0, le=100, description="Mean relative humidity (%)")
    surface_pressure_mean: float = Field(..., description="Mean surface pressure (hPa)")
    wind_speed_10m_max: float = Field(..., ge=0, description="Max wind speed (km/h)")
    cloud_cover_mean: float = Field(..., ge=0, le=100, description="Mean cloud cover (%)")
    shortwave_radiation_sum: float = Field(..., ge=0, description="Shortwave radiation sum (MJ/m²)")

    # Time features
    month: int = Field(..., ge=1, le=12, description="Month (1-12)")
    day_of_year: int = Field(..., ge=1, le=366, description="Day of year (1-366)")
    doy_sin: float = Field(..., ge=-1, le=1, description="Sine of day-of-year (cyclical)")
    doy_cos: float = Field(..., ge=-1, le=1, description="Cosine of day-of-year (cyclical)")
    is_monsoon: int = Field(..., ge=0, le=1, description="1 if monsoon month (Jun-Sep), else 0")

    # Lag features (past precipitation)
    precip_lag_1: float = Field(..., ge=0, description="Precipitation 1 day ago (mm)")
    precip_lag_2: float = Field(..., ge=0, description="Precipitation 2 days ago (mm)")
    precip_lag_3: float = Field(..., ge=0, description="Precipitation 3 days ago (mm)")
    precip_lag_7: float = Field(..., ge=0, description="Precipitation 7 days ago (mm)")

    # Rolling averages
    precip_roll_3: float = Field(..., ge=0, description="3-day rolling mean precipitation (mm)")
    precip_roll_7: float = Field(..., ge=0, description="7-day rolling mean precipitation (mm)")

    # Derived features
    temp_range: float = Field(..., ge=0, description="temperature_2m_max - temperature_2m_min")
    humidity_cloud: float = Field(..., ge=0, description="relative_humidity_2m_mean × cloud_cover_mean")


class PredictionResponse(BaseModel):
    rain_probability: float = Field(..., ge=0, le=1, description="Probability of rain tomorrow (0-1)")
    will_rain: bool = Field(..., description="True if rain_probability >= 0.5")
    expected_rainfall_mm: float = Field(..., ge=0, description="Predicted rainfall tomorrow (mm)")



class LocationRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in degrees")


class WeatherToday(BaseModel):
    date: str
    precipitation_sum: float
    temperature_2m_max: float
    temperature_2m_min: float
    relative_humidity_2m_mean: float
    surface_pressure_mean: float
    wind_speed_10m_max: float
    cloud_cover_mean: float
    shortwave_radiation_sum: float


class LocationPredictionResponse(BaseModel):
    latitude: float
    longitude: float
    rain_probability: float
    will_rain: bool
    expected_rainfall_mm: float
    weather_today: WeatherToday



class HarvestRequest(BaseModel):
    rainfall_mm: float = Field(
        ..., ge=0, description="Predicted rainfall for the event (mm)"
    )
    area_m2: float = Field(
        ..., gt=0, description="Catchment / roof area (m²)"
    )
    roof_material: str = Field(
        ..., description="One of: concrete, tile, metal, asbestos, green"
    )
    household_size: int = Field(
        4, ge=1, le=50, description="Number of people in the household"
    )
    include_first_flush: bool = Field(
        True, description="Include first-flush diverter"
    )
    include_filtration: bool = Field(
        True, description="Include sand/charcoal filtration"
    )


class HarvestResponse(BaseModel):
    # Inputs echoed
    rainfall_mm: float
    area_m2: float
    roof_material: str
    household_size: int
    runoff_coefficient: float

    # Water balance (liters)
    gross_rain_liters: float
    first_flush_discarded_liters: float
    after_first_flush_liters: float
    runoff_lost_liters: float
    after_runoff_liters: float
    conveyance_lost_liters: float
    after_conveyance_liters: float
    filtration_lost_liters: float
    net_harvest_liters: float

    # Household impact
    daily_demand_liters: float
    days_of_supply: float

    # Tank sizing
    tank_buffer_days: int
    tank_sizing_method: str
    recommended_tank_liters: float