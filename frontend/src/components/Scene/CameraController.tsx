import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useSimulationStore } from '../../store/useSimulationStore';

// Default wide cinematic view
const DEFAULT_POS    = new THREE.Vector3(0, 0, 3.2);
const DEFAULT_TARGET = new THREE.Vector3(0, 0, 0);

// Explore mode target geometry: 
// Angled upwards so Earth fills the bottom 40-45% with ~55-60% sky above.
// EXPLORE_LOOKAT Y is raised to 2.10 to compensate for the 1.35x sphere scale in Earth.tsx.
const EXPLORE_TARGET_Y = -0.55;
const EXPLORE_RADIUS_XZ = 1.75;
const EXPLORE_LOOKAT    = new THREE.Vector3(0, 2.80, 0);

// Indian Ocean focus mode
const INDIAN_OCEAN_POS = new THREE.Vector3(0, 0, 2.0); // Zoom in slightly from 2.2
const INDIAN_OCEAN_LOOKAT = new THREE.Vector3(-1.0, 0, 0); // Look slightly left so Earth appears on the right

// Cubic easing curve for weighty, cinematic motion
function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const isExploring = useSimulationStore((s) => s.isExploring);
  const isIndianOceanFocused = useSimulationStore((s) => s.isIndianOceanFocused);
  const setIsAnimating = useSimulationStore((s) => s.setIsAnimating);
  const pageIndex = useSimulationStore((s) => s.pageIndex);
  const isAboutOpen = pageIndex !== 0;

  // Disable orbit controls while the About panel is open
  useEffect(() => {
    if (!controlsRef.current) return;
    if (isAboutOpen) {
      controlsRef.current.enabled = false;
    } else {
      controlsRef.current.enabled = !isExploring && !isIndianOceanFocused && !isAnimatingRef.current;
    }
  }, [isAboutOpen, isExploring, isIndianOceanFocused]);

  // Animation state refs
  const isAnimatingRef = useRef(false);
  const animTimeRef = useRef(0);
  const ANIM_DURATION = 2.2; // total seconds for full transition

  // Animation start/end parameters
  const startPosRef = useRef(new THREE.Vector3());
  const startTargetRef = useRef(new THREE.Vector3());
  const startAngleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const targetRadiusXZRef = useRef(EXPLORE_RADIUS_XZ);
  const targetYRef = useRef(0);
  const targetLookAtRef = useRef(new THREE.Vector3());

  const tempTargetRef = useRef(new THREE.Vector3());
  const prevIsExploringRef = useRef(isExploring);
  const prevIsIndianOceanFocusedRef = useRef(false);

  useEffect(() => {
    // Initial camera setup
    const initCamera = () => {
      const { isExploring, isIndianOceanFocused } = useSimulationStore.getState();
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.fov = 50;
        if (isIndianOceanFocused) {
          camera.position.copy(INDIAN_OCEAN_POS);
          camera.lookAt(INDIAN_OCEAN_LOOKAT);
          if (controlsRef.current) {
            controlsRef.current.target.copy(INDIAN_OCEAN_LOOKAT);
            controlsRef.current.enabled = false;
          }
        } else if (isExploring) {
          camera.position.set(0, EXPLORE_TARGET_Y, EXPLORE_RADIUS_XZ);
          camera.lookAt(EXPLORE_LOOKAT);
          if (controlsRef.current) {
            controlsRef.current.target.copy(EXPLORE_LOOKAT);
            controlsRef.current.enabled = false;
          }
        } else {
          camera.position.copy(DEFAULT_POS);
          camera.lookAt(DEFAULT_TARGET);
          if (controlsRef.current) {
            controlsRef.current.target.copy(DEFAULT_TARGET);
            controlsRef.current.enabled = true;
          }
        }
        camera.updateProjectionMatrix();
        if (controlsRef.current) {
          controlsRef.current.update();
        }
        isAnimatingRef.current = false;
        setIsAnimating(false);
      }
    };

    initCamera();

    const handleReset = () => {
      initCamera();
    };

    window.addEventListener('reset-camera', handleReset);
    return () => window.removeEventListener('reset-camera', handleReset);
  }, [camera, setIsAnimating]);

  // Trigger animation whenever isExploring or isIndianOceanFocused changes
  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return;

    if (prevIsExploringRef.current === isExploring && prevIsIndianOceanFocusedRef.current === isIndianOceanFocused) return;
    prevIsExploringRef.current = isExploring;
    prevIsIndianOceanFocusedRef.current = isIndianOceanFocused;

    // Capture current start state
    startPosRef.current.copy(camera.position);
    if (controlsRef.current) {
      startTargetRef.current.copy(controlsRef.current.target);
    } else {
      startTargetRef.current.copy(DEFAULT_TARGET);
    }

    const currentAngle = Math.atan2(camera.position.x, camera.position.z);
    startAngleRef.current = currentAngle;

    if (isIndianOceanFocused) {
      targetAngleRef.current = Math.atan2(INDIAN_OCEAN_POS.x, INDIAN_OCEAN_POS.z);
      targetYRef.current = INDIAN_OCEAN_POS.y;
      targetRadiusXZRef.current = Math.sqrt(INDIAN_OCEAN_POS.x * INDIAN_OCEAN_POS.x + INDIAN_OCEAN_POS.z * INDIAN_OCEAN_POS.z);
      targetLookAtRef.current.copy(INDIAN_OCEAN_LOOKAT);
    } else if (isExploring) {
      // Transitioning to Explore Mode: exact cinematic position
      targetAngleRef.current = Math.atan2(0, EXPLORE_RADIUS_XZ);
      targetYRef.current = EXPLORE_TARGET_Y;
      targetRadiusXZRef.current = EXPLORE_RADIUS_XZ;
      targetLookAtRef.current.copy(EXPLORE_LOOKAT);
    } else {
      // Transitioning back to Default Mode: exact default position
      targetAngleRef.current = Math.atan2(DEFAULT_POS.x, DEFAULT_POS.z);
      targetYRef.current = DEFAULT_POS.y;
      targetRadiusXZRef.current = Math.sqrt(DEFAULT_POS.x * DEFAULT_POS.x + DEFAULT_POS.z * DEFAULT_POS.z);
      targetLookAtRef.current.copy(DEFAULT_TARGET);
    }

    // Lock OrbitControls during transition
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }

    animTimeRef.current = 0;
    isAnimatingRef.current = true;
    setIsAnimating(true);
  }, [isExploring, isIndianOceanFocused, camera, setIsAnimating]);

  useFrame((_, delta) => {
    if (!isAnimatingRef.current || !(camera instanceof THREE.PerspectiveCamera)) return;

    animTimeRef.current += delta;
    const rawProgress = Math.min(animTimeRef.current / ANIM_DURATION, 1.0);

    // Two-stage motion curve:
    // 1. Rotation phase leads slightly (completes in first 80% of progress)
    const rotateProgress = easeInOutCubic(Math.min(rawProgress / 0.80, 1.0));
    // 2. Zoom/descend phase spans the full duration smoothly
    const descendProgress = easeInOutCubic(rawProgress);

    // Interpolate spherical orbit coordinates
    const startRadiusXZ = Math.sqrt(
      startPosRef.current.x * startPosRef.current.x + startPosRef.current.z * startPosRef.current.z
    );
    const currentAngle = THREE.MathUtils.lerp(startAngleRef.current, targetAngleRef.current, rotateProgress);
    const currentRadiusXZ = THREE.MathUtils.lerp(startRadiusXZ, targetRadiusXZRef.current, descendProgress);
    const currentY = THREE.MathUtils.lerp(startPosRef.current.y, targetYRef.current, descendProgress);

    // Update camera position
    camera.position.set(
      currentRadiusXZ * Math.sin(currentAngle),
      currentY,
      currentRadiusXZ * Math.cos(currentAngle)
    );

    // Interpolate look-at target into persistent Vector3 ref to prevent GC allocations
    tempTargetRef.current.lerpVectors(
      startTargetRef.current,
      targetLookAtRef.current,
      descendProgress
    );

    camera.lookAt(tempTargetRef.current);

    if (controlsRef.current) {
      controlsRef.current.target.copy(tempTargetRef.current);
      controlsRef.current.update();
    }

    // Check completion
    if (rawProgress >= 1.0) {
      isAnimatingRef.current = false;
      setIsAnimating(false);

      const currentlyExploring = useSimulationStore.getState().isExploring;
      const currentlyIndianOcean = useSimulationStore.getState().isIndianOceanFocused;
      if (controlsRef.current) {
        // Only re-enable orbit controls when returning to default view,
        // keep them locked in Explore or Indian Ocean mode
        controlsRef.current.enabled = !currentlyExploring && !currentlyIndianOcean;
        controlsRef.current.target.copy(targetLookAtRef.current);
        controlsRef.current.minDistance = 1.15;
        controlsRef.current.maxDistance = 6.0;
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      enableDamping={true}
      dampingFactor={0.1}
      autoRotate={false}
      minDistance={1.15}
      maxDistance={6.0}
      target={DEFAULT_TARGET}
    />
  );
}
