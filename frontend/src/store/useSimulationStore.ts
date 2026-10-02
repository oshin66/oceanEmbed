import { create } from 'zustand'


interface SimulationState {
  isPaused: boolean;
  timeMultiplier: number;
  simulationTime: number; // UNIX timestamp in milliseconds
  isExploring: boolean;
  isIndianOceanFocused: boolean;
  isAnimating: boolean;
  togglePause: () => void;
  setIsPaused: (paused: boolean) => void;
  setSpeed: (multiplier: number) => void;
  updateTime: (deltaTime: number) => void;
  resetTime: () => void;
  toggleExplore: () => void;
  toggleIndianOceanFocus: () => void;
  setIsExploring: (val: boolean) => void;
  setIsAnimating: (animating: boolean) => void;
  introStage: 'logo' | 'landing' | 'done';
  setIntroStage: (stage: 'logo' | 'landing' | 'done') => void;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  showOceanFrontend: boolean;
  setShowOceanFrontend: (val: boolean) => void;
}

const isMenu = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('menu') === 'true';
if (isMenu && typeof window !== 'undefined') {
  window.history.replaceState(null, '', window.location.pathname);
}

export const useSimulationStore = create<SimulationState>((set) => ({
  isPaused: false,
  timeMultiplier: 1, // 1x = real time
  simulationTime: Date.now(),
  isExploring: !isMenu,
  isIndianOceanFocused: false,
  isAnimating: false,
  introStage: isMenu ? 'done' : 'logo',
  pageIndex: isMenu ? 1 : 0,
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  setIsPaused: (paused) => set({ isPaused: paused }),
  setSpeed: (multiplier) => set({ timeMultiplier: multiplier }),
  updateTime: (deltaTime) => set((state) => ({
    simulationTime: state.isPaused ? state.simulationTime : state.simulationTime + deltaTime * state.timeMultiplier
  })),
  resetTime: () => set({ simulationTime: Date.now(), timeMultiplier: 1 }),
  toggleExplore: () => set((state) => ({ isExploring: !state.isExploring })),
  toggleIndianOceanFocus: () => set((state) => ({ 
    isIndianOceanFocused: !state.isIndianOceanFocused,
    isPaused: state.isIndianOceanFocused ? false : state.isPaused
  })),
  setIsExploring: (val) => set({ isExploring: val }),
  setIsAnimating: (animating) => set({ isAnimating: animating }),
  setIntroStage: (stage) => set({ introStage: stage }),
  setPageIndex: (index) => set({ pageIndex: index }),
  showOceanFrontend: false,
  setShowOceanFrontend: (val) => set({ showOceanFrontend: val }),
}))
