"use client";

import { motion } from "framer-motion";
import { 
  Waves, 
  ThermometerSun, 
  Droplets, 
  Navigation, 
  Wind,
  Satellite,
  BrainCircuit,
  BarChart3,
  Microscope,
  MapPin,
  Activity
} from "lucide-react";

const glorysVariables = [
  {
    id: "sst",
    title: "Sea Surface Temperature (SST)",
    description: "The fundamental parameter governing air-sea interactions. It drives global weather patterns, shapes marine ecosystems, and is a key indicator of climate change.",
    icon: <ThermometerSun className="w-5 h-5 text-slate-500 group-hover:text-orange-400 transition-colors" />,
  },
  {
    id: "sss",
    title: "Sea Surface Salinity (SSS)",
    description: "A primary indicator of the global water cycle. Salinity variations driven by evaporation, precipitation, and river runoff are vital for tracking ocean density and deep-water formation.",
    icon: <Droplets className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transition-colors" />,
  },
  {
    id: "ssh",
    title: "Sea Surface Height (SSH)",
    description: "Crucial for understanding ocean circulation, tracking global sea-level rise, and observing ocean eddies that transport heat and nutrients across vast distances.",
    icon: <Waves className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />,
  },
  {
    id: "currents",
    title: "Surface Currents",
    description: "The conveyor belts of the sea. By redistributing heat from the equator to the poles, currents regulate global climate and are essential for marine navigation and biology.",
    icon: <Navigation className="w-5 h-5 text-slate-500 group-hover:text-violet-400 transition-colors" />,
  },
  {
    id: "winds",
    title: "Surface Winds",
    description: "The invisible force driving surface ocean circulation and generating waves. Understanding wind stress is fundamental to predicting weather systems and marine conditions.",
    icon: <Wind className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />,
  },
  {
    id: "ssa",
    title: "Sea Surface Anomalies (SSA)",
    description: "Captures minute variations in the ocean surface that help indicate sub-mesoscale ocean structures and deeper temperature variations.",
    icon: <Activity className="w-5 h-5 text-slate-500 group-hover:text-pink-400 transition-colors" />,
  }
];

const capabilities = [
  { text: "Monitors surface ocean conditions", icon: <Waves className="w-5 h-5 text-cyan-400" /> },
  { text: "Collects multiple satellite-derived variables", icon: <Satellite className="w-5 h-5 text-slate-300" /> },
  { text: "Converts observations into AI embeddings", icon: <BrainCircuit className="w-5 h-5 text-purple-400" /> },
  { text: "Predicts temperature at 15 depths", icon: <BarChart3 className="w-5 h-5 text-emerald-400" /> },
  { text: "Validates predictions using ARGO observations", icon: <Microscope className="w-5 h-5 text-blue-400" /> },
  { text: "Provides daily predictions at 0.25° × 0.25° resolution", icon: <MapPin className="w-5 h-5 text-red-400" /> }
];

export default function GlorysInfo() {
  return (
    <div className="bg-[#050505] text-white w-full font-sans">
      
      {/* SLIDE 1: Satellite Information & Variables */}
      <section className="min-h-screen flex flex-col justify-center py-24 px-6 md:px-12 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto w-full z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <Satellite className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs tracking-widest text-slate-500 uppercase font-mono">Slide 01 / Satellite Information</h2>
            </div>
            
            <h3 className="text-4xl md:text-6xl font-serif font-medium leading-tight mb-8">
              Ocean Observations.
            </h3>
            <p className="text-slate-400 text-lg md:text-xl font-light max-w-4xl leading-relaxed">
              OceanEmbed Satellite continuously observes the ocean's surface to collect key variables. These surface observations provide the foundational data required for our embedding models.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            {glorysVariables.map((variable, i) => (
              <motion.div
                key={variable.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 md:p-8 border border-white/10 bg-white/[0.01] rounded-2xl hover:bg-white/[0.04] transition-all duration-500 group flex flex-col relative h-[220px] overflow-hidden hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(255,255,255,0.03)] hover:border-white/20"
              >
                <div className="flex items-center justify-between mb-auto">
                  <div className="text-xs tracking-widest text-slate-600 font-mono">0{i + 1}</div>
                  <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    {variable.icon}
                  </div>
                </div>
                
                <div className="mt-auto transition-transform duration-500 group-hover:-translate-y-24 md:group-hover:-translate-y-16">
                  <h4 className="text-xl font-serif text-slate-200 group-hover:text-white transition-colors">
                    {variable.title}
                  </h4>
                </div>
                
                <div className="absolute bottom-6 left-6 right-6 md:left-8 md:right-8 opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 pointer-events-none">
                  <p className="text-slate-400 text-sm leading-relaxed font-light">
                    {variable.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SLIDE 2: The AI Pipeline */}
      <section className="min-h-screen flex flex-col justify-center py-24 px-6 md:px-12 border-t border-white/5 relative overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16 md:text-center flex flex-col md:items-center"
          >
            <div className="flex items-center gap-3 mb-4">
              <BrainCircuit className="w-4 h-4 text-slate-500" />
              <h2 className="text-xs tracking-widest text-slate-500 uppercase font-mono">Slide 02 / Three-Stage Pipeline</h2>
            </div>
            <h3 className="text-5xl md:text-7xl font-serif font-medium leading-tight mb-8">
              Signal in. Structure out.
            </h3>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-white/10 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="p-10 md:p-14 border-r border-b border-white/10 hover:bg-white/[0.02] transition-colors flex flex-col"
            >
              <div className="text-xs tracking-widest text-slate-600 font-mono mb-8">01</div>
              <h4 className="text-2xl font-serif text-slate-200 mb-6">Data harmonization</h4>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                Aggregates multi-source satellite datasets, regrids to 0.25 x 0.25 degrees, aligns daily time steps, and normalizes missing values.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-10 md:p-14 border-r border-b border-white/10 hover:bg-white/[0.02] transition-colors flex flex-col"
            >
              <div className="text-xs tracking-widest text-slate-600 font-mono mb-8">02</div>
              <h4 className="text-2xl font-serif text-slate-200 mb-6">Embedding engine</h4>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                CNNs capture local patterns, Vision Transformers model long-range dependencies, and autoencoders create compact latent representations.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="p-10 md:p-14 border-r border-b border-white/10 hover:bg-white/[0.02] transition-colors flex flex-col"
            >
              <div className="text-xs tracking-widest text-slate-600 font-mono mb-8">03</div>
              <h4 className="text-2xl font-serif text-slate-200 mb-6">Subsurface reconstruction</h4>
              <p className="text-slate-400 text-sm leading-relaxed font-light">
                A multi-output regression head decodes learned embeddings into depth-wise temperature predictions across every level.
              </p>
            </motion.div>
          </div>

          <motion.div
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1, delay: 0.6 }}
             className="max-w-4xl mx-auto text-center"
          >
            <p className="text-slate-400 text-lg md:text-xl font-light leading-relaxed">
              These surface observations are processed by our AI-based Satellite Embedding Model, which learns hidden relationships between surface conditions and the ocean beneath them. The system then reconstructs subsurface ocean temperature at depths from 0 m to 1000 m over the North Indian Ocean.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SLIDE 3: Capabilities */}
      <section className="min-h-screen flex flex-col justify-center py-24 px-6 md:px-12 border-t border-white/5 relative overflow-hidden">
        <div className="absolute bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-900/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto w-full z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-xs tracking-widest text-slate-500 mb-4 uppercase font-mono">Slide 03 / What It Does</h2>
            <h3 className="text-4xl md:text-6xl font-serif font-medium leading-tight mb-8">
              Subsurface Intelligence.
            </h3>
            <p className="text-slate-400 text-lg md:text-xl font-light max-w-2xl leading-relaxed">
              From global observation to precise prediction, our system transforms raw surface data into actionable intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex items-center gap-6 p-6 md:p-8 bg-white/[0.01] border border-white/10 hover:bg-white/[0.03] transition-colors rounded-xl group"
              >
                <div className="p-4 bg-[#0a0a0a] rounded-lg border border-white/5 group-hover:scale-110 transition-transform">
                  {cap.icon}
                </div>
                <h4 className="text-lg md:text-xl font-serif text-slate-200">
                  {cap.text}
                </h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
