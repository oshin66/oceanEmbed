import { VariableSwitcher } from './VariableSwitcher';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { OceanStatePanel } from './OceanStatePanel';

export function ExplorePanel() {
  const { 
    selectedLocation, 
    setDashboardMode,
    isLoading,
    setSelectedLocation,
  } = useDashboardStore();

  const handlePresetLocation = (lat: number, lon: number, name: string) => {
    setSelectedLocation({ latitude: lat, longitude: lon, regionName: name });
  };

  return (
    <>
      <div className="w-[320px] flex flex-col gap-4 pointer-events-auto z-10 shrink-0 h-full overflow-y-auto hide-scrollbar pr-2 pb-20">
        {/* PRESET LOCATIONS */}
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm flex flex-col gap-2">
          <h3 className="text-white/70 text-[10px] tracking-widest uppercase">OBSERVATION REGIONS</h3>
          <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
            {[
              ['Arabian Sea', 16.5, 65.0, '16.5°N, 65.0°E'],
              ['Bay of Bengal', 14.0, 89.0, '14.0°N, 89.0°E'],
              ['Lakshadweep', 10.5, 72.5, '10.5°N, 72.5°E'],
              ['Andaman', 11.5, 92.5, '11.5°N, 92.5°E'],
            ].map(([name, lat, lon, coords]) => (
              <button
                key={name as string}
                onClick={() => handlePresetLocation(lat as number, lon as number, name as string)}
                className={`p-2 rounded text-left transition-colors flex flex-col border ${selectedLocation?.regionName === name ? 'bg-cyan-900/60 border-cyan-400' : 'bg-white/5 border-white/5 hover:bg-cyan-900/40 hover:border-cyan-500/50'}`}
              >
                <span className="text-white font-bold text-[11px]">{name as string}</span>
                <span className="text-white/40 text-[8px]">{coords as string}</span>
              </button>
            ))}
          </div>
        </div>

        <VariableSwitcher />
      </div>

      <div className="w-[320px] flex flex-col gap-4 pointer-events-auto z-10 shrink-0 h-full overflow-y-auto hide-scrollbar pl-2 pb-20">
        <OceanStatePanel />

        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm">
          <button
            onClick={() => setDashboardMode('RECONSTRUCT')}
            disabled={!selectedLocation || isLoading}
            className={`w-full backdrop-blur-md border border-cyan-500/50 p-3 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-2 font-mono tracking-widest text-xs transition-all duration-300 flex flex-col items-center justify-center gap-1
              ${(!selectedLocation || isLoading)
                ? 'bg-black/40 text-white/40 border-white/10 cursor-not-allowed'
                : 'bg-cyan-950/60 text-white hover:bg-cyan-900/80'}`}
          >
            <span className="font-bold">RECONSTRUCT OCEAN</span>
            <span className="text-[9px] opacity-70">Predict Subsurface Temperature</span>
          </button>
        </div>


      </div>
    </>
  );
}
