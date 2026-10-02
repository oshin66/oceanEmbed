from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import pandas as pd
import numpy as np
import os
import json

from .schemas import PredictRequest, PredictResponse, HealthResponse, Location, MatchedGrid
from . import model as app_model
from .model import load_model
from .data_loader import data_store
from .inference import get_profile
from .config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup checks
    if not os.path.exists(settings.data_root):
        raise RuntimeError(f"DATA_ROOT not found: {settings.data_root}")
    
    load_model()
    data_store.initialize()
    yield
    # Shutdown
    pass

app = FastAPI(title="OceanEmbed API", lifespan=lifespan)

# CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

depth_labels = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000]

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        model_loaded=app_model.model_loaded,
        device=str(app_model.device),
        model="OceanEmbed CNN",
        depth_count=15,
        grid_resolution_deg=0.25,
        date_start="2024-02-03",
        date_end="2026-01-15"
    )

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        res = get_profile(req.date, req.latitude, req.longitude)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    t_c = res["temperature_c"]
    profile_dict = {f"T_{depth_labels[i]}": t_c[i] for i in range(15)}
    
    return PredictResponse(
        status="success",
        model="OceanEmbed CNN",
        date=req.date,
        requested_location=Location(latitude=req.latitude, longitude=req.longitude),
        matched_grid=MatchedGrid(
            latitude=res["matched_lat"],
            longitude=res["matched_lon"],
            distance_km=res["distance_km"]
        ),
        depths_m=depth_labels,
        temperature_c=t_c,
        temperature_profile=profile_dict
    )

@app.get("/profile")
def profile(date: str, latitude: float, longitude: float):
    try:
        res = get_profile(date, latitude, longitude)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {
        "depths": depth_labels,
        "temperature": res["temperature_c"]
    }

def clean_nan(arr):
    return np.where(np.isnan(arr), None, arr).tolist()

@app.get("/surface")
def surface(date: str, variable: str):
    if not data_store.check_date(date):
        raise HTTPException(status_code=400, detail="Date outside valid range")
    
    dt = pd.to_datetime(date)
    var = variable.lower()
    
    try:
        lat = data_store.sst_zarr['latitude'].values.tolist()
        lon = data_store.sst_zarr['longitude'].values.tolist()
        
        if var == 'sst':
            arr = data_store.sst_zarr['sst'].sel(time=dt, method='nearest').values
            return {"date": date, "variable": "sst", "latitude": lat, "longitude": lon, "units": "°C", "values": clean_nan(arr)}
        elif var == 'sss':
            arr = data_store.sss_zarr['sss'].sel(time=dt, method='nearest').values
            return {"date": date, "variable": "sss", "latitude": lat, "longitude": lon, "units": "PSU", "values": clean_nan(arr)}
        elif var == 'sla':
            arr = data_store.ssh_zarr['sla'].sel(time=dt, method='nearest').values
            return {"date": date, "variable": "sla", "latitude": lat, "longitude": lon, "units": "m", "values": clean_nan(arr)}
        elif var == 'current':
            u = data_store.cur_zarr['current_u'].sel(time=dt, method='nearest').values
            v = data_store.cur_zarr['current_v'].sel(time=dt, method='nearest').values
            speed = np.sqrt(u**2 + v**2)
            return {"date": date, "variable": "current", "latitude": lat, "longitude": lon, "units": "m/s", "u": clean_nan(u), "v": clean_nan(v), "speed": clean_nan(speed)}
        elif var == 'wind':
            u = data_store.wnd_zarr['wind_u'].sel(time=dt, method='nearest').values
            v = data_store.wnd_zarr['wind_v'].sel(time=dt, method='nearest').values
            speed = np.sqrt(u**2 + v**2)
            return {"date": date, "variable": "wind", "latitude": lat, "longitude": lon, "units": "m/s", "u": clean_nan(u), "v": clean_nan(v), "speed": clean_nan(speed)}
        else:
            raise HTTPException(status_code=400, detail="Invalid variable")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

_cached_metrics = None

@app.get("/metrics")
def metrics():
    global _cached_metrics
    if _cached_metrics is None:
        import numpy as np
        
        glorys_bias, glorys_corr = None, None
        argo_bias, argo_corr = None, None
        depth_labels = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000]

        try:
            cnn_path = os.path.join(settings.data_root, "cnn_test_predictions.csv")
            if os.path.exists(cnn_path):
                df_cnn = pd.read_csv(cnn_path)
                t_all, p_all = [], []
                for d in depth_labels:
                    if f"true_T_{d}" in df_cnn.columns and f"pred_T_{d}" in df_cnn.columns:
                        t = df_cnn[f"true_T_{d}"].values
                        p = df_cnn[f"pred_T_{d}"].values
                        valid = ~np.isnan(t) & ~np.isnan(p)
                        t_all.extend(t[valid])
                        p_all.extend(p[valid])
                if len(t_all) > 0:
                    t_arr = np.array(t_all)
                    p_arr = np.array(p_all)
                    glorys_bias = float(np.mean(p_arr - t_arr))
                    glorys_corr = float(np.corrcoef(p_arr, t_arr)[0, 1])
        except Exception:
            pass

        try:
            argo_val_path = os.path.join(settings.data_root, "Argo_Validation", "argo_model_validation.parquet")
            if os.path.exists(argo_val_path):
                df_argo = pd.read_parquet(argo_val_path)
                at_all, ap_all = [], []
                for d in depth_labels:
                    if f"argo_T_{d}" in df_argo.columns and f"pred_T_{d}" in df_argo.columns:
                        t = df_argo[f"argo_T_{d}"].values
                        p = df_argo[f"pred_T_{d}"].values
                        valid = ~np.isnan(t) & ~np.isnan(p)
                        at_all.extend(t[valid])
                        ap_all.extend(p[valid])
                if len(at_all) > 0:
                    at_arr = np.array(at_all)
                    ap_arr = np.array(ap_all)
                    argo_bias = float(np.mean(ap_arr - at_arr))
                    argo_corr = float(np.corrcoef(ap_arr, at_arr)[0, 1])
        except Exception:
            pass
            
        _cached_metrics = {
            "glorys_bias": glorys_bias,
            "glorys_corr": glorys_corr,
            "argo_bias": argo_bias,
            "argo_corr": argo_corr
        }

    # Base overall metrics
    glorys_overall_rmse = 1.1037
    glorys_overall_mae = 0.8041
    argo_overall_rmse = 0.9768
    argo_overall_mae = 0.6775

    base_response = {
        "model": "OceanEmbed CNN",
        "GLORYS_test": {
            "RMSE_C": glorys_overall_rmse,
            "MAE_C": glorys_overall_mae
        },
        "ARGO_validation": {
            "RMSE_C": argo_overall_rmse,
            "MAE_C": argo_overall_mae
        },
        "glorys": {
            "overall": {
                "rmse": glorys_overall_rmse,
                "mae": glorys_overall_mae,
                "bias": _cached_metrics["glorys_bias"],
                "correlation": _cached_metrics["glorys_corr"]
            },
            "depths": None,
            "rmse_by_depth": None,
            "mae_by_depth": None,
            "bias_by_depth": None,
            "correlation_by_depth": None
        },
        "argo": {
            "overall": {
                "rmse": argo_overall_rmse,
                "mae": argo_overall_mae,
                "bias": _cached_metrics["argo_bias"],
                "correlation": _cached_metrics["argo_corr"]
            },
            "depths": None,
            "rmse_by_depth": None,
            "mae_by_depth": None,
            "bias_by_depth": None,
            "correlation_by_depth": None
        }
    }

    glorys_path = os.path.join(settings.data_root, "model2_depth_metrics.csv")
    argo_path = os.path.join(settings.data_root, "Argo_Validation", "argo_model_depth_metrics.csv")

    def parse_metrics(path):
        if not os.path.exists(path):
            return None
        df = pd.read_csv(path)
        if len(df) != 15:
            raise HTTPException(status_code=500, detail=f"Mismatched depths length in {path}")
        
        depths = df["depth_m"].tolist() if "depth_m" in df.columns else None
        rmse = df["RMSE_C"].tolist() if "RMSE_C" in df.columns else None
        mae = df["MAE_C"].tolist() if "MAE_C" in df.columns else None
        bias = df["Bias_C"].tolist() if "Bias_C" in df.columns else None
        corr = df["Correlation"].tolist() if "Correlation" in df.columns else None
        
        if depths is not None and len(depths) != 15:
            raise HTTPException(status_code=500, detail="Depths array must be length 15")
        
        for arr in [rmse, mae, bias, corr]:
            if arr is not None and len(arr) != 15:
                raise HTTPException(status_code=500, detail="Metric arrays must be length 15 if present")

        return {
            "depths": depths,
            "rmse_by_depth": rmse,
            "mae_by_depth": mae,
            "bias_by_depth": bias,
            "correlation_by_depth": corr
        }

    glorys_data = parse_metrics(glorys_path)
    if glorys_data:
        base_response["glorys"].update(glorys_data)
        
    argo_data = parse_metrics(argo_path)
    if argo_data:
        base_response["argo"].update(argo_data)

    return base_response

@app.get("/validation/argo")
def validation_argo():
    path = os.path.join(settings.data_root, "Argo_Validation", "argo_model_depth_metrics.csv")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="ARGO metrics not found")
    df = pd.read_csv(path)
    return df.to_dict(orient="records")

@app.get("/reconstruction-map")
def reconstruction_map(date: str, depth: int):
    from .inference import get_reconstruction_map
    try:
        res = get_reconstruction_map(date, depth)
        return res
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
