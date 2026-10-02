import { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Html } from '@react-three/drei';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useDashboardStore } from '../../store/useDashboardStore';
import { EARTH_TILT } from '../../utils/astronomy';
import { earthVertexShader, earthFragmentShader } from './shaders';
import { Satellite } from './Satellite';
import { OceanDataLayer } from '../Scene/OceanDataLayer';
// Fixed sun direction in WORLD space
const FIXED_SUN_DIRECTION = new THREE.Vector3(5, 2, 3).normalize();

function OceanLabel({ lat, lon, label, visible }: { lat: number; lon: number; label: string; visible: boolean }) {
  if (!visible) return null;
  // Calculate spherical coordinates for a radius of 1.02
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 90) * (Math.PI / 180);
  const position = new THREE.Vector3().setFromSphericalCoords(1.02, phi, theta);

  return (
    <group position={position}>
      <Html center>
        <div className="flex items-center gap-2">
          {/* Subtle dot */}
          <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
          {/* Label */}
          <div className="text-white font-mono text-[10px] tracking-widest bg-black/40 backdrop-blur-md px-2 py-1 rounded border border-white/20 whitespace-nowrap shadow-lg">
            {label}
          </div>
        </div>
      </Html>
    </group>
  );
}



export function Earth() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef  = useRef<THREE.Mesh>(null);
  const earthMatRef = useRef<THREE.ShaderMaterial>(null);

  
  const isPaused = useSimulationStore((state) => state.isPaused);
  const isExploring = useSimulationStore((state) => state.isExploring);
  const timeMultiplier = useSimulationStore((state) => state.timeMultiplier);
  const isIndianOceanFocused = useSimulationStore((state) => state.isIndianOceanFocused);
  
  // Manual rotation references
  const rotationRef = useRef(0);
  const currentScaleRef = useRef(1.0);
  const targetRotationRef = useRef<number | null>(null);

  const { gl } = useThree();

  // Load main texture, suspend until ready
  const colorMap = useTexture('/textures/8k_earth_daymap.jpg');
  
  // Dummy texture to prevent shader errors while loading
  const dummyTex = useMemo(() => {
    const t = new THREE.DataTexture(new Uint8Array([0,0,0,255]), 1, 1, THREE.RGBAFormat);
    t.needsUpdate = true;
    return t;
  }, []);

  const [nightMap, setNightMap] = useState<THREE.Texture>(dummyTex);
  const [cloudsMap, setCloudsMap] = useState<THREE.Texture>(dummyTex);
  const [specularMap, setSpecularMap] = useState<THREE.Texture>(dummyTex);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load('/textures/8k_earth_nightmap.jpg', (tex) => { 
      tex.colorSpace = THREE.SRGBColorSpace; 
      tex.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 16);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      setNightMap(tex); 
    });
    loader.load('/textures/8k_earth_clouds.jpg', (tex) => { 
      tex.colorSpace = THREE.NoColorSpace; 
      tex.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 16);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      setCloudsMap(tex); 
    });
    loader.load('/textures/earth_specular_2048.jpg', (tex) => { 
      tex.colorSpace = THREE.NoColorSpace; 
      tex.anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 16);
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      setSpecularMap(tex); 
    });
  }, [gl]);

  // Assign static textures once after load
  useEffect(() => {
    if (!earthMatRef.current) return;
    const u = earthMatRef.current.uniforms;
    u.tDiffuse.value  = colorMap;
    u.tNight.value    = nightMap;
    u.tClouds.value   = cloudsMap;
    u.tSpecular.value = specularMap;
    u.sunDirection.value.copy(FIXED_SUN_DIRECTION);

    // Apply high-quality filtering
    const maxAnisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 16);
    
    [colorMap, nightMap, cloudsMap, specularMap].forEach(tex => {
      tex.anisotropy = maxAnisotropy;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
    });

    // Correct color space for diffuse/color textures
    colorMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
    
    // Non-color data textures should remain linear
    cloudsMap.colorSpace = THREE.NoColorSpace;
    specularMap.colorSpace = THREE.NoColorSpace;

  }, [colorMap, nightMap, cloudsMap, specularMap, gl]);

  useEffect(() => {
    const handleFocus = (e: any) => {
      const { lon } = e.detail;
      // Pause the simulation so it stays on the target
      useSimulationStore.getState().setIsPaused(true);
      
      // Calculate the angle needed to face the camera.
      const isExploring = useSimulationStore.getState().isExploring;
      const cameraAngle = isExploring ? Math.PI * 0.15 : 0;
      // Convert longitude to radians and offset
      const lonRad = (lon + 90) * (Math.PI / 180);
      
      // We want: target_rotation + lonRad = cameraAngle
      // Find the closest rotation relative to current rotation to prevent spinning wildly
      let targetRot = cameraAngle - lonRad;
      const currentRot = rotationRef.current;
      
      // Normalize target to be near current rotation
      const diff = (targetRot - currentRot) % (Math.PI * 2);
      const shortestDiff = diff < -Math.PI ? diff + Math.PI * 2 : diff > Math.PI ? diff - Math.PI * 2 : diff;
      
      targetRotationRef.current = currentRot + shortestDiff;
    };
    
    window.addEventListener('focus-location', handleFocus);
    return () => window.removeEventListener('focus-location', handleFocus);
  }, []);

  useFrame((state, delta) => {
    if (!isPaused) {
      targetRotationRef.current = null; // Clear target when unpaused
    }


    const camDist = state.camera.position.length();
    const atmosphereBoost = THREE.MathUtils.clamp(1.0 + (2.0 - camDist) * 0.95, 1.0, 1.85);

    if (earthMatRef.current) {
      const u = earthMatRef.current.uniforms;
      u.uAtmosphereBoost.value = atmosphereBoost;
    }

    if (meshRef.current) {
      if (!isPaused) {
        rotationRef.current += delta * (2 * Math.PI / 90) * timeMultiplier;
      } else if (targetRotationRef.current !== null) {
        // Smoothly rotate to the target location
        rotationRef.current = THREE.MathUtils.lerp(rotationRef.current, targetRotationRef.current, delta * 3.0);
      }
      meshRef.current.rotation.y = rotationRef.current;

      if (!isPaused) {
        if (cloudsMap.wrapS !== THREE.RepeatWrapping) {
          cloudsMap.wrapS = THREE.RepeatWrapping;
          cloudsMap.wrapT = THREE.RepeatWrapping;
        }
        cloudsMap.offset.x -= delta * 0.001 * timeMultiplier;
      }
    }

    if (groupRef.current) {
      const targetScale = isExploring ? 1.35 : 1.0;
      const lerpSpeed = 2.5;
      currentScaleRef.current = THREE.MathUtils.lerp(currentScaleRef.current, targetScale, delta * lerpSpeed);
      
      if (currentScaleRef.current < 0.001) {
        groupRef.current.visible = false;
      } else {
        groupRef.current.visible = true;
        groupRef.current.scale.setScalar(currentScaleRef.current);
      }
    }


  });

  const earthUniforms = {
    tDiffuse:         { value: colorMap },
    tNight:           { value: nightMap },
    tClouds:          { value: cloudsMap },
    tSpecular:        { value: specularMap },
    sunDirection:     { value: FIXED_SUN_DIRECTION.clone() },
    uAtmosphereBoost: { value: 1.0 },
  };

  return (
    <group rotation={[0, 0, EARTH_TILT]} position={[0, -0.2, 0]}>
      <group ref={groupRef} visible={false}>
        <mesh 
          ref={meshRef}
          onClick={(e) => {
            if (useSimulationStore.getState().isIndianOceanFocused) {
              e.stopPropagation();
              const uv = e.intersections[0]?.uv;
              if (uv) {
                // Adjusting based on typical sphere geometry UVs
                // Note: Three.js sphere UVs start with x=0 at +z, meaning lon=0 is at x=0.5
                // Wait, typical equirectangular map: x=0.5 is Prime Meridian.
                const lon = (uv.x * 360) - 180;
                const lat = (uv.y * 180) - 90;
                useDashboardStore.getState().setSelectedLocation({ latitude: lat, longitude: lon, regionName: 'Custom Location' });
              }
            }
          }}
        >
          <sphereGeometry args={[1, 128, 128]} />
          <shaderMaterial
            ref={earthMatRef}
            vertexShader={earthVertexShader}
            fragmentShader={earthFragmentShader}
            uniforms={earthUniforms}
          />
          <OceanLabel lat={3} lon={80} label="INDIAN OCEAN" visible={isIndianOceanFocused} />
          <OceanLabel lat={11} lon={85} label="BAY OF BENGAL" visible={isIndianOceanFocused} />
          <OceanLabel lat={11} lon={70} label="ARABIAN SEA" visible={isIndianOceanFocused} />
          <OceanLabel lat={6} lon={73.5} label="LAKSHADWEEP" visible={isIndianOceanFocused} />
          <OceanLabel lat={7} lon={88} label="ANDAMAN & NICOBAR" visible={isIndianOceanFocused} />
          
          
          <OceanDataLayer />

        </mesh>
        
        <Satellite orbitRadius={1.25} orbitSpeed={0.8} />
      </group>
    </group>
  );
}
