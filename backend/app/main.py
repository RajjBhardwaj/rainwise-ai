from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    LocationPredictionResponse,
    HarvestRequest,
    HarvestResponse,
)
from app.services.model_service import model_service
from app.services.weather_service import fetch_full_weather
from app.services.feature_builder import build_features
from app.services.harvest_service import (
    calculate_harvest,
    HarvestError,
    list_roof_materials,
)
from app.services import reviews_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load the ML models once at startup."""
    print("Loading ML models...")
    model_service.load()
    print(f"Models loaded. {len(model_service.get_feature_list())} features.")
    yield
    print("Shutting down.")


app = FastAPI(
    title="RainWise AI API",
    description="AI-based rainfall prediction and rainwater harvesting optimization backend",
    version="0.3.0",
    lifespan=lifespan,
)

# Allow the React frontend (localhost:5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health_check():
    """Simple health-check endpoint to verify the server is running."""
    return {"status": "ok", "message": "Rainfall Harvesting API is running"}


@app.post("/api/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """
    Predict rain probability and expected rainfall for tomorrow
    given today's weather + recent precipitation history.
    """
    try:
        features = request.model_dump()
        result = model_service.predict(features)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


@app.get("/api/predict-by-location", response_model=LocationPredictionResponse)
def predict_by_location(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
):
    """
    Full pipeline: fetch live weather for a location, build features,
    and predict rain probability + expected rainfall.
    """
    try:
        weather = fetch_full_weather(lat, lon)
        features = build_features(lat, lon, weather)
        prediction = model_service.predict(features)

        return {
            "latitude": lat,
            "longitude": lon,
            "rain_probability": prediction["rain_probability"],
            "will_rain": prediction["will_rain"],
            "expected_rainfall_mm": prediction["expected_rainfall_mm"],
            "weather_today": weather["current"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")


@app.post("/api/harvest", response_model=HarvestResponse)
def harvest(request: HarvestRequest):
    """
    Calculate harvestable rainwater for a given rainfall event and roof configuration.
    """
    try:
        return calculate_harvest(
            rainfall_mm=request.rainfall_mm,
            area_m2=request.area_m2,
            roof_material=request.roof_material,
            household_size=request.household_size,
            include_first_flush=request.include_first_flush,
            include_filtration=request.include_filtration,
        )
    except HarvestError as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/roof-materials")
def roof_materials():
    """Return the supported roof materials with their runoff coefficients."""
    return list_roof_materials()


# ---------------------------------------------------------------------------
# User reviews
# ---------------------------------------------------------------------------

class ReviewCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Reviewer's name")
    message: str = Field(..., min_length=10, max_length=1000, description="Review text")
    rating: int = Field(..., ge=1, le=5, description="Star rating 1–5")
    location: str = Field(default="", max_length=100, description="City / region (optional)")


@app.get("/api/reviews")
def list_reviews():
    """Return all user-submitted reviews, sorted newest first."""
    return reviews_service.get_reviews()


@app.post("/api/reviews", status_code=201)
def submit_review(body: ReviewCreate):
    """
    Persist a new user review.
    Returns the saved review object (including generated id and created_at).
    """
    try:
        review = reviews_service.add_review(
            name=body.name,
            message=body.message,
            rating=body.rating,
            location=body.location,
        )
        return review
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save review: {e}")
    

@app.get("/api/feature-importances")
def feature_importances():
    """Return feature importances from the trained ML classifier."""
    try:
        return {"features": model_service.get_feature_importances()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed: {e}")