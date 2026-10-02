import { useMemo } from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';

export function OceanStatePanel() {
  const { 
    selectedLocation, 
    selectedDate, 
    selectedVariable, 
    surfaceData,
    selectedDepth,
    predictionData
  } = useDashboardStore();
  let regionText = "GLOBAL";
  let latText = "-";
  let lonText = "-";

  if (selectedLocation) {
    latText = `${selectedLocation.latitude.toFixed(2)}°`;
    lonText = `${selectedLocation.longitude.toFixed(2)}°`;
    if (selectedLocation.regionName) {
      regionText = selectedLocation.regionName.toUpperCase();
    }
  }

  const varLabel = surfaceData
    ? selectedVariable.replace(/_/g, ' ').toUpperCase()
    : 'VARIABLE';

  // Find surface value
  const surfaceValue = useMemo(() => {
    if (!surfaceData || !selectedLocation) return null;
    let gridData = surfaceData.values;
    if (selectedVariable.includes('current') || selectedVariable.includes('wind')) {
      if (selectedVariable.endsWith('_u')) gridData = surfaceData.u;
      else if (selectedVariable.endsWith('_v')) gridData = surfaceData.v;
      else gridData = surfaceData.speed || surfaceData.values;
    }
    if (!gridData || gridData.length === 0) return null;
    
    let minLatIdx = 0, minLatDist = Infinity;
    surfaceData.latitude.forEach((l, i) => { const d = Math.abs(l - selectedLocation.latitude); if (d < minLatDist) { minLatDist = d; minLatIdx = i; } });
    let minLonIdx = 0, minLonDist = Infinity;
    surfaceData.longitude.forEach((l, i) => { const d = Math.abs(l - selectedLocation.longitude); if (d < minLonDist) { minLonDist = d; minLonIdx = i; } });

    const val = gridData[minLatIdx]?.[minLonIdx];
    return val !== null && val !== undefined ? val : null;
  }, [surfaceData, selectedLocation, selectedVariable]);

  // Find reconstructed temperature for the selected depth
  const reconstructedTemp = useMemo(() => {
    if (!predictionData || !predictionData.temperature_profile) return null;
    return predictionData.temperature_profile[`T_${selectedDepth}`];
  }, [predictionData, selectedDepth]);

  return (
    <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white/70 text-[10px] tracking-widest uppercase">OCEAN STATE</h3>
        <span className="text-[8px] bg-cyan-900/40 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 tracking-widest uppercase">DYNAMIC DATA</span>
      </div>
      
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-white/40 text-[9px] font-mono tracking-widest">DATE</span>
          <span className="text-white font-mono text-xs">{selectedDate}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/40 text-[9px] font-mono tracking-widest">REGION</span>
          <span className="text-white font-mono text-xs">{regionText}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/40 text-[9px] font-mono tracking-widest">LATITUDE</span>
          <span className="text-white font-mono text-xs">{latText}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/40 text-[9px] font-mono tracking-widest">LONGITUDE</span>
          <span className="text-white font-mono text-xs">{lonText}</span>
        </div>
      </div>

      <div className="h-px bg-white/10 w-full my-3"></div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-white/40 text-[9px] font-mono tracking-widest">ACTIVE VARIABLE</span>
          <span className="text-white font-mono text-xs">{varLabel}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/40 text-[9px] font-mono tracking-widest">VALUE</span>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold font-mono text-sm">
              {surfaceValue !== null ? surfaceValue.toFixed(3) : '-'} {surfaceData?.units || ''}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-white/10 w-full my-3"></div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-white/40 text-[9px] font-mono tracking-widest">DEPTH</span>
          <span className="text-white font-mono text-xs">{selectedDepth} m</span>
        </div>
        <div className="flex justify-between items-center bg-cyan-900/30 p-2 rounded border border-cyan-500/20">
          <span className="text-cyan-400/70 text-[9px] font-mono tracking-widest">RECONSTRUCTED TEMP</span>
          <span className="text-cyan-400 font-bold font-mono text-sm">
            {reconstructedTemp !== null && reconstructedTemp !== undefined ? Number(reconstructedTemp).toFixed(3) : '-'} {reconstructedTemp !== null ? '°C' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
