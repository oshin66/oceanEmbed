import { useState } from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { VariableSwitcher } from './VariableSwitcher';
import { KPICards } from './KPICards';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AnalyticsLeft() {
  const { metrics, argoValidation } = useDashboardStore();
  const [activeTab, setActiveTab] = useState<'GLORYS' | 'ARGO'>('GLORYS');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/80 border border-cyan-500/30 p-2 rounded  text-xs font-mono">
          <p className="text-white mb-1">Depth: {label}m</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color }}>{p.name}: {p.value !== undefined ? p.value.toFixed(3) : 'N/A'}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <VariableSwitcher />
      <KPICards />
      
      {/* ANALYSIS PANEL */}
      <div className=" bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm mt-4 pointer-events-auto flex flex-col gap-2 w-full">
        <h3 className="text-white/70 text-[10px] tracking-widest uppercase mb-2">ANALYSIS</h3>
        
        {/* TABS */}
        <div className="flex w-full mb-2 bg-black/60 rounded overflow-hidden border border-cyan-500/30">
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

        {activeTab === 'GLORYS' && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="bg-white/5 rounded p-2 flex flex-col items-center border border-white/5">
                <span className="text-white/40">RMSE</span>
                <span className="text-white">{metrics?.GLORYS_test?.RMSE_C?.toFixed(4) || '---'} °C</span>
              </div>
              <div className="bg-white/5 rounded p-2 flex flex-col items-center border border-white/5">
                <span className="text-white/40">MAE</span>
                <span className="text-white">{metrics?.GLORYS_test?.MAE_C?.toFixed(4) || '---'} °C</span>
              </div>
            </div>
            {/* API does not expose depth-wise metrics for GLORYS yet */}
          </div>
        )}

        {activeTab === 'ARGO' && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono mb-2">
              <div className="bg-white/5 rounded p-2 flex flex-col items-center border border-white/5">
                <span className="text-white/40">RMSE</span>
                <span className="text-white">{metrics?.ARGO_validation?.RMSE_C?.toFixed(4) || '---'} °C</span>
              </div>
              <div className="bg-white/5 rounded p-2 flex flex-col items-center border border-white/5">
                <span className="text-white/40">MAE</span>
                <span className="text-white">{metrics?.ARGO_validation?.MAE_C?.toFixed(4) || '---'} °C</span>
              </div>
            </div>

            {argoValidation && argoValidation.length > 0 ? (
              <>
                <div className="h-40 w-full mt-2 relative">
                  <h4 className="text-white/40 text-[9px] tracking-widest uppercase mb-2 text-center">DEPTH-WISE ERROR (RMSE & MAE)</h4>
                  <div className="absolute -left-3 top-1/2 -rotate-90 transform -translate-y-1/2 text-[8px] text-white/30 uppercase tracking-widest z-10">Error (°C)</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={argoValidation} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="depth_m" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 9}} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 9}} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line isAnimationActive={false} type="monotone" name="RMSE" dataKey="RMSE_C" stroke="#ef4444" strokeWidth={2} dot={{r: 2, fill: '#7f1d1d'}} />
                      <Line isAnimationActive={false} type="monotone" name="MAE" dataKey="MAE_C" stroke="#f59e0b" strokeWidth={2} dot={{r: 2, fill: '#78350f'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-40 w-full mt-2 relative">
                  <h4 className="text-white/40 text-[9px] tracking-widest uppercase mb-2 text-center">DEPTH-WISE BIAS</h4>
                  <div className="absolute -left-3 top-1/2 -rotate-90 transform -translate-y-1/2 text-[8px] text-white/30 uppercase tracking-widest z-10">Bias (°C)</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={argoValidation} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="depth_m" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 9}} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 9}} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line isAnimationActive={false} type="monotone" name="Bias" dataKey="Bias_C" stroke="#10b981" strokeWidth={2} dot={{r: 2, fill: '#064e3b'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-40 w-full mt-2 relative">
                  <h4 className="text-white/40 text-[9px] tracking-widest uppercase mb-2 text-center">DEPTH-WISE CORRELATION</h4>
                  <div className="absolute -left-3 top-1/2 -rotate-90 transform -translate-y-1/2 text-[8px] text-white/30 uppercase tracking-widest z-10">Correlation</div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={argoValidation} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="depth_m" stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 9}} />
                      <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 9}} domain={[0, 1]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line isAnimationActive={false} type="monotone" name="Correlation" dataKey="Correlation" stroke="#8b5cf6" strokeWidth={2} dot={{r: 2, fill: '#4c1d95'}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="h-32 w-full flex items-center justify-center text-white/30 text-[10px] uppercase tracking-widest border border-white/5 bg-white/5 rounded mt-2">
                VALIDATION DATA UNAVAILABLE
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

