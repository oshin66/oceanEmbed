import pandas as pd
import json
import os

print("Loading data...")
file_path = "/Users/oshinmendhe10gmail.com/Desktop/CLEAN DATA/OceanEmbed_Processed/training_dataset_713days.parquet"

df = pd.read_parquet(file_path, columns=['day_id', 'latitude', 'longitude', 'sst', 'sss', 'sla', 'current_u', 'current_v', 'wind_u', 'wind_v'])

print(f"Loaded {len(df)} records. Sampling data...")

most_recent_day = df['day_id'].max()
spatial_df = df[df['day_id'] == most_recent_day]

if len(spatial_df) > 10000:
    spatial_df = spatial_df.sample(10000, random_state=42)

# Calculate anomaly relative to the entire dataset mean (for demonstration of anomaly)
for col in ['sst', 'sss', 'sla', 'wind_u', 'wind_v']:
    spatial_df[f'{col}_anomaly'] = spatial_df[col] - df[col].mean()

spatial_data = spatial_df.to_dict(orient='records')
print(f"Spatial data points: {len(spatial_data)}")

timeseries_df = df.groupby('day_id').agg({
    'sst': ['mean', 'min', 'max'],
    'sss': ['mean', 'min', 'max'],
    'sla': ['mean', 'min', 'max'],
    'wind_u': 'mean',
    'wind_v': 'mean',
    'current_u': 'mean',
    'current_v': 'mean'
}).reset_index()

timeseries_df.columns = ['_'.join(col).strip() if col[1] else col[0] for col in timeseries_df.columns.values]
timeseries_data = timeseries_df.to_dict(orient='records')
print(f"Timeseries days: {len(timeseries_data)}")

output_dir = "/Users/oshinmendhe10gmail.com/Documents/earth2/public/data"
os.makedirs(output_dir, exist_ok=True)

with open(os.path.join(output_dir, 'ocean_spatial.json'), 'w') as f:
    json.dump(spatial_data, f)

with open(os.path.join(output_dir, 'ocean_timeseries.json'), 'w') as f:
    json.dump(timeseries_data, f)

print("Data preparation complete!")
