"""
Model service: loads the trained ML models at startup and exposes a predict() function.
The models are loaded ONCE when the FastAPI app boots, so requests are fast.
"""

import json
import os
import numpy as np
import joblib


# Path where the model artifacts live (relative to backend/app/)
MODELS_DIR = os.path.join(os.path.dirname(__file__), "..", "models")


class ModelService:
    def __init__(self):
        self.classifier = None
        self.regressor = None
        self.feature_list = None
        self.metrics = None
        self.preprocessing_info = None
        self._loaded = False

    def load(self):
        """Load all model artifacts from disk. Called once at startup."""
        if self._loaded:
            return

        models_dir = os.path.abspath(MODELS_DIR)

        # Load the two trained models
        self.classifier = joblib.load(os.path.join(models_dir, "rain_classifier.pkl"))
        self.regressor = joblib.load(os.path.join(models_dir, "rain_regressor.pkl"))

        # Load metadata
        with open(os.path.join(models_dir, "feature_list.json")) as f:
            self.feature_list = json.load(f)

        with open(os.path.join(models_dir, "model_metrics.json")) as f:
            self.metrics = json.load(f)

        with open(os.path.join(models_dir, "preprocessing_info.json")) as f:
            self.preprocessing_info = json.load(f)

        self._loaded = True

    def is_loaded(self):
        return self._loaded

    def get_feature_list(self):
        return self.feature_list

    def get_metrics(self):
        return self.metrics

    def predict(self, features: dict) -> dict:
        """
        Run both models on a single feature dict.

        Args:
            features: dict with keys matching self.feature_list

        Returns:
            dict with rain_probability, will_rain, expected_rainfall_mm
        """
        if not self._loaded:
            raise RuntimeError("ModelService not loaded. Call load() first.")

        # Build the feature vector in the EXACT order the model was trained on
        missing = [f for f in self.feature_list if f not in features]
        if missing:
            raise ValueError(f"Missing features: {missing}")

        x = np.array([[features[f] for f in self.feature_list]], dtype=float)

        # Classification: probability of rain tomorrow
        rain_probability = float(self.classifier.predict_proba(x)[0, 1])
        will_rain = rain_probability >= 0.5

        # Regression: predicted rainfall in log space, then inverse-transform
        pred_log = float(self.regressor.predict(x)[0])
        expected_rainfall_mm = float(np.expm1(pred_log))

        # Clamp negatives to 0 (shouldn't happen after expm1, but safe)
        expected_rainfall_mm = max(0.0, expected_rainfall_mm)

        return {
            "rain_probability": round(rain_probability, 4),
            "will_rain": will_rain,
            "expected_rainfall_mm": round(expected_rainfall_mm, 2),
        }


# Single global instance shared across the app
model_service = ModelService()