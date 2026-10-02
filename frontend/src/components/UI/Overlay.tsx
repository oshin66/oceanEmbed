import { useEffect, useState } from 'react';
import { useSimulationStore } from '../../store/useSimulationStore';
import { ChevronsDown, Bug, Globe } from 'lucide-react';
import { VortexText } from './VortexLogo';
import { api } from '../../services/api';
import { useDashboardStore } from '../../store/useDashboardStore';

export function Overlay() {
  const isPaused = useSimulationStore((state) => state.isPaused);
  const setIsPaused = useSimulationStore((state) => state.setIsPaused);
  const introStage = useSimulationStore((state) => state.introStage);
  const pageIndex = useSimulationStore((state) => state.pageIndex);
  const setPageIndex = useSimulationStore((state) => state.setPageIndex);
  const isIndianOceanFocused = useSimulationStore((state) => state.isIndianOceanFocused);
  const toggleIndianOceanFocus = useSimulationStore((state) => state.toggleIndianOceanFocus);
  const showOceanFrontend = useSimulationStore((state) => state.showOceanFrontend);
  const { apiStatus, setApiStatus, isModelReady, setIsModelReady, surfaceData, dashboardMode, setDashboardMode } = useDashboardStore();
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    let cancelled = false;

    const checkHealth = async () => {
      try {
        console.log("API BASE URL:", import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000');
        const response = await api.checkHealth();
        console.log("HEALTH RESPONSE:", response);
        console.log("HEALTH STATUS:", response?.status);
        console.log("MODEL LOADED:", response?.model_loaded);
        
        if (!cancelled) {
          setApiStatus(response?.status === 'ok' ? 'CONNECTED' : 'OFFLINE');
          setIsModelReady(response?.model_loaded === true);
        }
      } catch (err) {
        console.error("Health check failed:", err);
        if (!cancelled) {
          setApiStatus('OFFLINE');
          setIsModelReady(false);
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [setApiStatus, setIsModelReady]);

  useEffect(() => {
    let internalTime = Date.now();
    let lastTick = Date.now();
    const interval = setInterval(() => {
      const state = useSimulationStore.getState();
      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;
      if (!state.isPaused) {
        internalTime += delta * state.timeMultiplier;
      }
      const date = new Date(internalTime);
      const h = date.getUTCHours().toString().padStart(2, '0');
      const m = date.getUTCMinutes().toString().padStart(2, '0');
      const s = date.getUTCSeconds().toString().padStart(2, '0');
      setTimeString(`UTC ${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ESC exits explore mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const store = useSimulationStore.getState();
      if (e.key === 'Escape' && store.isExploring) {
        store.toggleExplore();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className={`absolute inset-0 pointer-events-none z-10 transition-opacity duration-1000 ${introStage !== 'done' ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* SHARED TOP CONTROL BAR */}
      <header 
        className={`pointer-events-none z-50 w-full h-[72px] absolute top-0 left-0 right-0 flex items-center justify-between px-6 transition-all duration-500 ${pageIndex === 0 ? 'bg-black/40 backdrop-blur-md' : 'bg-transparent'}`} 
      >
        {/* Left Side: VORTEX Branding */}
        <div className={`flex items-center gap-6 pointer-events-auto shrink-0 w-[300px] h-full ${pageIndex === 0 ? 'border-b border-white/10' : 'border-transparent'}`}>
          {!showOceanFrontend && <VortexText />}
        </div>

        {/* Center: Title & Navigation */}
        <div className="flex flex-col items-center justify-center pointer-events-auto gap-2 flex-1">
          {/* Main Title */}
          {showOceanFrontend && (
            <div className="flex flex-col items-center">
              <span className="text-white font-bold tracking-[0.2em] text-sm uppercase">OCEANEMBED</span>
              <span className="text-white/40 text-[9px] tracking-widest font-mono uppercase">Satellite-Based Subsurface Ocean Temperature Reconstruction</span>
            </div>
          )}
          {/* Navigation */}
          {isIndianOceanFocused && (
            <div className="flex gap-4">
              {(['EXPLORE', 'RECONSTRUCT', 'ANALYZE', 'VALIDATE'] as const).map((mode) => (
                 <button 
                   key={mode} 
                   onClick={() => setDashboardMode(mode)}
                   className={`text-[10px] font-mono tracking-widest transition-colors px-3 py-1 rounded-full ${dashboardMode === mode ? 'text-cyan-400 bg-cyan-900/40 border border-cyan-500/50' : 'text-white/50 hover:text-white border border-transparent'}`}
                 >
                   {mode}
                 </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Status Badges, Historical Data, Back to Global */}
        <div className="flex items-center justify-end gap-4 pointer-events-auto shrink-0 w-[300px]">
          {/* Status Badges */}
          <div 
            className="flex gap-1.5"
            style={{
              opacity: pageIndex !== 0 ? 0 : 1,
              pointerEvents: pageIndex !== 0 ? 'none' : 'auto',
              transition: 'all 0.5s ease-in-out',
            }}
          >
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[8px] font-mono tracking-widest ${
              apiStatus === 'CONNECTED' ? 'bg-cyan-500/10 border-cyan-500/30 text-white' :
              apiStatus === 'OFFLINE' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
              'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                apiStatus === 'CONNECTED' ? 'bg-cyan-400' :
                apiStatus === 'OFFLINE' ? 'bg-red-400' :
                'bg-yellow-400 animate-pulse'
              }`}></div>
              {apiStatus === 'CONNECTED' ? 'API' : 'API'}
            </div>

            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[8px] font-mono tracking-widest ${
              isModelReady ? 'bg-cyan-500/10 border-cyan-500/30 text-white' : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isModelReady ? 'bg-cyan-400' : 'bg-red-400'}`}></div>
              {isModelReady ? 'MODEL' : 'MODEL'}
            </div>

            <div className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[8px] font-mono tracking-widest ${
              surfaceData ? 'bg-cyan-500/10 border-cyan-500/30 text-white' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${surfaceData ? 'bg-cyan-400' : 'bg-yellow-400 animate-pulse'}`}></div>
              {surfaceData ? 'DATA' : 'DATA'}
            </div>
          </div>

          {/* Historical Data & Time */}
          <div
            className="flex items-center gap-2"
            style={{
              opacity: pageIndex !== 0 ? 0 : 1,
              pointerEvents: pageIndex !== 0 ? 'none' : 'auto',
              transition: 'opacity 0.5s ease-in-out',
            }}
          >
            <div className="flex items-center gap-1.5 text-white/80 text-[8px] font-mono tracking-widest uppercase bg-black/40 px-2 py-1 rounded border border-white/10">
              <span className="relative flex h-1.5 w-1.5">
                {!isPaused && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                )}
                <span
                  className={`relative inline-flex rounded-full h-1.5 w-1.5 ${!isPaused ? 'bg-blue-500' : 'bg-white/40'}`}
                />
              </span>
              HISTORICAL
              <span className="text-white/50 ml-1">{timeString}</span>
            </div>
          </div>

          {/* Back to Global */}
          {isIndianOceanFocused && (
            <button 
              onClick={toggleIndianOceanFocus}
              className="bg-black/40 border border-cyan-500/50 hover:bg-cyan-900/60 text-white px-3 py-1 rounded shadow-[0_0_15px_rgba(6,182,212,0.2)] font-mono text-[9px] tracking-widest flex items-center gap-1.5 transition-all"
            >
              <Globe size={12} /> BACK
            </button>
          )}
        </div>
      </header>

      {/* Secondary Top Left: Indian Ocean Badge / Button */}
      <div
        style={{ position: 'absolute', top: 96, left: 24 }}
        className="pointer-events-auto flex flex-col items-start z-40"
      >

        {/* Indian Ocean Badge */}
        <button
          onClick={() => {
            toggleIndianOceanFocus();
            if (!isIndianOceanFocused) {
              window.dispatchEvent(new CustomEvent('focus-location', { detail: { lon: 70 } }));
            } else {
              setIsPaused(false);
            }
          }}
          style={{
            opacity: pageIndex !== 0 ? 0 : (isIndianOceanFocused ? 0 : 1),
            pointerEvents: pageIndex !== 0 ? 'none' : (isIndianOceanFocused ? 'none' : 'auto'),
          }}
          className={`flex items-center justify-center w-[150px] h-[70px] border rounded-xl text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.15)] ${
            isIndianOceanFocused 
              ? 'bg-cyan-400/20 backdrop-blur-md border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' 
              : 'bg-black/30 backdrop-blur-md border-cyan-500/40 text-white/90 hover:text-white hover:bg-cyan-900/40 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,0.8)]"></div>
            INDIAN OCEAN
          </div>
        </button>
      </div>

      {/* Secondary Top Right: Status and Time (Removed, moved to header) */}

      {/* Center: Scroll Down button (Only visible on Earth) */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          opacity: pageIndex === 0 ? 1 : 0,
          pointerEvents: pageIndex === 0 ? 'auto' : 'none',
          transition: 'opacity 0.5s ease-in-out'
        }}
        className="flex flex-col items-center gap-2 pointer-events-auto"
      >
        <button
          id="about-btn"
          onClick={() => setPageIndex(1)}
          title="Scroll down"
          className="flex flex-col items-center gap-2 px-5 py-2 text-xs font-mono tracking-widest text-white/80 hover:text-white transition-all duration-500 cursor-pointer"
        >
          <div className="flex flex-col items-center justify-center animate-[bounce_3s_ease-in-out_infinite]">
            <ChevronsDown size={28} strokeWidth={1.5} />
          </div>
          <span>SCROLL DOWN</span>
        </button>
      </div>

      <div
        style={{ position: 'absolute', bottom: 150, right: 32 }}
        className="flex gap-3 pointer-events-auto items-center"
      >
        {isIndianOceanFocused && (
          <button 
            onClick={() => {
               const store = useDashboardStore.getState();
               store.setShowDebug(!store.showDebug);
            }}
            className="bg-black/40 border border-cyan-500/50 hover:bg-cyan-900/60 text-white/50 hover:text-white px-3 h-10 rounded shadow-[0_0_15px_rgba(6,182,212,0.2)] font-mono text-xs tracking-widest flex items-center gap-2 transition-all"
          >
            <Bug size={14} /> DEBUG
          </button>
        )}
      </div>

    </div>
  );
}
