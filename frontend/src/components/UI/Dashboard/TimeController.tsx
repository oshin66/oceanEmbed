import { useState, useEffect } from 'react';
import { useDashboardStore } from '../../../store/useDashboardStore';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

export function TimeController() {
  const { selectedDate, setSelectedDate } = useDashboardStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const minDateStr = "2024-02-03";
  const maxDateStr = "2026-01-15";

  const advanceDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setUTCDate(current.getUTCDate() + days);
    const newDateStr = current.toISOString().split('T')[0];
    
    if (newDateStr >= minDateStr && newDateStr <= maxDateStr) {
      setSelectedDate(newDateStr);
    } else {
      setIsPlaying(false); // Stop if we hit boundaries
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        advanceDate(1);
      }, 2500); // 2.5s per frame to allow API loading
    }
    return () => clearInterval(interval);
  }, [isPlaying, selectedDate]);

  return (
    <div className="flex justify-start pointer-events-auto w-[320px]">
      <div className="bg-black/40 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center gap-2 w-full">
        <h3 className="text-white/70 text-[10px] tracking-widest uppercase flex items-center justify-between w-full mb-1">
          <span>HISTORICAL DATA</span>
          <span className="text-white/40 ml-auto text-[8px]">2024-02-03 TO 2026-01-15</span>
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => advanceDate(-1)}
            className="p-2 rounded-full hover:bg-cyan-500/20 text-white transition-colors disabled:opacity-30"
            disabled={selectedDate <= minDateStr}
          >
            <ChevronLeft size={18} />
          </button>

          <input 
            type="date"
            min={minDateStr}
            max={maxDateStr}
            value={selectedDate}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedDate(e.target.value);
              }
            }}
            className="bg-cyan-950/40 border border-cyan-500/50 text-white font-mono tracking-widest p-2 rounded focus:outline-none focus:border-cyan-300 transition-colors cursor-pointer w-36 text-center"
          />

          <button 
            onClick={() => advanceDate(1)}
            className="p-2 rounded-full hover:bg-cyan-500/20 text-white transition-colors disabled:opacity-30"
            disabled={selectedDate >= maxDateStr}
          >
            <ChevronRight size={18} />
          </button>

          <div className="w-px h-6 bg-cyan-500/30 mx-1"></div>

          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-cyan-500/30 text-white' : 'hover:bg-cyan-500/20 text-white'}`}
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
