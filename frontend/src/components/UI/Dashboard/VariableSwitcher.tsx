import { useDashboardStore } from '../../../store/useDashboardStore';
import type { OceanVariable } from '../../../store/useDashboardStore';

const VARIABLES: { id: OceanVariable; label: string; unit: string }[] = [
  { id: 'sst', label: 'SST — Sea Surface Temperature', unit: '°C' },
  { id: 'sss', label: 'SSS — Sea Surface Salinity', unit: 'PSU' },
  { id: 'sla', label: 'SLA — Sea Level Anomaly', unit: 'm' },
  { id: 'current_u', label: 'Current U — Zonal Current', unit: 'm/s' },
  { id: 'current_v', label: 'Current V — Meridional Current', unit: 'm/s' },
  { id: 'wind_u', label: 'Wind U — Zonal Wind', unit: 'm/s' },
  { id: 'wind_v', label: 'Wind V — Meridional Wind', unit: 'm/s' },
  { id: 'reconstructed_temp', label: 'Temperature — Reconstructed Subsurface', unit: '°C' }
];

export function VariableSwitcher() {
  const { selectedVariable, setSelectedVariable } = useDashboardStore();

  return (
    <div className=" bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm flex flex-col gap-2 mt-4 pointer-events-auto">
      <h3 className="text-white/70 text-xs tracking-widest uppercase mb-1">Variable Select</h3>
      <div className="flex flex-col gap-2">
        {VARIABLES.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVariable(v.id)}
            className={`text-left px-3 py-2 text-[10px] font-mono tracking-wider transition-all duration-300 border-l-2 ${
              selectedVariable === v.id
                ? 'border-cyan-400 bg-cyan-900/40 backdrop-blur-md text-white shadow-[inset_4px_0_10px_rgba(6,182,212,0.2)]'
                : 'border-transparent text-white/50 hover:text-white hover:bg-white/5 hover:border-white/20'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
