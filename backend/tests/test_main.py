import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    with TestClient(app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["model_loaded"] is True
        assert data["depth_count"] == 15

def test_predict_valid():
    with TestClient(app) as client:
        response = client.post("/predict", json={
            "date": "2025-01-15",
            "latitude": 18.5,
            "longitude": 88.0
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert len(data["depths_m"]) == 15
        assert len(data["temperature_c"]) == 15
        
def test_predict_invalid_date():
    with TestClient(app) as client:
        response = client.post("/predict", json={
            "date": "2020-01-01",
            "latitude": 18.5,
            "longitude": 88.0
        })
        assert response.status_code == 400

def test_predict_out_of_bounds():
    with TestClient(app) as client:
        response = client.post("/predict", json={
            "date": "2025-01-15",
            "latitude": 40.0,
            "longitude": 120.0
        })
        assert response.status_code == 422 # Pydantic validation fails first

def test_metrics():
    with TestClient(app) as client:
        response = client.get("/metrics")
        assert response.status_code == 200
        data = response.json()
        assert "GLORYS_test" in data
        assert "ARGO_validation" in data
