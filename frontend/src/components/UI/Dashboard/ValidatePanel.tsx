import { useState, useMemo } from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { DepthMetricChart } from './DepthMetricChart';

export function ValidatePanel() {
  const { metrics } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'GLORYS' | 'ARGO'>('GLORYS');

  const valData = useMemo(() => {
    if (!metrics) return null;
    const source = activeTab === 'GLORYS' ? metrics.glorys : metrics.argo;
    if (!source || !source.depths) return null;
    if (source.depths.length !== 15) return null;

    return source.depths.map((d, i) => ({
      depth_m: d,
      rmse: source.rmse_by_depth?.[i] ?? null,
      mae: source.mae_by_depth?.[i] ?? null,
      bias: source.bias_by_depth?.[i] ?? null,
      correlation: source.correlation_by_depth?.[i] ?? null
    }));
  }, [metrics, activeTab]);

  const overall = activeTab === 'GLORYS' ? metrics?.glorys?.overall : metrics?.argo?.overall;

  return (
    <>
      <div className="w-[340px] flex flex-col gap-4 pointer-events-auto z-10 shrink-0 h-full overflow-y-auto hide-scrollbar pr-2 pb-20">
        {/* MODEL METADATA */}
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm flex flex-col gap-2 w-full">
          <h3 className="text-white/70 text-[10px] tracking-widest uppercase mb-1">MODEL METADATA</h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[9px] font-mono mt-2">
            {[
              ['MODEL', 'OceanEmbed CNN'],
              ['INPUTS', '7 surface variables'],
              ['OUTPUT', '15 depth levels'],
              ['REGION', 'North Indian Ocean'],
              ['GRID', '0.25°'],
              ['TEMPORAL', 'Daily'],
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <span className="text-white/40 uppercase tracking-widest mb-1">{k}</span>
                <span className="text-cyan-400 font-bold">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[540px] flex flex-col gap-4 pointer-events-auto z-10 shrink-0 h-full overflow-y-auto hide-scrollbar pl-2 pb-20">
        {/* ANALYSIS PANEL */}
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm pointer-events-auto flex flex-col gap-2 w-full">
          <h3 className="text-white/70 text-[10px] tracking-widest uppercase mb-2">GLOBAL MODEL VALIDATION</h3>
          
          {/* TABS */}
          <div className="flex w-full mb-2 bg-black/60 rounded overflow-hidden border border-cyan-500/30">
            <button
              onClick={() => setActiveTab('GLORYS')}
              className={`flex-1 py-2 text-[9px] font-mono tracking-widest uppercase transition-colors ${activeTab === 'GLORYS' ? 'bg-cyan-900/60 backdrop-blur-md text-white font-bold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
            >
              HELD-OUT GLORYS TEST
            </button>
            <button
              onClick={() => setActiveTab('ARGO')}
              className={`flex-1 py-2 text-[9px] font-mono tracking-widest uppercase transition-colors ${activeTab === 'ARGO' ? 'bg-cyan-900/60 backdrop-blur-md text-white font-bold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
            >
              INDEPENDENT ARGO VALIDATION
            </button>
          </div>

          <div className="mt-2">
            <div className="text-white/70 text-[10px] font-mono leading-relaxed mb-4">
              {activeTab === 'GLORYS' ? (
                <>
                  <p><strong>Dataset:</strong> Copernicus Global Ocean Physics Reanalysis (GLORYS12V1)</p>
                  <p><strong>Test Period:</strong> 2026</p>
                  <p><strong>Resolution:</strong> 1/12° (~8km)</p>
                </>
              ) : (
                <>
                  <p><strong>Dataset:</strong> Independent ARGO Floats</p>
                  <p><strong>Total Profiles:</strong> 4,528</p>
                </>
              )}
              
              <div className="grid grid-cols-4 gap-2 mt-4 mb-2">
                {[
                  ['RMSE', overall?.rmse],
                  ['MAE', overall?.mae],
                  ['Bias', overall?.bias],
                  ['Corr', overall?.correlation]
                ].map(([label, val]) => (
                  <div key={label as string} className="bg-white/5 p-2 rounded border border-white/10 flex flex-col items-center">
                    <span className="text-[8px] text-white/40 mb-1 tracking-widest uppercase">{label as string}</span>
                    <span className={`font-bold ${val !== null && val !== undefined ? 'text-cyan-400 text-xs' : 'text-red-400 text-[8px]'}`}>
                      {val !== null && val !== undefined ? (val as number).toFixed(4) + (label === 'Corr' ? '' : ' °C') : 'NOT AVAILABLE'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {valData ? (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <DepthMetricChart data={valData} title="RMSE vs Depth" dataKey="rmse" stroke="#ef4444" fill="#7f1d1d" />
                <DepthMetricChart data={valData} title="MAE vs Depth" dataKey="mae" stroke="#f59e0b" fill="#78350f" />
                <DepthMetricChart data={valData} title="Bias vs Depth" dataKey="bias" stroke="#10b981" fill="#064e3b" />
                <DepthMetricChart data={valData} title="Correlation vs Depth" dataKey="correlation" stroke="#8b5cf6" fill="#4c1d95" />
              </div>
            ) : (
              <div className="h-32 w-full flex items-center justify-center text-white/30 text-[10px] uppercase tracking-widest border border-white/5 bg-white/5 rounded mt-2">
                VALIDATION DATA UNAVAILABLE
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
