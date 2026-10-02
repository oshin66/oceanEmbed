import numpy as np
import torch
import pandas as pd
from .data_loader import data_store
from .model import predict_cnn
from .utils import get_nearest_grid, haversine


def get_profile(date_str: str, lat: float, lon: float):
    if not data_store.check_date(date_str):
        raise ValueError("Date outside valid range (2024-02-03 to 2026-01-15)")

    i, j, m_lat, m_lon = get_nearest_grid(lat, lon)
    dist = haversine(lat, lon, m_lat, m_lon)

    pad = 4
    if i - pad < 0 or i + pad + 1 > 101 or j - pad < 0 or j + pad + 1 > 241:
        raise ValueError(
            "Requested location is too close to domain boundary to build 9x9 patch"
        )

    dt = pd.to_datetime(date_str)

    # Extract 9x9 patches — all on CPU as numpy arrays
    patch_sst = (
        data_store.sst_zarr['sst']
        .sel(time=dt, method='nearest')
        .isel(latitude=slice(i - pad, i + pad + 1), longitude=slice(j - pad, j + pad + 1))
        .values
    )
    patch_sss = (
        data_store.sss_zarr['sss']
        .sel(time=dt, method='nearest')
        .isel(latitude=slice(i - pad, i + pad + 1), longitude=slice(j - pad, j + pad + 1))
        .values
    )
    patch_sla = (
        data_store.ssh_zarr['sla']
        .sel(time=dt, method='nearest')
        .isel(latitude=slice(i - pad, i + pad + 1), longitude=slice(j - pad, j + pad + 1))
        .values
    )
    patch_u = (
        data_store.cur_zarr['current_u']
        .sel(time=dt, method='nearest')
        .isel(latitude=slice(i - pad, i + pad + 1), longitude=slice(j - pad, j + pad + 1))
        .values
    )
    patch_v = (
        data_store.cur_zarr['current_v']
        .sel(time=dt, method='nearest')
        .isel(latitude=slice(i - pad, i + pad + 1), longitude=slice(j - pad, j + pad + 1))
        .values
    )
    patch_wu = (
        data_store.wnd_zarr['wind_u']
        .sel(time=dt, method='nearest')
        .isel(latitude=slice(i - pad, i + pad + 1), longitude=slice(j - pad, j + pad + 1))
        .values
    )
    patch_wv = (
        data_store.wnd_zarr['wind_v']
        .sel(time=dt, method='nearest')
        .isel(latitude=slice(i - pad, i + pad + 1), longitude=slice(j - pad, j + pad + 1))
        .values
    )

    stack = np.stack(
        [patch_sst, patch_sss, patch_sla, patch_u, patch_v, patch_wu, patch_wv], axis=0
    )

    if np.isnan(stack).any():
        raise ValueError(
            "Requested location patch contains NaN/land values. Cannot perform prediction."
        )

    # Normalize using stored stats
    f_means = np.array(data_store.f_means)[:, None, None]
    f_stds = np.array(data_store.f_stds)[:, None, None]
    norm_stack = (stack - f_means) / f_stds

    # Build tensor explicitly on CPU — predict_cnn will move it to the model device
    tensor_x = torch.tensor(norm_stack, dtype=torch.float32, device="cpu").unsqueeze(0)

    # Predict
    pred_norm = predict_cnn(tensor_x)[0]

    # Inverse-normalize outputs
    t_means = np.array(data_store.t_means)
    t_stds = np.array(data_store.t_stds)
    pred_c = pred_norm * t_stds + t_means

    return {
        "matched_lat": m_lat,
        "matched_lon": m_lon,
        "distance_km": dist,
        "temperature_c": pred_c.tolist(),
    }


def get_reconstruction_map(date_str: str, depth_m: int):
    if not data_store.check_date(date_str):
        raise ValueError("Date outside valid range")
    
    dt = pd.to_datetime(date_str)
    
    # Load full spatial grids
    arr_sst = data_store.sst_zarr['sst'].sel(time=dt, method='nearest').values
    arr_sss = data_store.sss_zarr['sss'].sel(time=dt, method='nearest').values
    arr_sla = data_store.ssh_zarr['sla'].sel(time=dt, method='nearest').values
    arr_u = data_store.cur_zarr['current_u'].sel(time=dt, method='nearest').values
    arr_v = data_store.cur_zarr['current_v'].sel(time=dt, method='nearest').values
    arr_wu = data_store.wnd_zarr['wind_u'].sel(time=dt, method='nearest').values
    arr_wv = data_store.wnd_zarr['wind_v'].sel(time=dt, method='nearest').values
    
    stack = np.stack([arr_sst, arr_sss, arr_sla, arr_u, arr_v, arr_wu, arr_wv], axis=0) # (7, 101, 241)
    
    # We must mask out nan
    # Actually, we can fillna with 0 just to extract patches, but we should mark which patches have NaNs.
    mask = np.isnan(stack).any(axis=0) # (101, 241)
    
    # Normalize
    f_means = np.array(data_store.f_means)[:, None, None]
    f_stds = np.array(data_store.f_stds)[:, None, None]
    norm_stack = (stack - f_means) / f_stds
    norm_stack[np.isnan(norm_stack)] = 0.0 # prevent NaNs in torch unfold
    
    t = torch.tensor(norm_stack, dtype=torch.float32).unsqueeze(0)
    patches = torch.nn.functional.unfold(t, kernel_size=9, stride=1)
    patches = patches.transpose(1, 2).reshape(-1, 7, 9, 9)
    
    mask_t = torch.tensor(mask.astype(np.float32)).unsqueeze(0).unsqueeze(0)
    mask_patches = torch.nn.functional.unfold(mask_t, kernel_size=9, stride=1).sum(dim=1).squeeze(0)
    valid_idx = (mask_patches == 0) # patches with no NaNs
    
    valid_patches = patches[valid_idx]
    
    # Batch predict
    from .model import predict_cnn
    pred_norm = predict_cnn(valid_patches)
    
    depth_labels = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000]
    depth_idx = depth_labels.index(depth_m)
    
    pred_c = pred_norm[:, depth_idx] * data_store.t_stds[depth_idx] + data_store.t_means[depth_idx]
    
    # Reconstruct 2D map
    out = np.full((101 - 8, 241 - 8), np.nan)
    out.flat[valid_idx.numpy()] = pred_c
    
    # Pad back to original 101x241 grid size by padding 4 on all sides
    out_padded = np.pad(out, ((4, 4), (4, 4)), mode='constant', constant_values=np.nan)
    
    lat = data_store.sst_zarr['latitude'].values.tolist()
    lon = data_store.sst_zarr['longitude'].values.tolist()
    
    # Flatten the data for JSON
    values = np.where(np.isnan(out_padded), None, out_padded).tolist()
    
    # Compute min/max on valid values
    valid_vals = out_padded[~np.isnan(out_padded)]
    vmin, vmax = None, None
    if len(valid_vals) > 0:
        vmin = float(np.min(valid_vals))
        vmax = float(np.max(valid_vals))
        
    return {
        "date": date_str,
        "depth_m": depth_m,
        "latitude": lat,
        "longitude": lon,
        "temperature": values,
        "min": vmin,
        "max": vmax,
        "units": "°C"
    }

