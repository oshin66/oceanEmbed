import { useEffect } from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../../services/api';
import { OceanStatePanel } from './OceanStatePanel';

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

export function ReconstructPanel() {
  const {
    selectedDepth,
    setSelectedDepth,
    selectedLocation,
    selectedDate,
    setPredictionData,
    setProfileData,
    predictionData,
    predictionError,
    setPredictionError,
    setIsLoading,
    setLoadingMessage
  } = useDashboardStore();

  useEffect(() => {
    async function reconstruct() {
      if (!selectedLocation) return;
      setIsLoading(true);
      setLoadingMessage("RUNNING CNN...");
      setPredictionData(null);
      setProfileData(null);
      try {
        const pred = await api.getPrediction(selectedDate, selectedLocation.latitude, selectedLocation.longitude);
        setPredictionData(pred);
        setPredictionError(null);
        setLoadingMessage("LOADING TEMPERATURE PROFILE...");
        const prof = await api.getTemperatureProfile(selectedDate, selectedLocation.latitude, selectedLocation.longitude);
        setProfileData(prof);
      } catch (err) {
        console.error(err);
        setPredictionError("PREDICTION ERROR");
        setIsLoading(false);
        return;
      }
      
      setLoadingMessage("RECONSTRUCTION COMPLETE");
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
    
    // Only run if we don't have prediction data for this location/date
    if (!predictionData || predictionData.date !== selectedDate || 
        predictionData.requested_location.latitude !== selectedLocation?.latitude ||
        predictionData.requested_location.longitude !== selectedLocation?.longitude) {
      reconstruct();
    }
  }, [selectedLocation, selectedDate]);

  // Load 2D map if depth > 0
  useEffect(() => {
    async function loadMap() {
      if (selectedDepth === 0) {
        return;
      }
      setIsLoading(true);
      setLoadingMessage(`LOADING ${selectedDepth}M MAP...`);
      try {
        const res = await fetch(`http://127.0.0.1:8000/reconstruction-map?date=${selectedDate}&depth=${selectedDepth}`);
        if (res.ok) {
          const data = await res.json();
          // Dispatch event to update earth visualization
          window.dispatchEvent(new CustomEvent('update-reconstruction-map', { detail: data }));
        }
      } catch (err) {
        console.error(err);
      }
      setIsLoading(false);
    }
    loadMap();
    
    return () => {
      // Clear map when unmounting
      window.dispatchEvent(new CustomEvent('update-reconstruction-map', { detail: null }));
    }
  }, [selectedDepth, selectedDate]);

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

  return (
    <>
      <div className="w-[340px] flex flex-col gap-4 pointer-events-auto z-10 shrink-0 h-full overflow-y-auto hide-scrollbar pr-2 pb-20">
        <OceanStatePanel />

        {/* DEPTH SLIDER */}
        <div className=" bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm flex flex-col gap-4 w-full">
          <div className="flex justify-between items-end">
            <h3 className="text-white/70 text-[10px] tracking-widest uppercase">DEPTH LEVEL (m)</h3>
            <span className="text-cyan-400 font-mono text-xl font-bold">{selectedDepth} m</span>
          </div>
          <div className="px-2 pb-2 pt-4">
            <input
              type="range"
              min="0"
              max={DEPTH_LEVELS.length - 1}
              value={selectedDepthIndex >= 0 ? selectedDepthIndex : 0}
              onChange={(e) => setSelectedDepth(DEPTH_LEVELS[parseInt(e.target.value)])}
              className="w-full accent-cyan-400 cursor-pointer"
              style={{ height: '4px' }}
            />
            <div className="flex justify-between text-[10px] text-white/40 font-mono mt-4 px-1">
              <span>0m</span>
              <span>1000m</span>
            </div>
          </div>
          
          <div className="text-[10px] text-white/60 font-mono mt-2">
            {selectedDepth === 0 ? "Viewing Surface (SST)" : "Viewing Full-Grid Reconstructed Field"}
          </div>
        </div>
      </div>

      <div className="w-[380px] flex flex-col gap-4 pointer-events-auto z-10 shrink-0 h-full overflow-y-auto hide-scrollbar pl-2 pb-20">
        {/* PROFILE CHART */}
        <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm flex flex-col">
          <h3 className="text-white/70 text-[10px] tracking-widest uppercase mb-4 flex justify-between">
            <span>SUBSURFACE PROFILE</span>
            <span className="text-cyan-400">T(°C) vs Depth(m)</span>
          </h3>

          {!predictionData ? (
            <div className="flex items-center justify-center border border-white/5 bg-white/5 backdrop-blur-md rounded text-white/30 uppercase tracking-widest text-center text-[10px] font-mono px-4 h-[400px]">
              {predictionError ? "PREDICTION FAILED" : "SELECT LOCATION"}
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profileChartData} layout="vertical" margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fff" strokeOpacity={0.1} horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    domain={['dataMin - 1', 'dataMax + 1']} 
                    stroke="#fff" 
                    strokeOpacity={0.3} 
                    tick={{ fill: '#fff', opacity: 0.5, fontSize: 10 }}
                    tickFormatter={(val) => val.toFixed(1)}
                  />
                  <YAxis 
                    dataKey="depth" 
                    type="category" 
                    stroke="#fff" 
                    strokeOpacity={0.3} 
                    tick={{ fill: '#fff', opacity: 0.5, fontSize: 10 }} 
                    reversed={true}
                  />
                  <Tooltip content={<ProfileTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="OceanEmbed" 
                    stroke="#06b6d4" 
                    strokeWidth={2} 
                    dot={{ r: 3, fill: '#06b6d4' }} 
                    activeDot={{ r: 5, fill: '#fff' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
