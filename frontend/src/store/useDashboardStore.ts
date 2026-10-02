import { create } from 'zustand';
import type { SurfaceResponse, PredictResponse, ProfileResponse, MetricsResponse, ArgoValidation } from '../services/api';

export type OceanVariable = 'sst' | 'sss' | 'sla' | 'current_u' | 'current_v' | 'wind_u' | 'wind_v' | 'reconstructed_temp';
export type DashboardMode = 'EXPLORE' | 'RECONSTRUCT' | 'ANALYZE' | 'VALIDATE';

interface DashboardState {
  dashboardMode: DashboardMode;
  setDashboardMode: (mode: DashboardMode) => void;
  apiStatus: 'CONNECTED' | 'OFFLINE' | 'CONNECTING';
  setApiStatus: (status: 'CONNECTED' | 'OFFLINE' | 'CONNECTING') => void;
  
  isModelReady: boolean;
  setIsModelReady: (ready: boolean) => void;
  
  selectedVariable: OceanVariable;
  setSelectedVariable: (v: OceanVariable) => void;
  
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  
  selectedLocation: { latitude: number; longitude: number; regionName?: string } | null;
  setSelectedLocation: (loc: { latitude: number; longitude: number; regionName?: string } | null) => void;

  selectedDepth: number;
  setSelectedDepth: (d: number) => void;

  surfaceData: SurfaceResponse | null;
  setSurfaceData: (data: SurfaceResponse | null) => void;
  
  predictionData: PredictResponse | null;
  setPredictionData: (data: PredictResponse | null) => void;

  profileData: ProfileResponse | null;
  setProfileData: (data: ProfileResponse | null) => void;

  metrics: MetricsResponse | null;
  setMetrics: (data: MetricsResponse | null) => void;

  argoValidation: ArgoValidation[] | null;
  setArgoValidation: (data: ArgoValidation[] | null) => void;

  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  loadingMessage: string;
  setLoadingMessage: (msg: string) => void;
  
  predictionError: string | null;
  setPredictionError: (err: string | null) => void;

  surfaceError: string | null;
  setSurfaceError: (err: string | null) => void;

  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dashboardMode: 'EXPLORE',
  setDashboardMode: (mode) => set({ dashboardMode: mode }),
  
  apiStatus: 'CONNECTING',
  setApiStatus: (status) => set({ apiStatus: status }),
  
  isModelReady: false,
  setIsModelReady: (ready) => set({ isModelReady: ready }),
  
  selectedVariable: 'sst',
  setSelectedVariable: (v) => set({ selectedVariable: v }),
  
  selectedDate: '2025-01-15',
  setSelectedDate: (d) => set({ selectedDate: d, predictionData: null, profileData: null }),
  
  selectedLocation: { latitude: 14.0, longitude: 89.0, regionName: 'Bay of Bengal' },
  setSelectedLocation: (loc) => set({ selectedLocation: loc, predictionData: null, profileData: null }),

  selectedDepth: 0,
  setSelectedDepth: (d) => set({ selectedDepth: d }),

  surfaceData: null,
  setSurfaceData: (data) => set({ surfaceData: data }),
  
  predictionData: null,
  setPredictionData: (data) => set({ predictionData: data }),

  profileData: null,
  setProfileData: (data) => set({ profileData: data }),

  metrics: null,
  setMetrics: (data) => set({ metrics: data }),

  argoValidation: null,
  setArgoValidation: (data) => set({ argoValidation: data }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  loadingMessage: '',
  setLoadingMessage: (msg) => set({ loadingMessage: msg }),

  predictionError: null,
  setPredictionError: (err) => set({ predictionError: err }),

  surfaceError: null,
  setSurfaceError: (err) => set({ surfaceError: err }),

  showDebug: false,
  setShowDebug: (show) => set({ showDebug: show }),
}));
