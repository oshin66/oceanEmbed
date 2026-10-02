import os
import json
import zarr
import xarray as xr
import pandas as pd
from .config import settings

class DataLoader:
    def __init__(self):
        self.stats = None
        self.sst_zarr = None
        self.sss_zarr = None
        self.ssh_zarr = None
        self.cur_zarr = None
        self.wnd_zarr = None
        self.t_means = None
        self.t_stds = None
        self.f_means = None
        self.f_stds = None
        
    def initialize(self):
        if not os.path.exists(settings.normalization_path):
            raise FileNotFoundError(f"Stats file missing: {settings.normalization_path}")
            
        with open(settings.normalization_path, 'r') as f:
            self.stats = json.load(f)
            
        print("Normalization loaded: YES")
        
        targets = ['T_0', 'T_5', 'T_10', 'T_20', 'T_30', 'T_50', 'T_75', 'T_100', 'T_125', 'T_150', 'T_200', 'T_300', 'T_500', 'T_700', 'T_1000']
        inputs = ['sst', 'sss', 'sla', 'current_u', 'current_v', 'wind_u', 'wind_v']
        
        self.t_means = [self.stats["target_statistics"][t]["mean"] for t in targets]
        self.t_stds = [self.stats["target_statistics"][t]["std"] for t in targets]
        self.f_means = [self.stats["input_statistics"][f]["mean"] for f in inputs]
        self.f_stds = [self.stats["input_statistics"][f]["std"] for f in inputs]

        # Lazy open zarr
        self.sst_zarr = xr.open_zarr(os.path.join(settings.data_root, "SST_0.25deg_daily.zarr"), consolidated=False)
        self.sss_zarr = xr.open_zarr(os.path.join(settings.data_root, "SSS_0.25deg_daily.zarr"), consolidated=False)
        self.ssh_zarr = xr.open_zarr(os.path.join(settings.data_root, "SSH_0.25deg_daily.zarr"), consolidated=False)
        self.cur_zarr = xr.open_zarr(os.path.join(settings.data_root, "Current_UV_0.25deg_daily.zarr"), consolidated=False)
        self.wnd_zarr = xr.open_zarr(os.path.join(settings.data_root, "Wind_UV_0.25deg_daily.zarr"), consolidated=False)
        
    def check_date(self, date_str: str):
        try:
            dt = pd.to_datetime(date_str)
            d1 = pd.to_datetime("2024-02-03")
            d2 = pd.to_datetime("2026-01-15")
            if dt < d1 or dt > d2:
                return False
            return True
        except:
            return False

data_store = DataLoader()
