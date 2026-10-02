import {
  CheckCircle2,
  Database,
  Layers3,
  Satellite,
  Target,
  Waves,
} from 'lucide-react';

const depths = ['0m', '5m', '10m', '20m', '30m', '50m', '75m', '100m', '125m', '150m', '200m', '300m', '500m', '700m', '1000m'];

const applications = [
  ['Climate science', 'Ocean heat content, climate variability, and long-term subsurface warming trends.'],
  ['Ocean monitoring', 'Continuous basin-scale monitoring, thermocline structure, and mesoscale eddies.'],
  ['Early warnings', 'Marine heatwaves, subsurface anomalies, and support for tsunami and storm-surge modelling.'],
  ['Ecosystem management', 'Fishery forecasting, coral-bleaching risk, and habitat suitability for marine species.'],
  ['Maritime operations', 'Route planning, offshore operations, and search-and-rescue decisions.'],
];

const technologies = [
  ['Data processing', 'Python, NumPy, Pandas, xarray'],
  ['Deep learning', 'PyTorch, PyTorch Geometric'],
  ['Visualization', 'Matplotlib, Plotly, Leaflet.js'],
  ['Web framework', 'React.js, FastAPI'],
  ['Data storage', 'NetCDF, HDF5'],
];

export default function OceanInfoSlides() {
  return (
    <div className="flex flex-col">
      {/* Slide 1: About */}
      <div className="w-full h-screen relative shrink-0 flex items-center justify-center overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/assets/ocean-button.jpg')" }}></div>
        <div className="relative z-10 w-[95%] max-w-[1400px] h-[85vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex items-center justify-end p-8 md:p-12 overflow-hidden">
          <div className="absolute left-16 top-1/2 -translate-y-1/2 max-w-md hidden md:block">
            <h2 className="text-6xl md:text-7xl font-[Playfair_Display] text-white/90 leading-tight">
              See the ocean <br/><span className="italic">beneath</span> <br/>the surface.
            </h2>
          </div>
          <div className="relative z-20 w-full md:w-[480px] bg-[#1e293b] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700 overflow-hidden flex flex-col">
            <div className="p-8 pb-6 border-b border-slate-700/50">
              <span className="inline-block px-3 py-1 border border-slate-500 rounded text-[10px] font-mono tracking-widest text-slate-300 mb-4 uppercase flex items-center gap-2 w-max">
                <Waves size={12} /> 01 / About
              </span>
              <h3 className="text-3xl font-bold text-white tracking-tight leading-tight">Bringing the depths to the surface</h3>
            </div>
            <div className="p-8 pt-6">
              <ul className="space-y-4 text-slate-300 text-[15px] font-light leading-relaxed list-none">
                <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
                  OceanEmbed is a satellite embedding-based deep learning framework that reconstructs subsurface ocean temperature from surface observations.
                </li>
                <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
                  Developed for Smart India Hackathon 2026 under the Ministry of Earth Sciences and hosted by INCOIS.
                </li>
                <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
                  It learns nonlinear relationships between surface signals and subsurface ocean structure across the North Indian Ocean.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Slide 2: Reconstruction */}
      <div className="w-full h-screen relative shrink-0 flex items-center justify-center overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/assets/ocean-button.jpg')" }}></div>
        <div className="relative z-10 w-[95%] max-w-[1400px] h-[85vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex items-center justify-start p-8 md:p-12 overflow-hidden">
          <div className="relative z-20 w-full md:w-[480px] bg-[#1e293b] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700 overflow-hidden flex flex-col">
            <div className="p-8 pb-6 border-b border-slate-700/50">
              <span className="inline-block px-3 py-1 border border-slate-500 rounded text-[10px] font-mono tracking-widest text-slate-300 mb-4 uppercase flex items-center gap-2 w-max">
                <Layers3 size={12} /> 02 / Reconstruction
              </span>
              <h3 className="text-3xl font-bold text-white tracking-tight leading-tight">Fifteen standard levels</h3>
            </div>
            <div className="p-8 pt-6">
              <p className="text-slate-300 text-[15px] font-light leading-relaxed mb-6">
                Daily satellite observations are transformed into high-resolution subsurface temperature fields at 0.25 degree spatial resolution from the surface to the deep ocean.
              </p>
              <div className="mb-2 text-xs font-mono text-slate-500 uppercase">Satellite inputs</div>
              <div className="flex flex-wrap gap-2">
                {['SST', 'SSS', 'SSH', 'Currents', 'Winds'].map(input => (
                  <span key={input} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-slate-300">{input}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute right-12 top-12 bottom-12 hidden md:flex flex-col justify-between items-end">
             {depths.map((depth) => (
                <div key={depth} className="flex items-center gap-4 group">
                  <span className="text-white/60 font-mono text-sm opacity-50 group-hover:opacity-100 transition-opacity">{depth}</span>
                  <div className="w-12 h-[1px] bg-white/20 group-hover:bg-cyan-400 group-hover:w-24 transition-all duration-300"></div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Slide 3: Why it matters */}
      <div className="w-full h-screen relative shrink-0 flex items-center justify-center overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/assets/ocean-button.jpg')" }}></div>
        <div className="relative z-10 w-[95%] max-w-[1400px] h-[85vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 md:p-12 overflow-hidden">
           <div className="w-full max-w-5xl mb-8 flex flex-col items-start">
              <span className="inline-block px-3 py-1 border border-white/20 rounded text-[10px] font-mono tracking-widest text-white mb-4 uppercase flex items-center gap-2">
                <Satellite size={12} /> 03 / Why it matters
              </span>
              <h2 className="text-4xl md:text-5xl font-[Playfair_Display] text-white">Better observations, farther below</h2>
           </div>
           
           <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map(([title, detail], i) => (
                <div key={title} className="bg-[#1e293b]/80 border border-slate-700 p-6 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform group">
                   <div className="text-xs font-mono text-cyan-500 mb-3">0{i+1}</div>
                   <h4 className="text-lg font-serif text-white mb-2">{title}</h4>
                   <p className="text-sm font-light text-slate-300">{detail}</p>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Slide 4: Prototype */}
      <div className="w-full h-screen relative shrink-0 flex flex-col items-center justify-center overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/assets/ocean-button.jpg')" }}></div>
        
        <div className="relative z-10 w-[95%] max-w-[1400px] h-[85vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex items-center justify-start p-8 md:p-12 mb-16 overflow-hidden">
          <div className="relative z-20 w-full md:w-[480px] bg-[#1e293b] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700 overflow-hidden flex flex-col mr-12">
            <div className="p-8 pb-6 border-b border-slate-700/50">
              <span className="inline-block px-3 py-1 border border-slate-500 rounded text-[10px] font-mono tracking-widest text-slate-300 mb-4 uppercase flex items-center gap-2 w-max">
                <Target size={12} /> 04 / Prototype
              </span>
              <h3 className="text-3xl font-bold text-white tracking-tight leading-tight">A working proof of concept</h3>
            </div>
            <div className="p-8 pt-6">
              <p className="text-slate-300 text-[15px] font-light leading-relaxed mb-6">
                Processes live satellite data and creates real-time subsurface temperature estimates, validated with independent ARGO float observations.
              </p>
              <ul className="space-y-3">
                {['Independent ARGO float observations', 'Correlation, RMSE, bias, and MAE', 'Cross-validation across time and region'].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-300 font-light">
                    <CheckCircle2 size={16} className="text-cyan-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex-1 hidden md:flex flex-col h-full bg-[#0f172a]/80 border border-slate-700/50 rounded-2xl p-8 overflow-hidden">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-xs uppercase tracking-widest mb-4 shrink-0">
              <Database size={14} /> Technology Stack
            </div>
            <div className="flex flex-col gap-4 justify-center flex-1 overflow-y-auto">
              {technologies.map(([comp, tech]) => (
                <div key={comp} className="flex flex-col border-b border-slate-700/50 pb-3 last:border-0 last:pb-0 shrink-0">
                  <span className="text-white font-serif text-lg">{comp}</span>
                  <span className="text-slate-400 text-sm font-light">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="absolute bottom-0 z-20 w-full flex items-center justify-between px-8 md:px-16 py-8 border-t border-white/10 bg-black/50 backdrop-blur-md text-slate-500 text-xs md:text-sm tracking-wide">
          <p>&copy; 2026 Ocean Embed. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors uppercase tracking-widest">Contact Us</a>
            <a href="mailto:1teamatlantiss@gmail.com" className="hover:text-white transition-colors">1teamatlantiss@gmail.com</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
