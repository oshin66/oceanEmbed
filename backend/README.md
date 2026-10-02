# OceanEmbed FastAPI Backend

This is the inference server for the OceanEmbed Model 3 CNN.

## Setup
1. Create a Python 3.10+ virtual environment: `python3 -m venv venv && source venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and adjust the paths if necessary.

## Running
`uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`

## Endpoints
- `GET /health`
- `POST /predict`
- `GET /profile`
- `GET /surface`
- `GET /metrics`
- `GET /validation/argo`

## Documentation
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
