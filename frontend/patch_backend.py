import os

filepath = "/Users/oshinmendhe10gmail.com/Desktop/OceanEmbed_Backend/app/main.py"
with open(filepath, 'r') as f:
    content = f.read()

import_statement = "import numpy as np\n"
if "import numpy" not in content:
    content = content.replace("import pandas as pd", "import pandas as pd\nimport numpy as np")

old_surface = """@app.get("/surface")
def surface(date: str, variable: str):
    if not data_store.check_date(date):
        raise HTTPException(status_code=400, detail="Date outside valid range")
    
    dt = pd.to_datetime(date)
    var = variable.lower()
    
    try:
        if var == 'sst':
            arr = data_store.sst_zarr['sst'].sel(time=dt, method='nearest').values.tolist()
            return {"variable": "sst", "units": "°C", "values": arr}
        elif var == 'sss':
            arr = data_store.sss_zarr['sss'].sel(time=dt, method='nearest').values.tolist()
            return {"variable": "sss", "units": "PSU", "values": arr}
        elif var == 'sla':
            arr = data_store.ssh_zarr['sla'].sel(time=dt, method='nearest').values.tolist()
            return {"variable": "sla", "units": "m", "values": arr}
        elif var == 'current':
            u = data_store.cur_zarr['current_u'].sel(time=dt, method='nearest').values.tolist()
            v = data_store.cur_zarr['current_v'].sel(time=dt, method='nearest').values.tolist()
            return {"variable": "current", "units": "m/s", "u": u, "v": v}
        elif var == 'wind':
            u = data_store.wnd_zarr['wind_u'].sel(time=dt, method='nearest').values.tolist()
            v = data_store.wnd_zarr['wind_v'].sel(time=dt, method='nearest').values.tolist()
            return {"variable": "wind", "units": "m/s", "u": u, "v": v}
        else:
            raise HTTPException(status_code=400, detail="Invalid variable")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))"""

new_surface = """def clean_nan(arr):
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
        raise HTTPException(status_code=500, detail=str(e))"""

content = content.replace(old_surface, new_surface)

with open(filepath, 'w') as f:
    f.write(content)
print("Patch applied successfully.")
