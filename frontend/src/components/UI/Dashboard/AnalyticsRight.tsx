import React from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, ReferenceLine
} from 'recharts';
import { api } from '../../../services/api';

const DEPTH_LEVELS = [0, 5, 10, 20, 30, 50, 75, 100, 125, 150, 200, 300, 500, 700, 1000];

const ProfileTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-cyan-500/40 p-2 rounded  text-xs font-mono shadow-lg">
        <p className="text-cyan-400 font-bold">{payload[0].payload.depth} m</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value !== undefined ? Number(p.value).toFixed(2) : 'N/A'} °C
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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

export function AnalyticsRight() {
  const {
    surfaceData,
    selectedDepth,
    setSelectedDepth,
    selectedLocation,
    setSelectedLocation,
    selectedDate,
    setPredictionData,
    setProfileData,
    predictionData,
    setIsLoading,
    setLoadingMessage,
    selectedVariable,
    isLoading,
    loadingMessage,
    predictionError,
    setPredictionError
  } = useDashboardStore();

  const handlePresetLocation = async (lat: number, lon: number) => {
    setSelectedLocation({ latitude: lat, longitude: lon });
    setIsLoading(true);
    setLoadingMessage("RUNNING CNN...");
    try {
      const pred = await api.getPrediction(selectedDate, lat, lon);
      setPredictionData(pred);
      setPredictionError(null);
      setLoadingMessage("LOADING TEMPERATURE PROFILE...");
      const prof = await api.getTemperatureProfile(selectedDate, lat, lon);
      setProfileData(prof);
    } catch (err) {
      console.error(err);
      setPredictionError("PREDICTION ERROR");
    }
    setIsLoading(false);
  };



  const handleReconstruct = async () => {
    if (!selectedLocation) return;
    setIsLoading(true);
    setLoadingMessage("RUNNING CNN...");
    setPredictionData(null);
    setProfileData(null);
    try {
      const pred = await api.getPrediction(
        selectedDate, selectedLocation.latitude, selectedLocation.longitude
      );
      setPredictionData(pred);
      setPredictionError(null);
      setLoadingMessage("LOADING TEMPERATURE PROFILE...");
      const prof = await api.getTemperatureProfile(
        selectedDate, selectedLocation.latitude, selectedLocation.longitude
      );
      setProfileData(prof);
    } catch (err) {
      console.error(err);
      setPredictionError("PREDICTION ERROR");
    }
    setIsLoading(false);
  };

  // ── Surface Distribution ─────────────────────────────────────────────────
  const { distData, stats } = React.useMemo(() => {
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
    
  // ── Temperature Profile Chart Data ───────────────────────────────────────
  const profileChartData = DEPTH_LEVELS.map(depth => {
    const dataPoint: any = { depth: String(depth) };
    if (predictionData?.temperature_profile) {
      const val = predictionData.temperature_profile[`T_${depth}`];
      if (val !== undefined && val !== null) {
        dataPoint.OceanEmbed = Number(val);
      }
    }
    return dataPoint;
  });



  const selectedDepthIndex = DEPTH_LEVELS.indexOf(selectedDepth);

  let buttonStateText = "READY\nSelect location and reconstruct";
  if (isLoading && loadingMessage.includes("CNN")) {
    buttonStateText = "RUNNING CNN\nLoading...";
  } else if (predictionError) {
    buttonStateText = "PREDICTION FAILED\nTry again";
  } else if (predictionData) {
    buttonStateText = "RECONSTRUCTION COMPLETE\nClick to run again";
  } else if (!selectedLocation) {
    buttonStateText = "WAITING\nSelect location on globe";
  }

  return (
    <>
      {/* MODEL & DATA */}
      <div className=" bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm mt-4 pointer-events-auto flex flex-col gap-2 w-full">
        <h3 className="text-white/70 text-[10px] tracking-widest uppercase mb-1">MODEL & DATA</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[9px] font-mono">
          {[
            ['REGION', 'North Indian Ocean'],
            ['GRID', '0.25°'],
            ['RESOLUTION', 'Daily'],
            ['FRAMEWORK', 'PyTorch'],
            ['SURFACE INPUTS', '7'],
            ['DEPTH LEVELS', '15'],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <span className="text-white/40 uppercase">{k}</span>
              <span className="text-white">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* PRESET LOCATIONS */}
      <div className=" bg-black/40 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl shadow-sm flex flex-col gap-2 pointer-events-auto w-full mt-2">
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
              onClick={() => handlePresetLocation(lat as number, lon as number)}
              className="bg-white/5 backdrop-blur-md hover:bg-cyan-900/40 border border-white/5 hover:border-cyan-500/50 p-2 rounded text-left transition-colors flex flex-col"
            >
              <span className="text-white font-bold">{name as string}</span>
              <span className="text-white/40 text-[8px]">{coords as string}</span>
            </button>
          ))}
        </div>
      </div>

      {/* DEPTH SLIDER */}
      <div className=" bg-black/40 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl shadow-sm flex flex-col gap-2 mt-2 pointer-events-auto w-full">
        <div className="flex justify-between items-end">
          <h3 className="text-white/70 text-[10px] tracking-widest uppercase">DEPTH (m)</h3>
          <span className="text-white font-mono text-sm font-bold">{selectedDepth} m</span>
        </div>
        <div className="px-2 pb-1 pt-2">
          <input
            type="range"
            min="0"
            max={DEPTH_LEVELS.length - 1}
            value={selectedDepthIndex >= 0 ? selectedDepthIndex : 0}
            onChange={(e) => setSelectedDepth(DEPTH_LEVELS[parseInt(e.target.value)])}
            className="w-full accent-cyan-400 cursor-pointer"
            style={{ height: '4px' }}
          />
          <div className="flex justify-between text-[8px] text-white/40 font-mono mt-2 px-1">
            <span>0m</span>
            <span>1000m</span>
          </div>
        </div>
      </div>

      {/* RECONSTRUCT BUTTON */}
      <button
        onClick={handleReconstruct}
        disabled={!selectedLocation || isLoading}
        className={`w-full backdrop-blur-md border border-cyan-500/50 p-3 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] mt-2 font-mono tracking-widest text-xs pointer-events-auto transition-all duration-300 flex flex-col items-center justify-center gap-1
          ${(!selectedLocation || isLoading)
            ? 'bg-black/40 text-white/40 border-white/10'
            : predictionError
              ? 'bg-red-950/60 text-red-400 hover:bg-red-900/80'
              : predictionData
                ? 'bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/60'
                : 'bg-cyan-950/60 text-white hover:bg-cyan-900/80'}`}
      >
        <span className="font-bold">{buttonStateText.split('\n')[0]}</span>
        <span className="text-[9px] opacity-70">{buttonStateText.split('\n')[1]}</span>
      </button>

      {/* ═══════════════════════════════════════════════════════════
          SUBSURFACE TEMPERATURE PROFILE
          Key fix: give the chart wrapper an explicit pixel height,
          NOT height="100%". ResponsiveContainer needs a measured parent.
      ═══════════════════════════════════════════════════════════ */}
      <div className=" bg-black/40 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl shadow-sm pointer-events-auto w-full mt-2">
        <h3 className="text-white/70 text-[10px] tracking-widest uppercase flex justify-between mb-3">
          <span>SUBSURFACE TEMPERATURE PROFILE</span>
          <span className="text-white/40">T(°C) vs Depth(m)</span>
        </h3>

        {!predictionData ? (
          <div
            className="flex items-center justify-center border border-white/5 bg-white/5 backdrop-blur-md rounded text-white/30 uppercase tracking-widest text-center text-[10px] font-mono px-4"
            style={{ height: 280 }}
          >
            SELECT LOCATION →<br />RECONSTRUCT OCEAN
          </div>
        ) : (
          <>
            {/* Legend */}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-0.5 bg-cyan-400 rounded" />
              <span className="text-[9px] font-mono text-cyan-400/80">OceanEmbed Prediction</span>
              {selectedDepth > 0 && (
                <>
                  <div className="w-4 h-px border-t border-dashed border-cyan-500/60 ml-2" />
                  <span className="text-[9px] font-mono text-cyan-500/60">{selectedDepth}m selected</span>
                </>
              )}
            </div>
            {/* FIXED: explicit pixel height on the wrapper, not height="100%" */}
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  layout="vertical"
                  data={profileChartData}
                  margin={{ top: 10, right: 24, bottom: 10, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    type="number"
                    stroke="rgba(255,255,255,0.25)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9, fontFamily: 'monospace' }}
                    domain={['dataMin - 1', 'dataMax + 1']}
                    orientation="top"
                    label={{ value: 'Temperature (°C)', position: 'insideTopRight', offset: -4, fill: 'rgba(255,255,255,0.3)', fontSize: 8 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="depth"
                    reversed={true}
                    stroke="rgba(255,255,255,0.25)"
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 9, fontFamily: 'monospace' }}
                    width={36}
                  />
                  <Tooltip content={<ProfileTooltip />} />
                  {/* Selected depth reference line */}
                  <ReferenceLine
                    y={String(selectedDepth)}
                    stroke="#06b6d4"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    strokeOpacity={0.7}
                  />
                  <Line
                    type="monotone"
                    dataKey="OceanEmbed"
                    name="OceanEmbed"
                    stroke="#22d3ee"
                    strokeWidth={2}
                    dot={(props: any) => {
                      const isSelected = props.payload.depth === String(selectedDepth);
                      return (
                        <circle
                          key={props.key}
                          cx={props.cx}
                          cy={props.cy}
                          r={isSelected ? 6 : 3}
                          fill={isSelected ? '#22d3ee' : '#0c4a6e'}
                          stroke="#22d3ee"
                          strokeWidth={isSelected ? 2 : 1}
                        />
                      );
                    }}
                    activeDot={{ r: 6, fill: '#22d3ee', stroke: '#fff', strokeWidth: 1 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SURFACE VARIABLE DISTRIBUTION
      ═══════════════════════════════════════════════════════════ */}
      <div className=" bg-black/40 backdrop-blur-md border border-cyan-500/30 p-3 rounded-xl shadow-sm pointer-events-auto w-full mt-2">
        <h3 className="text-white/70 text-[10px] tracking-widest uppercase mb-2">SURFACE VARIABLE DISTRIBUTION</h3>

        {/* Stats row */}
        <div className="flex justify-between items-center bg-black/40 rounded px-2 py-1.5 border border-white/5 text-[9px] font-mono mb-2">
          <div className="flex gap-1"><span className="text-white/40">MIN</span><span className="text-cyan-400">{(stats.min as number) !== Infinity ? (stats.min as number).toFixed(2) : '--'}</span></div>
          <div className="flex gap-1"><span className="text-white/40">MEAN</span><span className="text-cyan-400">{(stats.min as number) !== Infinity ? (stats.mean).toFixed(2) : '--'}</span></div>
          <div className="flex gap-1"><span className="text-white/40">MAX</span><span className="text-cyan-400">{(stats.max as number) !== -Infinity ? (stats.max as number).toFixed(2) : '--'}</span></div>
          {surfaceData?.units && <div className="text-white/30">{surfaceData.units}</div>}
        </div>

        {distData.length > 0 ? (
          <div style={{ width: '100%', height: 130 }}>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={distData} margin={{ top: 4, right: 8, bottom: 18, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.2)"
                  tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 7, fontFamily: 'monospace' }}
                  label={{ value: varLabel, position: 'insideBottom', offset: -6, fill: 'rgba(255,255,255,0.3)', fontSize: 8 }}
                />
                <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 7 }} width={22} />
                <Tooltip content={<DistTooltip />} cursor={{ fill: 'rgba(255,255,255,0.08)' }} />
                <Bar isAnimationActive={false} dataKey="count" fill="#06b6d4" radius={[2, 2, 0, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div
            className="flex items-center justify-center border border-white/5 bg-white/5 backdrop-blur-md rounded text-white/30 uppercase tracking-widest text-[10px] font-mono"
            style={{ height: 100 }}
          >
            NO SURFACE DATA
          </div>
        )}
      </div>
    </>
  );
}
