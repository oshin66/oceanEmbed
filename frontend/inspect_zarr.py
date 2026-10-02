import xarray as xr
import sys

base_dir = "/Users/oshinmendhe10gmail.com/Desktop/CLEAN DATA/OceanEmbed_Processed"
zarr_files = [
    "SST_0.25deg_daily.zarr",
    "SSS_0.25deg_daily.zarr",
    "SSH_0.25deg_daily.zarr",
    "Current_UV_0.25deg_daily.zarr",
    "Wind_UV_0.25deg_daily.zarr"
]

for z in zarr_files:
    try:
        ds = xr.open_zarr(f"{base_dir}/{z}")
        print(f"--- {z} ---")
        print(ds)
    except Exception as e:
        print(f"Failed to open {z}: {e}")
