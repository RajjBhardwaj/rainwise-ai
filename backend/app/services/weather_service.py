"""
Weather service: fetches live and recent weather data from Open-Meteo.

Open-Meteo is free, needs no API key, and provides:
  - Current weather:   https://api.open-meteo.com/v1/forecast
  - Historical data:   https://archive-api.open-meteo.com/v1/archive

We use two separate calls because:
  - Forecast API gives us TODAY's weather (and a few future days).
  - Archive API gives us PAST days (needed for lag features).
"""

from datetime import date, timedelta

import httpx


FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive"

# Daily variables we fetch for the feature vector
DAILY_VARS = [
    "precipitation_sum",
    "temperature_2m_max",
    "temperature_2m_min",
    "relative_humidity_2m_mean",
    "surface_pressure_mean",
    "wind_speed_10m_max",
    "cloud_cover_mean",
    "shortwave_radiation_sum",
]

TIMEOUT = 30.0  # seconds


def _parse_open_meteo_response(data: dict) -> dict:
    """Extract the last complete day from an Open-Meteo daily response."""
    daily = data.get("daily")
    if not daily or not daily.get("time"):
        raise ValueError("Open-Meteo response missing 'daily' data")

    # Take the last entry (most recent day)
    idx = -1
    return {
        "date": daily["time"][idx],
        "precipitation_sum": daily["precipitation_sum"][idx],
        "temperature_2m_max": daily["temperature_2m_max"][idx],
        "temperature_2m_min": daily["temperature_2m_min"][idx],
        "relative_humidity_2m_mean": daily["relative_humidity_2m_mean"][idx],
        "surface_pressure_mean": daily["surface_pressure_mean"][idx],
        "wind_speed_10m_max": daily["wind_speed_10m_max"][idx],
        "cloud_cover_mean": daily["cloud_cover_mean"][idx],
        "shortwave_radiation_sum": daily["shortwave_radiation_sum"][idx],
    }


def fetch_current_weather(lat: float, lon: float) -> dict:
    """
    Fetch TODAY's weather for a location.

    Uses the Forecast API with past_days=1 to ensure today's data is complete
    (sometimes today's archive data isn't ready yet, but forecast data is).
    """
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ",".join(DAILY_VARS),
        "timezone": "auto",
        "past_days": 1,
        "forecast_days": 1,
    }

    with httpx.Client(timeout=TIMEOUT) as client:
        r = client.get(FORECAST_URL, params=params)
        r.raise_for_status()
        data = r.json()

    return _parse_open_meteo_response(data)


def fetch_recent_precipitation(lat: float, lon: float, days: int = 10) -> list:
    """
    Fetch daily precipitation for the last `days` days (excluding today).

    Returns a list of dicts: [{"date": "YYYY-MM-DD", "precipitation_sum": float}, ...]
    Ordered from oldest to most recent (so index -1 is yesterday).
    """
    today = date.today()
    end = today - timedelta(days=1)          # yesterday
    start = today - timedelta(days=days)     # days ago

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "daily": "precipitation_sum",
        "timezone": "auto",
    }

    with httpx.Client(timeout=TIMEOUT) as client:
        r = client.get(ARCHIVE_URL, params=params)
        r.raise_for_status()
        data = r.json()

    daily = data.get("daily")
    if not daily or not daily.get("time"):
        raise ValueError("Open-Meteo archive response missing 'daily' data")

    return [
        {"date": daily["time"][i], "precipitation_sum": daily["precipitation_sum"][i]}
        for i in range(len(daily["time"]))
    ]


def fetch_full_weather(lat: float, lon: float) -> dict:
    """
    Convenience wrapper: fetch current weather + recent precipitation in one call.

    Returns a dict with:
      - current: the weather dict for today
      - history: list of dicts for the last N days (excluding today)
    """
    current = fetch_current_weather(lat, lon)
    history = fetch_recent_precipitation(lat, lon, days=10)
    return {"current": current, "history": history}