import { useMemo, useState } from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { DepthMetricChart } from './DepthMetricChart';

const DistTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-cyan-500/40 p-2 rounded  text-xs font-mono">
        <p className="text-white/60 mb-1">{payload[0].payload.rangeLabel}</p>
        <p className="text-cyan-400">Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export function AnalyzePanel() {
  const { surfaceData, selectedVariable, predictionData, metrics } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'GLORYS' | 'ARGO'>('GLORYS');

  // Temperature profile data formatting
  const profileChartData = useMemo(() => {
    if (!predictionData || !predictionData.depths_m || !predictionData.temperature_c) return null;
    return predictionData.depths_m.map((d, i) => ({
      depth_m: d,
      temp: predictionData.temperature_c[i]
    }));
  }, [predictionData]);

  // Format validation data
  const valData = useMemo(() => {
    if (!metrics) return null;
    const source = activeTab === 'GLORYS' ? metrics.glorys : metrics.argo;
    if (!source || !source.depths) return null;
    
    return source.depths.map((d, i) => ({
      depth_m: d,
      rmse: source.rmse_by_depth?.[i] ?? null,
      mae: source.mae_by_depth?.[i] ?? null,
      bias: source.bias_by_depth?.[i] ?? null,
      correlation: source.correlation_by_depth?.[i] ?? null
    }));
  }, [metrics, activeTab]);

  const overall = activeTab === 'GLORYS' ? metrics?.glorys?.overall : metrics?.argo?.overall;

  const { distData, stats } = useMemo(() => {
    let d: any[] = [];
    let s = { min: Infinity as number | typeof Infinity, max: -Infinity as number | typeof Infinity, mean: 0 };
    if (surfaceData) {
      const { values, speed, u, v } = surfaceData;
      let gridData = values;
      if (selectedVariable.includes('current') || selectedVariable.includes('wind')) {
        if (selectedVariable.endsWith('_u')) gridData = u;
        else if (selectedVariable.endsWith('_v')) gridData = v;
        else gridData = speed || values;
      }
      if (gridData) {
        const flatVals: number[] = [];
        for (let i = 0; i < gridData.length; i += 2) {
          for (let j = 0; j < (gridData[i]?.length ?? 0); j += 2) {
            const val = gridData[i][j];
            if (val !== null && val !== undefined && isFinite(val as number)) {
              flatVals.push(val as number);
            }
          }
        }
        if (flatVals.length > 0) {
          let mn = Infinity, mx = -Infinity, sum = 0;
          flatVals.forEach(val => { if (val < mn) mn = val; if (val > mx) mx = val; sum += val; });
          s = { min: mn, max: mx, mean: sum / flatVals.length };
          if (mn !== Infinity && mx !== -Infinity && mx > mn) {
            const step = (mx - mn) / 20 || 1;
            const bins = Array.from({ length: 20 }, (_, i) => ({
              name: (mn + (i + 0.5) * step).toFixed(2),
              rangeLabel: `${(mn + i * step).toFixed(2)} – ${(mn + (i + 1) * step).toFixed(2)}`,
              count: 0
            }));
            flatVals.forEach(val => {
              const idx = Math.min(19, Math.max(0, Math.floor((val - mn) / step)));
              bins[idx].count++;
            });
            d = bins;
          }
        }
      }
    }
    return { distData: d, stats: s };
  }, [surfaceData, selectedVariable]);

  const varLabel = surfaceData
    ? selectedVariable.replace(/_/g, ' ').toUpperCase() + (surfaceData.units ? ` (${surfaceData.units})` : '')
    : 'Variable';

  return (
    <>
      <div className="w-[420px] flex flex-col gap-4 pointer-events-auto z-10 shrink-0 h-full overflow-y-auto hide-scrollbar pr-2 pb-20">
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-1">
            <h3 className="text-white/70 text-[10px] tracking-widest uppercase">OCEAN ANALYSIS</h3>
            <span className="text-[8px] bg-cyan-900/40 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 tracking-widest uppercase">DYNAMIC DATA</span>
          </div>
          
          {/* TEMPERATURE VS DEPTH */}
          <div>
            {!profileChartData ? (
              <div className="h-40 w-full flex items-center justify-center text-white/30 text-[10px] uppercase tracking-widest border border-white/5 bg-white/5 rounded">
                NO RECONSTRUCTION YET
              </div>
            ) : (
              <DepthMetricChart data={profileChartData} title="SUBSURFACE TEMPERATURE PROFILE" dataKey="temp" stroke="#0ea5e9" fill="#0284c7" />
            )}
          </div>

          <div className="h-px bg-white/10 w-full my-1"></div>
          <h3 className="text-white/70 text-[10px] tracking-widest uppercase mt-1">GLOBAL MODEL VALIDATION</h3>

          {/* VALIDATION TABS */}
          <div className="flex w-full bg-black/60 rounded overflow-hidden border border-cyan-500/30">
            <button
              onClick={() => setActiveTab('GLORYS')}
              className={`flex-1 py-2 text-[9px] font-mono tracking-widest uppercase transition-colors ${activeTab === 'GLORYS' ? 'bg-cyan-900/60 backdrop-blur-md text-white font-bold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
            >
              HELD-OUT GLORYS
            </button>
            <button
              onClick={() => setActiveTab('ARGO')}
              className={`flex-1 py-2 text-[9px] font-mono tracking-widest uppercase transition-colors ${activeTab === 'ARGO' ? 'bg-cyan-900/60 backdrop-blur-md text-white font-bold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
            >
              INDEPENDENT ARGO
            </button>
          </div>

          {/* VALIDATION METRICS */}
          {!metrics ? (
            <div className="h-40 w-full flex items-center justify-center text-white/30 text-[10px] uppercase tracking-widest border border-white/5 bg-white/5 rounded">
              LOADING ANALYSIS DATA...
            </div>
          ) : !valData || !overall ? (
            <div className="h-40 w-full flex items-center justify-center text-red-400/80 text-[10px] uppercase tracking-widest border border-red-500/30 bg-red-500/10 rounded">
              VALIDATION DATA ERROR
            </div>
          ) : (
            <>
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  ['RMSE', overall.rmse],
                  ['MAE', overall.mae],
                  ['Bias', overall.bias],
                  ['Corr', overall.correlation]
                ].map(([label, val]) => (
                  <div key={label as string} className="bg-white/5 p-2 rounded border border-white/10 flex flex-col items-center">
                    <span className="text-[8px] text-white/40 mb-1 tracking-widest uppercase">{label as string}</span>
                    <span className={`font-bold ${val !== null && val !== undefined ? 'text-cyan-400 text-xs' : 'text-red-400 text-[8px]'}`}>
                      {val !== null && val !== undefined ? (val as number).toFixed(4) : 'NOT AVAILABLE'}
                    </span>
                  </div>
                ))}
              </div>

              {/* 2x2 CHART GRID */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                <DepthMetricChart data={valData} title="RMSE vs Depth" dataKey="rmse" stroke="#ef4444" fill="#7f1d1d" />
                <DepthMetricChart data={valData} title="MAE vs Depth" dataKey="mae" stroke="#f59e0b" fill="#78350f" />
                <DepthMetricChart data={valData} title="Bias vs Depth" dataKey="bias" stroke="#10b981" fill="#064e3b" />
                <DepthMetricChart data={valData} title="Correlation vs Depth" dataKey="correlation" stroke="#8b5cf6" fill="#4c1d95" />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="w-[420px] flex flex-col gap-4 pointer-events-auto z-10 shrink-0 h-full overflow-y-auto hide-scrollbar pl-2 pb-20">
        {/* DISTRIBUTIONS */}
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white/70 text-[10px] tracking-widest uppercase">SURFACE VARIABLE DISTRIBUTION</h3>
            <span className="text-[8px] bg-cyan-900/40 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/30 tracking-widest uppercase">DYNAMIC DATA</span>
          </div>
          <p className="text-[9px] text-white/50 font-mono mb-4">{varLabel}</p>
          
          {distData.length > 0 ? (
            <div className="h-[200px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fff" strokeOpacity={0.05} vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#fff" 
                    strokeOpacity={0.3} 
                    tick={{ fill: '#fff', opacity: 0.5, fontSize: 8 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="#fff" 
                    strokeOpacity={0.3} 
                    tick={{ fill: '#fff', opacity: 0.5, fontSize: 8 }} 
                  />
                  <RechartsTooltip content={<DistTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center border border-white/5 bg-white/5 backdrop-blur-md rounded text-white/30 uppercase tracking-widest text-[10px] font-mono h-[200px]">
              NO SURFACE DATA
            </div>
          )}

          {distData.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-white/40 font-mono">MIN</span>
                <span className="text-xs text-white font-mono">{stats.min !== Infinity ? stats.min.toFixed(2) : '-'}</span>
              </div>
              <div className="flex flex-col items-center border-x border-white/10">
                <span className="text-[9px] text-white/40 font-mono">MEAN</span>
                <span className="text-xs text-cyan-400 font-mono font-bold">{stats.mean.toFixed(2)}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-white/40 font-mono">MAX</span>
                <span className="text-xs text-white font-mono">{stats.max !== -Infinity ? stats.max.toFixed(2) : '-'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
