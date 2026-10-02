import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { useSimulationStore } from '../../../store/useSimulationStore';
import { api } from '../../../services/api';

import { lazy, Suspense } from 'react';
const ExplorePanel = lazy(() => import('./ExplorePanel').then(m => ({ default: m.ExplorePanel })));
const ReconstructPanel = lazy(() => import('./ReconstructPanel').then(m => ({ default: m.ReconstructPanel })));
const AnalyzePanel = lazy(() => import('./AnalyzePanel').then(m => ({ default: m.AnalyzePanel })));
const ValidatePanel = lazy(() => import('./ValidatePanel').then(m => ({ default: m.ValidatePanel })));
import { TimeController } from './TimeController';
import { ColorbarLegend } from './ColorbarLegend';

export function OceanDashboard() {
  const { isIndianOceanFocused } = useSimulationStore(useShallow(state => ({ isIndianOceanFocused: state.isIndianOceanFocused })));
  const { 
    selectedVariable,
    selectedDate,
    surfaceData,
    setSurfaceData, 
    metrics,
    setMetrics,
    argoValidation,
    setArgoValidation,
    setIsLoading,
    setLoadingMessage,
    isLoading,
    loadingMessage,
    setSurfaceError,
    showDebug,
    dashboardMode,
    predictionData,
    profileData
  } = useDashboardStore(useShallow(state => ({
    dashboardMode: state.dashboardMode,
    selectedVariable: state.selectedVariable,
    selectedDate: state.selectedDate,
    surfaceData: state.surfaceData,
    setSurfaceData: state.setSurfaceData, 
    metrics: state.metrics,
    setMetrics: state.setMetrics,
    argoValidation: state.argoValidation,
    setArgoValidation: state.setArgoValidation,
    setIsLoading: state.setIsLoading,
    setLoadingMessage: state.setLoadingMessage,
    isLoading: state.isLoading,
    loadingMessage: state.loadingMessage,
    setSurfaceError: state.setSurfaceError,
    showDebug: state.showDebug,
    predictionData: state.predictionData,
    profileData: state.profileData
  })));

  useEffect(() => {
    const abortController = new AbortController();
    if (isIndianOceanFocused) {
      api.getMetrics(abortController.signal).then(setMetrics).catch(err => { if (err.name !== 'AbortError') console.error(err); });
      api.getArgoValidation(abortController.signal).then(setArgoValidation).catch(err => { if (err.name !== 'AbortError') console.error(err); });
    }
    return () => abortController.abort();
  }, [isIndianOceanFocused, setMetrics, setArgoValidation]);

  useEffect(() => {
    const abortController = new AbortController();
    if (isIndianOceanFocused) {
      if (selectedVariable === 'reconstructed_temp') {
        // Just empty the 2D map for reconstructed temp
        setSurfaceData(null);
        return;
      }

      setIsLoading(true);
      setSurfaceData(null);
      const varName = selectedVariable.replace('_', ' ').toUpperCase();
      setLoadingMessage(`LOADING ${varName}...`);
      
      let apiVar = selectedVariable as string;
      if (apiVar.startsWith('current')) apiVar = 'current';
      if (apiVar.startsWith('wind')) apiVar = 'wind';

      api.getSurfaceData(selectedDate, apiVar, abortController.signal)
        .then(data => {
          setSurfaceData(data);
          setSurfaceError(null);
          setLoadingMessage("DATA READY");
          setTimeout(() => {
            if (!abortController.signal.aborted) {
              setIsLoading(false);
            }
          }, 800);
        })
        .catch(err => {
          if (err.name === 'AbortError') return;
          console.error("Failed to load surface data", err);
          setSurfaceData(null);
          setSurfaceError("NO SURFACE DATA");
          setIsLoading(false);
        });
    }
    return () => abortController.abort();
  }, [isIndianOceanFocused, selectedVariable, selectedDate, setSurfaceData, setIsLoading, setLoadingMessage, setSurfaceError]);


  if (!isIndianOceanFocused) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col pt-[72px] px-6 pb-6 overflow-hidden">
      
      {/* Spacer for header */}
      <div className="h-6 w-full shrink-0" />
      
      {/* MODE PANELS - FLEX LAYOUT */}
      <div className="flex-1 flex justify-between relative min-h-0 w-full pointer-events-none">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md border border-cyan-500/50 p-6 rounded-xl flex flex-col items-center shadow-md">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-white font-mono tracking-widest text-xs animate-pulse">{loadingMessage}</p>
            </div>
          </div>
        )}
        


        {/* Debug Modal */}
        {showDebug && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black/90 border border-cyan-500 p-4 rounded-xl shadow-2xl z-50 text-white font-mono text-xs w-[500px] pointer-events-auto h-[400px] overflow-y-auto">
            <h2 className="text-cyan-400 mb-4 border-b border-cyan-500/30 pb-2">TEMPORARY DEBUG PANEL</h2>
            <div className="flex flex-col gap-2">
              <p>ACTIVE VARIABLE: {selectedVariable}</p>
              <p>CURRENT DATE: {selectedDate}</p>
              <p>SURFACE RESPONSE RECEIVED: {surfaceData ? 'YES' : 'NO'}</p>
              <p>SURFACE VALUE COUNT: {(surfaceData?.values?.length ?? 0) * (surfaceData?.values?.[0]?.length ?? 0)}</p>
              <p>FINITE VALUE COUNT: {surfaceData?.values ? surfaceData.values.flat().filter((v: any) => v !== null).length : 0}</p>
              <p>PREDICTION RECEIVED: {predictionData ? 'YES' : 'NO'}</p>
              <p>PREDICTION VALUE COUNT: {predictionData?.temperature_c?.length || 0}</p>
              <p>PROFILE RECEIVED: {profileData ? 'YES' : 'NO'}</p>
              <p>PROFILE DEPTH COUNT: {profileData?.depths?.length || 0}</p>
              <p>METRICS RECEIVED: {metrics ? 'YES' : 'NO'}</p>
              <p>ARGO METRICS RECEIVED: {argoValidation ? 'YES' : 'NO'}</p>
            </div>
          </div>
        )}
        
        {/* Active Panel Components */}
        {isIndianOceanFocused && (
          <Suspense fallback={<div className="text-[10px] text-white/50 animate-pulse pointer-events-none">Loading mode...</div>}>
            <div className={`flex justify-start gap-6 w-full h-full transition-opacity duration-300 pointer-events-none ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
              {dashboardMode === 'EXPLORE' && <ExplorePanel />}
              {dashboardMode === 'RECONSTRUCT' && <ReconstructPanel />}
              {dashboardMode === 'ANALYZE' && <AnalyzePanel />}
              {dashboardMode === 'VALIDATE' && <ValidatePanel />}
            </div>
          </Suspense>
        )}
      </div>

      {/* BOTTOM LEFT: HISTORICAL DATA (TIME CONTROLLER) */}
      {!isLoading && (
        <div className="absolute bottom-6 left-6 pointer-events-auto z-20">
          <TimeController />
        </div>
      )}

      {/* BOTTOM RIGHT: COLORBAR */}
      <div className="absolute bottom-6 right-6 pointer-events-auto z-20">
        <ColorbarLegend />
      </div>
    </div>
  );
}
