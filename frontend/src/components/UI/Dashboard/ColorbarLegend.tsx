import { useMemo } from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';

export function ColorbarLegend() {
  const { surfaceData, selectedVariable } = useDashboardStore();

  const { minVal, maxVal, gradient } = useMemo(() => {
    if (!surfaceData) return { minVal: 0, maxVal: 0, gradient: '' };

    const { values, speed, u, v } = surfaceData;
    const isVector = selectedVariable.includes('current') || selectedVariable.includes('wind');
    
    let gridData = values;
    if (isVector) {
      if (selectedVariable.endsWith('_u')) gridData = u;
      else if (selectedVariable.endsWith('_v')) gridData = v;
      else gridData = speed || values;
    }

    if (!gridData) return { minVal: 0, maxVal: 0, gradient: '' };

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < gridData.length; i++) {
      for (let j = 0; j < gridData[i].length; j++) {
        const val = gridData[i][j];
        if (val !== null) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
    }

    if (min === Infinity) return { minVal: 0, maxVal: 0, gradient: '' };

    if (selectedVariable === 'sla') {
      const absMax = Math.max(Math.abs(min), Math.abs(max));
      min = -absMax;
      max = absMax;
    }

    // Generate gradient string
    let grad = '';
    if (selectedVariable === 'sst') {
      grad = 'linear-gradient(to right, hsl(216, 100%, 50%), hsl(60, 100%, 50%), hsl(0, 100%, 50%))';
    } else if (selectedVariable === 'sss') {
      grad = 'linear-gradient(to right, hsl(108, 100%, 60%), hsl(162, 100%, 60%), hsl(216, 100%, 60%))';
    } else if (selectedVariable === 'sla') {
      grad = 'linear-gradient(to right, hsl(216, 100%, 20%), hsl(216, 100%, 80%), hsl(0, 100%, 80%), hsl(0, 100%, 20%))';
    } else {
      grad = 'linear-gradient(to right, hsl(180, 0%, 60%), hsl(180, 100%, 60%))';
    }

    return { minVal: min, maxVal: max, gradient: grad };
  }, [surfaceData, selectedVariable]);

  if (!surfaceData || selectedVariable === 'reconstructed_temp') return null;

  return (
    <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm w-64 pointer-events-auto">
      <div className="text-[10px] text-white uppercase tracking-widest mb-2 font-mono flex justify-between">
        <span>{selectedVariable.replace('_', ' ')}</span>
        <span>{surfaceData.units}</span>
      </div>
      <div className="h-2 w-full rounded-full" style={{ background: gradient }}></div>
      <div className="flex justify-between text-[9px] text-white/70 font-mono mt-1">
        <span>{minVal.toFixed(2)}</span>
        {selectedVariable === 'sla' && <span>0.00</span>}
        <span>{maxVal.toFixed(2)}</span>
      </div>
    </div>
  );
}
