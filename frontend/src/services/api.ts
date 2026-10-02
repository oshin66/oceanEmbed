const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model: string;
  depth_count: number;
  grid_resolution_deg: number;
  date_start: string;
  date_end: string;
}

export interface SurfaceResponse {
  date: string;
  variable: string;
  latitude: number[];
  longitude: number[];
  units: string;
  // Based on the endpoint, it will either have "values" or "u", "v", "speed"
  values?: (number | null)[][];
  u?: (number | null)[][];
  v?: (number | null)[][];
  speed?: (number | null)[][];
}

export interface PredictResponse {
  status: string;
  model: string;
  date: string;
  requested_location: { latitude: number; longitude: number };
  matched_grid: { latitude: number; longitude: number; distance_km: number };
  depths_m: number[];
  temperature_c: number[];
  temperature_profile: Record<string, number>;
}

export interface ProfileResponse {
  depths: number[];
  temperature: number[];
}

export interface ValidationMetrics {
  overall: {
    rmse: number | null;
    mae: number | null;
    bias: number | null;
    correlation: number | null;
  };
  depths: number[];
  rmse_by_depth: number[];
  mae_by_depth: number[];
  bias_by_depth: number[];
  correlation_by_depth: number[];
}

export interface MetricsResponse {
  model: string;
  GLORYS_test: { RMSE_C: number; MAE_C: number };
  ARGO_validation: { RMSE_C: number; MAE_C: number };
  glorys?: ValidationMetrics;
  argo?: ValidationMetrics;
}

export interface ArgoValidation {
  depth_m: number;
  RMSE_C: number;
  MAE_C: number;
  Bias_C: number;
  Correlation: number;
  N: number;
}

export const api = {
  checkHealth: async (signal?: AbortSignal): Promise<HealthResponse> => {
    const res = await fetch(`${API_BASE_URL}/health`, { signal });
    if (!res.ok) throw new Error('API Offline');
    return res.json();
  },

  getSurfaceData: async (date: string, variable: string, signal?: AbortSignal): Promise<SurfaceResponse> => {
    const res = await fetch(`${API_BASE_URL}/surface?date=${date}&variable=${variable}`, { signal });
    if (!res.ok) throw new Error('Surface Data Not Available');
    return res.json();
  },

  getPrediction: async (date: string, latitude: number, longitude: number, signal?: AbortSignal): Promise<PredictResponse> => {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, latitude, longitude }),
      signal
    });
    if (!res.ok) throw new Error('Prediction Failed');
    return res.json();
  },

  getTemperatureProfile: async (date: string, latitude: number, longitude: number, signal?: AbortSignal): Promise<ProfileResponse> => {
    const res = await fetch(`${API_BASE_URL}/profile?date=${date}&latitude=${latitude}&longitude=${longitude}`, { signal });
    if (!res.ok) throw new Error('Profile Not Available');
    return res.json();
  },

  getMetrics: async (signal?: AbortSignal): Promise<MetricsResponse> => {
    const res = await fetch(`${API_BASE_URL}/metrics`, { signal });
    if (!res.ok) throw new Error('Metrics Not Available');
    return res.json();
  },

  getArgoValidation: async (signal?: AbortSignal): Promise<ArgoValidation[]> => {
    const res = await fetch(`${API_BASE_URL}/validation/argo`, { signal });
    if (!res.ok) throw new Error('ARGO Validation Not Available');
    return res.json();
  }
};
