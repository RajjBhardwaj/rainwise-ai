"""
Feature builder: transforms raw weather data into the 22 features the ML model expects.

The 22 features (order in feature_list.json is authoritative; this dict supplies all of them):

    latitude, longitude,
    temperature_2m_max, temperature_2m_min,
    relative_humidity_2m_mean, surface_pressure_mean, wind_speed_10m_max,
    cloud_cover_mean, shortwave_radiation_sum,
    month, day_of_year, doy_sin, doy_cos, is_monsoon,
    precip_lag_1, precip_lag_2, precip_lag_3, precip_lag_7,
    precip_roll_3, precip_roll_7,
    temp_range, humidity_cloud

The lag / rolling features are derived from the `history` list produced by
weather_service.fetch_recent_precipitation(), which is ordered oldest → newest.
So:
    history[-1] = yesterday
    history[-2] = 2 days ago
    ...
"""

import math
from datetime import date


def _parse_date(d: str) -> date:
    """Open-Meteo returns dates as 'YYYY-MM-DD' strings."""
    return date.fromisoformat(d)


def build_features(lat: float, lon: float, weather: dict) -> dict:
    """
    Build the 22-feature dict.

    Args:
        lat, lon: coordinates
        weather: the dict returned by weather_service.fetch_full_weather(),
                 containing keys 'current' and 'history'.

    Returns:
        dict with 22 keys ready to hand to model_service.predict().
    """
    current = weather["current"]
    history = weather["history"]  # oldest → newest

    # ---------- Location ----------
    features = {
        "latitude": lat,
        "longitude": lon,
    }

    # ---------- Today's weather ----------
    features["temperature_2m_max"] = current["temperature_2m_max"]
    features["temperature_2m_min"] = current["temperature_2m_min"]
    features["relative_humidity_2m_mean"] = current["relative_humidity_2m_mean"]
    features["surface_pressure_mean"] = current["surface_pressure_mean"]
    features["wind_speed_10m_max"] = current["wind_speed_10m_max"]
    features["cloud_cover_mean"] = current["cloud_cover_mean"]
    features["shortwave_radiation_sum"] = current["shortwave_radiation_sum"]

    # ---------- Date-based features ----------
    today = _parse_date(current["date"])
    month = today.month
    day_of_year = today.timetuple().tm_yday

    features["month"] = month
    features["day_of_year"] = day_of_year
    features["doy_sin"] = math.sin(2 * math.pi * day_of_year / 365.25)
    features["doy_cos"] = math.cos(2 * math.pi * day_of_year / 365.25)
    features["is_monsoon"] = 1 if month in (6, 7, 8, 9) else 0

    # ---------- Precipitation history ----------
    # history[-1] = yesterday, history[-2] = 2 days ago, etc.
    def precip_days_ago(n: int) -> float:
        """Get precipitation n days ago (0 = yesterday)."""
        idx = -(n + 1)
        if abs(idx) > len(history):
            # Not enough history — fall back to 0.0 (driest assumption)
            return 0.0
        val = history[idx].get("precipitation_sum")
        return float(val) if val is not None else 0.0

    features["precip_lag_1"] = precip_days_ago(0)  # yesterday
    features["precip_lag_2"] = precip_days_ago(1)  # 2 days ago
    features["precip_lag_3"] = precip_days_ago(2)  # 3 days ago
    features["precip_lag_7"] = precip_days_ago(6)  # 7 days ago

    # Rolling means of the PREVIOUS 3 and 7 days
    last_3 = [precip_days_ago(i) for i in range(3)]  # [yesterday, -2, -3]
    last_7 = [precip_days_ago(i) for i in range(7)]
    features["precip_roll_3"] = sum(last_3) / 3.0
    features["precip_roll_7"] = sum(last_7) / 7.0

    # ---------- Derived features ----------
    features["temp_range"] = (
        features["temperature_2m_max"] - features["temperature_2m_min"]
    )
    features["humidity_cloud"] = (
        features["relative_humidity_2m_mean"] * features["cloud_cover_mean"]
    )

    return features