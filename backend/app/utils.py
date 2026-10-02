import numpy as np
import math

def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    lat1_rad, lon1_rad = math.radians(lat1), math.radians(lon1)
    lat2_rad, lon2_rad = math.radians(lat2), math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def get_nearest_grid(lat, lon, lat_min=5.0, lat_max=30.0, lon_min=45.0, lon_max=105.0, step=0.25):
    i = int(round((lat - lat_min) / step))
    j = int(round((lon - lon_min) / step))
    
    grid_lat = lat_min + i * step
    grid_lon = lon_min + j * step
    return i, j, grid_lat, grid_lon
