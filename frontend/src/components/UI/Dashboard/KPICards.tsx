import { useDashboardStore } from '../../../store/useDashboardStore';

export function KPICards() {
  const { selectedDate, selectedLocation, selectedDepth, predictionData, surfaceData, selectedVariable } = useDashboardStore();
  
  let activeValue = '---';
  let activeUnits = '';
  
  if (selectedLocation && surfaceData) {
    const { latitude, longitude, values, speed, u, v } = surfaceData;
    
    let closestI = 0; let minLatDist = Infinity;
    for (let i = 0; i < latitude.length; i++) {
      const dist = Math.abs(latitude[i] - selectedLocation.latitude);
      if (dist < minLatDist) { minLatDist = dist; closestI = i; }
    }
    let closestJ = 0; let minLonDist = Infinity;
    for (let j = 0; j < longitude.length; j++) {
      const dist = Math.abs(longitude[j] - selectedLocation.longitude);
      if (dist < minLonDist) { minLonDist = dist; closestJ = j; }
    }
    
    let gridData = values;
    if (selectedVariable.includes('current') || selectedVariable.includes('wind')) {
      if (selectedVariable.endsWith('_u')) gridData = u;
      else if (selectedVariable.endsWith('_v')) gridData = v;
      else gridData = speed || values;
    }

    if (gridData && gridData[closestI] && gridData[closestI][closestJ] !== null) {
      activeValue = Number(gridData[closestI][closestJ]).toFixed(2);
      activeUnits = surfaceData.units || '';
    }
  }
  
  let predictedTemp = '---';
  if (predictionData && predictionData.temperature_profile) {
    const t = predictionData.temperature_profile[`T_${selectedDepth}`];
    if (t !== undefined) predictedTemp = t.toFixed(2);
  }

  const varNameDisplay = selectedVariable.replace('_', ' ').toUpperCase();

  return (
    <div className=" bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm mt-4 pointer-events-auto flex flex-col gap-3 w-full">
      <h3 className="text-white/70 text-[10px] tracking-widest uppercase mb-1">OCEAN STATE PANEL</h3>
      
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[10px] text-white/50 tracking-widest uppercase">DATE</span>
        <span className="text-white font-mono text-xs">{selectedDate}</span>
      </div>
      
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[10px] text-white/50 tracking-widest uppercase">POSITION</span>
        <span className="text-white font-mono text-xs">
          {selectedLocation ? `${Math.abs(selectedLocation.latitude).toFixed(2)}°${selectedLocation.latitude >= 0 ? 'N' : 'S'} ${Math.abs(selectedLocation.longitude).toFixed(2)}°${selectedLocation.longitude >= 0 ? 'E' : 'W'}` : '---'}
        </span>
      </div>

      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[10px] text-white/50 tracking-widest uppercase">SURFACE VARIABLE</span>
        <span className="text-white font-mono text-xs">{varNameDisplay}</span>
      </div>

      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[10px] text-white/50 tracking-widest uppercase">{varNameDisplay}</span>
        <span className="text-white font-mono text-xs">{activeValue} {activeUnits}</span>
      </div>
      
      <div className="flex justify-between items-center border-b border-white/5 pb-2">
        <span className="text-[10px] text-white/50 tracking-widest uppercase">DEPTH</span>
        <span className="text-white font-mono text-xs">{selectedDepth} m</span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-[10px] text-white/50 tracking-widest uppercase">RECONSTRUCTED TEMP</span>
        <span className="text-white font-mono text-xs">{predictedTemp !== '---' ? `${predictedTemp} °C` : '---'}</span>
      </div>
    </div>
  );
}
