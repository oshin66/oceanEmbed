import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-cyan-500/30 p-2 rounded text-xs font-mono">
        <p className="text-white mb-1">Depth: {label}m</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>
            {p.name}: {p.value !== null && p.value !== undefined ? p.value.toFixed(3) : 'N/A'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface DepthMetricChartProps {
  data: any[];
  title: string;
  dataKey: string;
  stroke: string;
  fill: string;
}

export const DepthMetricChart = ({ data, title, dataKey, stroke, fill }: DepthMetricChartProps) => (
  <div className="h-36 w-full relative border border-white/5 bg-black/20 rounded p-2 pt-6">
    <h4 className="text-white/40 text-[9px] tracking-widest uppercase absolute top-2 left-0 right-0 text-center">{title}</h4>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="depth_m" type="number" domain={[0, 1000]} stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 9}} />
        <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: 'rgba(255,255,255,0.4)', fontSize: 9}} />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          isAnimationActive={false} 
          type="monotone" 
          name={dataKey.replace('_C', '')} 
          dataKey={dataKey} 
          stroke={stroke} 
          strokeWidth={2} 
          dot={{r: 2, fill}} 
          connectNulls={true} 
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
