import xarray as xr
import pandas as pd
import json
import math

base_dir = "/Users/oshinmendhe10gmail.com/Desktop/CLEAN DATA/OceanEmbed_Processed"
try:
    ds = xr.open_zarr(f"{base_dir}/SST_0.25deg_daily.zarr")
    dt = pd.to_datetime("2025-01-15")
    arr = ds['sst'].sel(time=dt, method='nearest').values
    print("Array shape:", arr.shape)
    
    # Python standard json
    try:
        json.dumps(arr.tolist())
        print("json.dumps passed.")
    except Exception as e:
        print("json.dumps failed:", type(e), e)
        
    import math
    
    # Let's replace NaNs with None which serializes to null
    import numpy as np
    arr_clean = np.where(np.isnan(arr), None, arr)
    try:
        json.dumps(arr_clean.tolist())
        print("json.dumps passed with None.")
    except Exception as e:
        print("json.dumps failed with None:", type(e), e)
        
except Exception as e:
    print("General Exception:", e)

