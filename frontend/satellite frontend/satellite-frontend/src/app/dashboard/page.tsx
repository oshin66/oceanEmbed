"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Waves, ThermometerSun, Droplets, Activity } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts";

const sstData = [
  { month: "Jan", temp: 16.5 },
  { month: "Feb", temp: 16.8 },
  { month: "Mar", temp: 17.2 },
  { month: "Apr", temp: 18.0 },
  { month: "May", temp: 19.1 },
  { month: "Jun", temp: 20.5 },
  { month: "Jul", temp: 21.8 },
  { month: "Aug", temp: 22.1 },
  { month: "Sep", temp: 21.4 },
  { month: "Oct", temp: 19.8 },
  { month: "Nov", temp: 18.2 },
  { month: "Dec", temp: 17.0 },
];

const sssData = [
  { region: "Atlantic", salinity: 35.4 },
  { region: "Pacific", salinity: 34.6 },
  { region: "Indian", salinity: 34.8 },
  { region: "Southern", salinity: 34.2 },
  { region: "Arctic", salinity: 32.5 },
];

const sshData = [
  { year: "2018", anomaly: 2.1 },
  { year: "2019", anomaly: 3.4 },
  { year: "2020", anomaly: 4.8 },
  { year: "2021", anomaly: 6.2 },
  { year: "2022", anomaly: 7.9 },
  { year: "2023", anomaly: 9.4 },
  { year: "2024", anomaly: 11.2 },
];

const summaryCards = [
  {
    title: "Global Avg SST",
    value: "18.4 °C",
    trend: "+0.2°C vs last year",
    icon: <ThermometerSun className="w-5 h-5 text-slate-400" />,
  },
  {
    title: "Global Avg SSS",
    value: "34.7 PSU",
    trend: "Stable",
    icon: <Droplets className="w-5 h-5 text-slate-400" />,
  },
  {
    title: "Global Mean SSH",
    value: "+11.2 mm",
    trend: "+1.8mm vs last year",
    icon: <Waves className="w-5 h-5 text-slate-400" />,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden relative font-sans">
      
      {/* Top Navigation */}
      <nav className="w-full border-b border-white/5 py-6 px-6 md:px-12 flex justify-between items-center">
        <div className="text-xs tracking-widest text-slate-500 uppercase font-medium">Vortex</div>
        <Link 
          href="/"
          className="text-xs tracking-widest text-slate-400 hover:text-white uppercase transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-3 h-3" />
          Go Back
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24">
        
        {/* Header matching the theme */}
        <header className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm tracking-widest text-slate-400 mb-6 uppercase">01 / Overview</h2>
            <h1 className="text-5xl md:text-7xl font-serif font-medium leading-tight mb-8">
              GLORYS Metrics.
            </h1>
            <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
              Global Ocean Reanalysis and Simulation Dashboard providing continuous basin-scale monitoring of essential ocean variables.
            </p>
          </motion.div>
        </header>

        {/* Summary Cards structured like the 3-column grid in the theme */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm tracking-widest text-slate-400 mb-6 uppercase">02 / Key Indicators</h2>
            <h3 className="text-3xl md:text-5xl font-serif font-medium leading-tight mb-12">
              Signal in. Structure out.
            </h3>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-white/10">
            {summaryCards.map((card, idx) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: 0.15 * idx, duration: 0.5 }}
                className="p-8 md:p-12 border-r border-b border-white/10 hover:bg-white/[0.02] transition-colors group flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-12">
                    <div className="text-xs tracking-widest text-slate-500 font-mono">0{idx + 1}</div>
                    {card.icon}
                  </div>
                  <h4 className="text-lg md:text-xl font-serif mb-2 text-slate-300">{card.title}</h4>
                  <div className="text-4xl md:text-5xl font-serif font-medium mb-6">{card.value}</div>
                </div>
                <div className="text-slate-400 text-sm tracking-wide font-light">
                  {card.trend}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-sm tracking-widest text-slate-400 mb-6 uppercase">03 / Detailed Analysis</h2>
            <h3 className="text-3xl md:text-5xl font-serif font-medium leading-tight mb-12">
              A clearer thermal picture for<br/>people who make ocean decisions.
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border-t border-l border-white/10">
            
            {/* Line Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="p-8 border-r border-b border-white/10 col-span-1 lg:col-span-2 hover:bg-white/[0.01] transition-colors"
            >
              <div className="flex items-center gap-3 mb-8">
                <ThermometerSun className="w-5 h-5 text-slate-500" />
                <h3 className="text-xl font-serif text-slate-200">Global Sea Surface Temperature (SST) Trend</h3>
              </div>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sstData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '14px' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="temp" stroke="#e2e8f0" strokeWidth={2} dot={{ fill: '#0a0a0a', stroke: '#e2e8f0', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#fff', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Bar Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="p-8 border-r border-b border-white/10 hover:bg-white/[0.01] transition-colors"
            >
              <div className="flex items-center gap-3 mb-8">
                <Droplets className="w-5 h-5 text-slate-500" />
                <h3 className="text-xl font-serif text-slate-200">Regional Salinity (SSS)</h3>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sssData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="region" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[30, 36]} dx={-10} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '14px' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Bar dataKey="salinity" fill="#334155" radius={[2, 2, 0, 0]} activeBar={{ fill: '#475569' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Area Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="p-8 border-r border-b border-white/10 hover:bg-white/[0.01] transition-colors"
            >
              <div className="flex items-center gap-3 mb-8">
                <Waves className="w-5 h-5 text-slate-500" />
                <h3 className="text-xl font-serif text-slate-200">Sea Surface Height Anomaly</h3>
              </div>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sshData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <defs>
                      <linearGradient id="colorAnomaly" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} dy={10} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', fontSize: '14px' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Area type="monotone" dataKey="anomaly" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorAnomaly)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
