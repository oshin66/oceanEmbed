from pydantic import BaseModel, Field
from typing import List, Dict

class PredictRequest(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    latitude: float = Field(..., ge=5.0, le=30.0, description="Latitude between 5.0 and 30.0")
    longitude: float = Field(..., ge=45.0, le=105.0, description="Longitude between 45.0 and 105.0")

class Location(BaseModel):
    latitude: float
    longitude: float

class MatchedGrid(BaseModel):
    latitude: float
    longitude: float
    distance_km: float

class PredictResponse(BaseModel):
    status: str
    model: str
    date: str
    requested_location: Location
    matched_grid: MatchedGrid
    depths_m: List[float]
    temperature_c: List[float]
    temperature_profile: Dict[str, float]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str
    model: str
    depth_count: int
    grid_resolution_deg: float
    date_start: str
    date_end: str
