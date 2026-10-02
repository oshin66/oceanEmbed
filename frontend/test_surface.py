import sys
import pandas as pd
sys.path.append("/Users/oshinmendhe10gmail.com/Desktop/OceanEmbed_Backend")
# pyrefly: ignore [missing-import]
from app.data_loader import data_store
import math

data_store.initialize()

dt = pd.to_datetime("2025-01-15")

print("Testing SST extraction...")
try:
    arr = data_store.sst_zarr['sst'].sel(time=dt, method='nearest').values
    print("Array shape:", arr.shape)
    import json
    # Try standard json serialization
    json.dumps(arr.tolist())
    print("Standard JSON serialization passed.")
    
    import orjson
    orjson.dumps(arr.tolist())
    print("orjson serialization passed.")
except Exception as e:
    print("Exception occurred:", type(e), e)

