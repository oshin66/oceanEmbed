import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Earth } from './components/Earth/Earth';
import { StarField } from './components/Earth/StarField';
import { CameraController } from './components/Scene/CameraController';
import { Overlay } from './components/UI/Overlay';
import { VortexText } from './components/UI/VortexLogo';
import { useSimulationStore } from './store/useSimulationStore';
import AboutPage from './components/About/AboutPage';

function LandingPage() {
  const introStage = useSimulationStore((state) => state.introStage);
  const setIntroStage = useSimulationStore((state) => state.setIntroStage);

  // Only render during the landing stage
  if (introStage !== 'landing') return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-auto bg-transparent animate-in fade-in duration-1000">
      {/* Logo placed in its normal top-left spot */}
      <div style={{ position: 'absolute', top: 32, left: 32 }}>
        <VortexText />
      </div>

      <div className="absolute bottom-24 left-0 w-full flex justify-center pointer-events-none">
        <button
          onClick={() => {
            setIntroStage('done');
            useSimulationStore.getState().setIsExploring(false);
          }}
          className="pointer-events-auto px-12 py-4 bg-white/5 backdrop-blur-3xl border border-white/20 text-white shadow-[0_4px_30px_rgba(0,0,0,0.1)] rounded-2xl hover:bg-white/10 hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all duration-500"
        >
          <span className="text-sm md:text-base font-mono tracking-[0.25em] uppercase font-light drop-shadow-md">
            START YOUR JOURNEY
          </span>
        </button>
      </div>
    </div>
  );
}

function IntroSequence() {
  const introStage = useSimulationStore((state) => state.introStage);
  const setIntroStage = useSimulationStore((state) => state.setIntroStage);
  const [logoState, setLogoState] = useState<'entering' | 'visible' | 'exiting'>('entering');

  useEffect(() => {
    if (introStage === 'logo') {
      const t1 = setTimeout(() => setLogoState('visible'), 50);
      const t2 = setTimeout(() => setLogoState('exiting'), 2500);
      const t3 = setTimeout(() => setIntroStage('landing'), 4000);

      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [introStage, setIntroStage]);

  if (introStage === 'done') return null;

  const logoClasses = {
    entering: 'opacity-0 scale-75 blur-md',
    visible: 'opacity-100 scale-[2] blur-0',
    exiting: 'opacity-0 scale-[3] blur-md',
  }[logoState];

  return (
    <div
      className={`absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-1000 ${introStage !== 'logo' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      <div className={`transform transition-all duration-[1500ms] ease-in-out ${logoClasses}`}>
        <VortexText />
      </div>
    </div>
  );
}

import { OceanDashboard } from './components/UI/Dashboard/OceanDashboard';

export default function App() {
  const pageIndex = useSimulationStore((state) => state.pageIndex);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <IntroSequence />
      <LandingPage />
      <Overlay />
      <OceanDashboard />

      <div
        className="w-full flex flex-col transition-transform duration-700 ease-in-out"
        style={{ transform: pageIndex === 0 ? 'translateY(0)' : 'translateY(-100vh)' }}
      >
        <div className="w-full h-screen relative shrink-0">
          <Canvas
            gl={{
              antialias: true,
              alpha: false,
              powerPreference: "high-performance",
              toneMapping: THREE.ACESFilmicToneMapping,
              outputColorSpace: THREE.SRGBColorSpace,
            }}
            dpr={[1, 1.5]}
          >
            <color attach="background" args={['#000000']} />

            <ambientLight intensity={0.05} />

            <Suspense fallback={null}>
              <Earth />
              <StarField />
            </Suspense>

            <CameraController />

            <EffectComposer multisampling={0}>
              <Bloom
                mipmapBlur
                luminanceThreshold={1.0}
                intensity={1.42}
                radius={0.8}
              />
            </EffectComposer>
          </Canvas>
        </div>

        <div className="w-full h-screen relative shrink-0">
          <AboutPage isActive={pageIndex !== 0} />
        </div>
      </div>
    </div>
  );
}
