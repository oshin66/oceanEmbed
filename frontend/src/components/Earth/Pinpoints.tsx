import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { WORLD_LOCATIONS } from '../../utils/locations';
import { useSimulationStore } from '../../store/useSimulationStore';

// Standard mapping for SphereGeometry where Prime Meridian (lon=0) is roughly at Z=1 or Z=-1.
// We'll use -90 offset which generally maps perfectly to 8k Earth maps
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 90) * (Math.PI / 180); 

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));

  return new THREE.Vector3(x, y, z);
}

const RADIUS = 1.002; // Just barely above the surface to prevent z-fighting with the sphere

export function Pinpoints() {
  const isExploring = useSimulationStore((state) => state.isExploring);
  
  if (!isExploring) return null;

  return (
    <group>
      {WORLD_LOCATIONS.map((loc) => {
        const pos = latLonToVector3(loc.lat, loc.lon, RADIUS);
        
        return (
          <Html
            key={loc.id}
            position={pos}
            center
            occlude // Automatically hides when behind the Earth
            zIndexRange={[10, 0]} // Ensures proper depth sorting
            className="pointer-events-none select-none flex items-center justify-center gap-1.5 transition-opacity duration-300"
          >
            {/* Tiny precise dot to mark the exact location */}
            <div className="w-[3px] h-[3px] rounded-full bg-white/90 shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
            
            {/* The location label */}
            <span 
              className={`text-[8.5px] font-mono whitespace-nowrap drop-shadow-md ${
                loc.type === 'continent' ? 'text-white font-bold tracking-widest' :
                loc.type === 'ocean' ? 'text-blue-100 font-semibold tracking-wider' :
                'text-white/60 font-medium'
              }`}
            >
              {loc.name.toUpperCase()}
            </span>
          </Html>
        );
      })}
    </group>
  );
}
