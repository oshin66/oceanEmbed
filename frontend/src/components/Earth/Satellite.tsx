import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DetailedSatellite } from './DetailedSatellite';

export function Satellite({ orbitRadius = 1.3, orbitSpeed = 0.5 }) {
  const satelliteRef = useRef<THREE.Group>(null);
  const orbitRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * orbitSpeed;
    }
  });

  return (
    <group ref={orbitRef}>
      {/* 
        Rotate by exactly Math.PI on Y to point the lens (+X) flawlessly at the Earth. 
        Apply a roll on X (0.8 rad) so the solar panels are angled and clearly visible.
      */}
      <group position={[orbitRadius, 0, 0]} ref={satelliteRef} rotation={[0.8, Math.PI, 0]}>
        {/* Local lights for the satellite so it renders proper PBR highlights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 2, 3]} intensity={3} />
        <directionalLight position={[-5, -2, -3]} intensity={0.5} color="#4466aa" />
        
        <DetailedSatellite scale={4} />
      </group>
    </group>
  );
}
