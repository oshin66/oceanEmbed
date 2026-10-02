import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useShallow } from 'zustand/react/shallow';

type MediaType = 'video' | 'image';

interface ScrollExpandMediaProps {
  mediaType?: MediaType;
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title: string;
  eyebrow?: string;
  headerNote?: string;
  children?: ReactNode;
  /** When false, all scroll/wheel listeners are detached so the Earth canvas keeps control */
  isActive: boolean;
  /** Ref to the scroll container so the parent can reset scroll position */
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

export default function ScrollExpandMedia({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  eyebrow,
  headerNote = 'Satellite intelligence for the ocean',
  children,
  isActive,
  scrollContainerRef,
}: ScrollExpandMediaProps) {
  const [progress, setProgress] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(1440);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchY = useRef<number | null>(null);
  const progressRef = useRef(0);
  const { showOceanFrontend: showOceans, setShowOceanFrontend: setShowOceans } = useSimulationStore(useShallow(state => ({ showOceanFrontend: state.showOceanFrontend, setShowOceanFrontend: state.setShowOceanFrontend })));
  const [isNavigating, setIsNavigating] = useState(false);
  // Internal scroll container ref (used when parent doesn't supply one)
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = scrollContainerRef ?? internalContainerRef;

  const setExpansion = (amount: number) => {
    const next = clamp(amount);
    progressRef.current = next;
    setProgress(next);
  };





  // Reset expansion progress whenever the panel becomes inactive
  useEffect(() => {
    if (!isActive) {
      setExpansion(0);
      // Reset scroll position inside the about panel
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
      }
    }
  }, [isActive]);

  useEffect(() => {
    const updateViewport = () => setViewportWidth(window.innerWidth);
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    // Only attach scroll/wheel listeners when the Ocean view is active
    if (!isActive || !showOceans) return;

    const container = containerRef.current;

    const onWheel = (event: WheelEvent) => {
      const scrollTop = container ? container.scrollTop : 0;
      const expansionStageTop = 0; // Ocean view is now at the top of the page
      
      // If we've scrolled down to the expansion stage
      if (scrollTop >= expansionStageTop - 5) {
        if (progressRef.current < 1 || (event.deltaY < 0 && scrollTop <= expansionStageTop + 5)) {
          event.preventDefault();
          setExpansion(progressRef.current + event.deltaY * 0.00105);
        }
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp' && event.key !== ' ') return;
      if (progressRef.current === 1 && event.key !== 'ArrowUp') return;
      event.preventDefault();
      setExpansion(progressRef.current + (event.key === 'ArrowUp' ? -0.14 : 0.14));
    };

    const onTouchStart = (event: TouchEvent) => {
      touchY.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchY.current === null) return;
      const nextY = event.touches[0]?.clientY;
      if (nextY === undefined) return;
      const delta = touchY.current - nextY;
      const scrollTop = container ? container.scrollTop : 0;
      const expansionStageTop = 0;

      if (scrollTop >= expansionStageTop - 5) {
        if (progressRef.current < 1 || (delta < 0 && scrollTop <= expansionStageTop + 5)) {
          event.preventDefault();
          setExpansion(progressRef.current + delta * 0.005);
        }
      }
      touchY.current = nextY;
    };

    const onTouchEnd = () => { touchY.current = null; };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isActive, showOceans]);

  const compactWidth = viewportWidth < 720 ? viewportWidth * 0.78 : Math.min(500, viewportWidth * 0.36);
  const compactHeight = viewportWidth < 720 ? 430 : 520;
  const mediaWidth = compactWidth + (viewportWidth * 0.96 - compactWidth) * progress;
  const mediaHeight = compactHeight + (Math.min(window.innerHeight * 0.88, 820) - compactHeight) * progress;
  const splitAmount = Math.min(viewportWidth * 0.18, 250) * progress;
  const [titleStart, ...titleEndParts] = title.split(' ');
  const titleEnd = titleEndParts.join(' ') || titleStart;



  return (
    <div
      id="about-top"
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className="about-panel-root"
    >
      {!showOceans && (
      <>
      <div className="w-full h-screen relative shrink-0 bg-black flex flex-col items-center justify-center">
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          <div className="css-starfield" />
        </div>
        
        {/* Scroll Back Button (hidden when ocean embed is active) */}
        <div 
          className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-2 transition-opacity duration-500"
          style={{ opacity: progress > 0.1 ? 0 : 1, pointerEvents: progress > 0.1 ? 'none' : 'auto' }}
        >
           <button
             onClick={() => {
               import('../../store/useSimulationStore').then(m => m.useSimulationStore.getState().setPageIndex(0));
             }}
             className="flex flex-col items-center gap-2 px-5 py-2 text-xs font-mono tracking-widest text-white hover:text-white/80 transition-all duration-500"
             title="Scroll Back to Earth"
           >
             <div className="flex flex-col items-center justify-center animate-[bounce_3s_ease-in-out_infinite]">
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-up"><path d="m17 11-5-5-5 5"/><path d="m17 18-5-5-5 5"/></svg>
             </div>
             <span>SCROLL BACK</span>
           </button>
        </div>

        {/* Split Page Content */}
        <div 
          className="absolute inset-0 pt-32 pb-16 px-16 flex gap-8 z-10 pointer-events-auto transition-opacity duration-500"
        >
            {/* Satellite Half */}
            <div 
              onClick={() => { 
                setIsNavigating(true);
                setTimeout(() => {
                  window.location.href = '/satellite.html';
                }, 500);
              }}
              className="relative overflow-hidden flex-1 flex flex-col items-center justify-center border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 cursor-pointer group"
            >
              {/* Base Image */}
              <div 
                className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                style={{ backgroundImage: "url('/assets/new-satellite.jpg')" }}
              ></div>
              
              {/* Glass Overlay */}
              <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-[6px] group-hover:backdrop-blur-none group-hover:bg-black/10 transition-all duration-500 border border-white/10 rounded-3xl"></div>
              
              {/* Content */}
              <div className="relative z-20 flex flex-col items-center justify-center">
                <h2 className="text-4xl md:text-6xl font-[Playfair_Display] text-white tracking-wider group-hover:scale-105 transition-transform duration-500 drop-shadow-lg">
                  SATELLITE
                </h2>
                <p className="mt-4 text-white/80 font-mono text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 drop-shadow-md">
                  Explore Orbital Data
                </p>
              </div>
            </div>

          <div 
            onClick={() => {
              setIsNavigating(true);
              setTimeout(() => {
                setShowOceans(true);
                setTimeout(() => setIsNavigating(false), 50);
              }, 500);
            }}
            className="relative overflow-hidden flex-1 flex flex-col items-center justify-center border border-white/20 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-500 cursor-pointer group"
          >
            {/* Base Image */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              style={{ backgroundImage: "url('/assets/ocean-button.jpg')" }}
            ></div>
            
            {/* Glass Overlay */}
            <div className="absolute inset-0 z-10 bg-black/30 backdrop-blur-[6px] group-hover:backdrop-blur-none group-hover:bg-black/10 transition-all duration-500 border border-white/10 rounded-3xl"></div>
            
            {/* Content */}
            <div className="relative z-20 flex flex-col items-center justify-center">
              <h2 className="text-4xl md:text-6xl font-[Playfair_Display] text-white tracking-wider group-hover:scale-105 transition-transform duration-500 drop-shadow-lg">
                OCEANS
              </h2>
              <p className="mt-4 text-white/80 font-mono text-sm tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500 drop-shadow-md">
                Explore Marine Intelligence
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide 1: The Crisis */}
      <div className="w-full h-screen relative shrink-0 flex items-center justify-center overflow-hidden border-t border-white/5">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/assets/ocean-button.jpg')" }}></div>

        {/* Large Glass Pane */}
        <div className="relative z-10 w-[95%] max-w-[1400px] h-[85vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex items-center justify-end p-8 md:p-12 overflow-hidden">
          
          <div className="absolute left-16 top-1/2 -translate-y-1/2 max-w-md hidden md:block">
            <h2 className="text-7xl font-[Playfair_Display] text-white/90 leading-tight">
              The <br/><span className="italic">Unknown</span> <br/>Ocean.
            </h2>
          </div>

          {/* Dark Card */}
          <div className="relative z-20 w-full md:w-[450px] bg-[#1e293b] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700 overflow-hidden flex flex-col">
            <div className="p-8 pb-6 border-b border-slate-700/50">
              <span className="inline-block px-3 py-1 border border-slate-500 rounded text-[10px] font-mono tracking-widest text-slate-300 mb-4 uppercase">
                01 / THE CRISIS
              </span>
              <h3 className="text-4xl font-bold text-white tracking-tight">BLIND SPOT</h3>
            </div>
            
            <div className="p-8 pt-6">
              <ul className="space-y-4 text-slate-300 text-[15px] font-light leading-relaxed list-none">
                <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
                  While satellites observe the surface with incredible precision, the depths remain a mystery.
                </li>
                <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
                  This massive blind spot severely limits our ability to track marine heatwaves and model climate change.
                </li>
                <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
                  Protecting delicate marine ecosystems requires complete 3D thermal profiling.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Slide 2: The Solution */}
      <div className="w-full h-screen relative shrink-0 flex flex-col items-center justify-center overflow-hidden border-t border-white/5">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('/assets/new-satellite.jpg')" }}></div>

        {/* Large Glass Pane */}
        <div className="relative z-10 w-[95%] max-w-[1400px] h-[85vh] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex items-center justify-start p-8 md:p-12 mb-16 overflow-hidden">
          
          {/* Dark Card */}
          <div className="relative z-20 w-full md:w-[450px] bg-[#1e293b] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700 overflow-hidden flex flex-col">
            <div className="p-8 pb-6 border-b border-slate-700/50">
              <span className="inline-block px-3 py-1 border border-slate-500 rounded text-[10px] font-mono tracking-widest text-slate-300 mb-4 uppercase">
                02 / THE SOLUTION
              </span>
              <h3 className="text-4xl font-bold text-white tracking-tight">OCEANEMBED</h3>
            </div>
            
            <div className="p-8 pt-6">
              <ul className="space-y-4 text-slate-300 text-[15px] font-light leading-relaxed list-none">
                <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
                  A deep learning framework that reconstructs a full 3D thermal profile of the ocean.
                </li>
                <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
                  Uses nothing but surface satellite telemetry (SST, SSS, SSH, currents, and winds).
                </li>
                <li className="relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
                  Outputs complete thermal intelligence across 15 depth levels. Built for the future.
                </li>
              </ul>
            </div>
          </div>

          <div className="absolute right-16 top-1/2 -translate-y-1/2 max-w-md hidden md:block text-right">
            <h2 className="text-7xl font-[Playfair_Display] text-white/90 leading-tight">
              Subsurface <br/><span className="italic">Intelligence</span>.
            </h2>
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
      </>
      )}

      {showOceans && (
      <main className="expansion-shell relative">
        {/* Go Back Button to return to SATELLITE/OCEANS split view */}
        <div className="sticky top-8 z-30 pointer-events-auto flex justify-center pt-8 -mb-24">
           <button
             onClick={() => {
               setExpansion(0);
               setShowOceans(false);
               if (containerRef.current) {
                 containerRef.current.scrollTop = 0;
               }
             }}
             className="flex flex-col items-center gap-2 px-5 py-2 text-xs font-mono tracking-widest text-white hover:text-white/80 transition-all duration-500"
             title="Go Back to Menus"
           >
             <div className="flex flex-col items-center justify-center animate-[bounce_3s_ease-in-out_infinite]">
               <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m17 11-5-5-5 5"/><path d="m17 18-5-5-5 5"/></svg>
             </div>
             <span>GO BACK</span>
           </button>
        </div>

        <section className="expansion-stage" aria-label={title}>
          {bgImageSrc.endsWith('.mp4') || bgImageSrc.endsWith('.webm') ? (
            <motion.video
              className="ocean-backdrop"
              src={bgImageSrc}
              autoPlay muted loop playsInline preload="metadata"
              style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: -1 }}
              animate={{ opacity: 1 - progress * 0.95, scale: 1 + progress * 0.04 }}
              transition={{ duration: 0.18, ease: 'linear' }}
            />
          ) : (
            <motion.div
              className="ocean-backdrop"
              style={{ backgroundImage: `url(${bgImageSrc})` }}
              animate={{ opacity: 1 - progress * 0.95, scale: 1 + progress * 0.04 }}
              transition={{ duration: 0.18, ease: 'linear' }}
            />
          )}
          <div className="backdrop-wash" />

          <header className="site-header">
            <span className="header-note" style={{ gridColumn: 3, justifySelf: 'end' }}>{headerNote}</span>
          </header>

          <div className="stage-content">
            <motion.div
              className="title-line title-line-left"
              animate={{ x: -splitAmount, opacity: 1 - progress * 1.5 }}
              transition={{ duration: 0.12, ease: 'linear' }}
            >
              <h1>{titleStart}</h1>
              <span>{eyebrow}</span>
            </motion.div>

            <motion.figure
              className="media-frame"
              animate={{ width: mediaWidth, height: mediaHeight, borderRadius: `${22 - progress * 20}px` }}
              transition={{ duration: 0.14, ease: 'linear' }}
            >
              {mediaType === 'video' ? (
                <video ref={videoRef} src={mediaSrc} poster={posterSrc} autoPlay muted loop playsInline preload="metadata" />
              ) : (
                <img src={mediaSrc} alt={title} />
              )}

            </motion.figure>

            <motion.div
              className="title-line title-line-right"
              animate={{ x: splitAmount, opacity: 1 - progress * 1.5 }}
              transition={{ duration: 0.12, ease: 'linear' }}
            >
              <h1>{titleEnd}</h1>
              <span>Subsurface intelligence</span>
            </motion.div>
          </div>


        </section>

        <motion.section
          id="about-story"
          className="story-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 0.88 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.section>
      </main>
      )}

      {/* Page Transition Overlay (Main View) */}
      <div 
        className={`fixed inset-0 z-[100] bg-black transition-opacity duration-500 pointer-events-none ${isNavigating ? 'opacity-100' : 'opacity-0'}`} 
      />
    </div>
  );
}
