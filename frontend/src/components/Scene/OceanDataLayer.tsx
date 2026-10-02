import { useMemo, useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useDashboardStore } from '../../store/useDashboardStore';
import { useSimulationStore } from '../../store/useSimulationStore';

export function OceanDataLayer() {
  const isIndianOceanFocused = useSimulationStore((state) => state.isIndianOceanFocused);
  const surfaceData = useDashboardStore((state) => state.surfaceData);
  const selectedVariable = useDashboardStore((state) => state.selectedVariable);
  const dashboardMode = useDashboardStore((state) => state.dashboardMode);
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  
  const [mapData, setMapData] = useState<any>(null);

  useEffect(() => {
    const handleMapUpdate = (e: any) => {
      setMapData(e.detail);
    };
    window.addEventListener('update-reconstruction-map', handleMapUpdate);
    return () => window.removeEventListener('update-reconstruction-map', handleMapUpdate);
  }, []);

  const { points, vectors } = useMemo(() => {
    if (!isIndianOceanFocused) return { points: null, vectors: null };
    
    let activeData = surfaceData;
    let activeVar = selectedVariable;
    
    // Override with mapData if in reconstruct mode and mapData exists
    if (dashboardMode === 'RECONSTRUCT' && mapData) {
      activeData = mapData as any;
      activeVar = 'reconstructed_temp' as any;
    }
    
    if (!activeData) return { points: null, vectors: null };

    const { latitude, longitude, values, speed, u, v, temperature } = activeData as any;
    const isVector = activeVar.includes('current') || activeVar.includes('wind');
    
    // Determine which grid to use for scalar coloring
    let gridData = values;
    if (isVector) {
      if (activeVar.endsWith('_u')) gridData = u;
      else if (activeVar.endsWith('_v')) gridData = v;
      else gridData = speed || values;
    } else if (activeVar === 'reconstructed_temp' && temperature) {
      gridData = temperature;
    }

    if (!gridData) return { points: null, vectors: null };

    const latLen = latitude.length;
    const lonLen = longitude.length;
    
    // Arrays for scalar points
    const pointPositions: number[] = [];
    const pointColors: number[] = [];
    const pointSizes: number[] = [];

    // Arrays for vector instances
    const vectorMatrices: THREE.Matrix4[] = [];
    const vectorColors: THREE.Color[] = [];

    // Calculate Min/Max for color scaling
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let i = 0; i < latLen; i++) {
      for (let j = 0; j < lonLen; j++) {
        const val = gridData[i][j];
        if (val !== null) {
          if (val < minVal) minVal = val;
          if (val > maxVal) maxVal = val;
        }
      }
    }

    // Diverging scale for SLA
    if (activeVar === 'sla') {
      const absMax = Math.max(Math.abs(minVal), Math.abs(maxVal));
      minVal = -absMax;
      maxVal = absMax;
    }

    const colorScale = new THREE.Color();
    const upVector = new THREE.Vector3(0, 1, 0);
    const dummyMatrix = new THREE.Matrix4();
    const dummyPos = new THREE.Vector3();
    const dummyQuat = new THREE.Quaternion();
    const dummyScale = new THREE.Vector3(1, 1, 1);

    for (let i = 0; i < latLen; i++) {
      for (let j = 0; j < lonLen; j++) {
        const val = gridData[i][j];
        if (val === null) continue;

        const lat = latitude[i];
        const lon = longitude[j];

        // Spherical math
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 90) * (Math.PI / 180);
        
        const r = 1.002;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.sin(theta);

        const norm = (val - minVal) / (maxVal - minVal || 1);
        
        // Color mapping
        if (activeVar === 'sst' || activeVar === 'reconstructed_temp') {
          colorScale.setHSL(0.6 - (norm * 0.6), 1.0, 0.5); 
        } else if (activeVar === 'sss') {
          colorScale.setHSL(0.3 + (norm * 0.5), 1.0, 0.6); 
        } else if (activeVar === 'sla') {
          if (norm < 0.5) colorScale.setHSL(0.6, 1.0, 0.2 + (norm * 0.6));
          else colorScale.setHSL(0.0, 1.0, 0.2 + ((1 - norm) * 0.6));
        } else {
          colorScale.setHSL(0.5, norm, 0.6);
        }

        if (isVector) {
          // Sparse sampling for vectors (e.g. every 2nd or 3rd point)
          const step = activeVar.includes('wind') ? 3 : 2;
          if (i % step === 0 && j % step === 0 && u && v && u[i][j] !== null && v[i][j] !== null) {
            const uVal = u[i][j] as number;
            const vVal = v[i][j] as number;
            const mag = Math.sqrt(uVal * uVal + vVal * vVal);
            if (mag > 0.01) {
              // Calculate tangent vectors
              const E = new THREE.Vector3(-Math.sin(theta), 0, Math.cos(theta));
              const N = new THREE.Vector3(-Math.cos(phi)*Math.cos(theta), Math.sin(phi), -Math.cos(phi)*Math.sin(theta));
              
              const vec3D = new THREE.Vector3()
                .addScaledVector(E, uVal)
                .addScaledVector(N, vVal)
                .normalize();

              dummyPos.set(x, y, z);
              // The cone points up (+Y). We want it to point along vec3D.
              // We also want the cone to lie tangent to the sphere, which vec3D already is.
              dummyQuat.setFromUnitVectors(upVector, vec3D);
              
              // Scale by magnitude (clamped for visual sanity)
              const visualScale = Math.min(Math.max(mag * 0.05, 0.5), 2.0) * 0.005;
              dummyScale.set(visualScale, visualScale * 2, visualScale);
              
              dummyMatrix.compose(dummyPos, dummyQuat, dummyScale);
              vectorMatrices.push(dummyMatrix.clone());
              vectorColors.push(colorScale.clone());
            }
          }
          
          // Also render a faint scalar backdrop for vectors
          pointPositions.push(x, y, z);
          pointColors.push(colorScale.r, colorScale.g, colorScale.b);
          pointSizes.push(0.8);
        } else {
          // Normal scalar points
          pointPositions.push(x, y, z);
          pointColors.push(colorScale.r, colorScale.g, colorScale.b);
          pointSizes.push(1.5);
        }
      }
    }

    return {
      points: pointPositions.length > 0 ? {
        positions: new Float32Array(pointPositions),
        colors: new Float32Array(pointColors),
        sizes: new Float32Array(pointSizes)
      } : null,
      vectors: vectorMatrices.length > 0 ? {
        matrices: vectorMatrices,
        colors: vectorColors
      } : null
    };
  }, [surfaceData, selectedVariable, isIndianOceanFocused, dashboardMode, mapData]);

  // Update InstancedMesh matrices and colors
  useEffect(() => {
    if (instancedMeshRef.current && vectors) {
      vectors.matrices.forEach((mat, i) => {
        instancedMeshRef.current!.setMatrixAt(i, mat);
        instancedMeshRef.current!.setColorAt(i, vectors.colors[i]);
      });
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      if (instancedMeshRef.current.instanceColor) {
        instancedMeshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [vectors]);

  if (!isIndianOceanFocused) return null;

  return (
    <group>
      {/* Scalar Points */}
      {points && (
        <points key={`points-${selectedVariable}-${surfaceData?.date}`}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[points.positions, 3]} />
            <bufferAttribute attach="attributes-color" args={[points.colors, 3]} />
            <bufferAttribute attach="attributes-size" args={[points.sizes, 1]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.015}
            vertexColors={true}
            transparent={true}
            opacity={vectors ? 0.3 : 0.8}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {/* Vector Arrows */}
      {vectors && (
        <instancedMesh
          key={`vectors-${selectedVariable}-${surfaceData?.date}`}
          ref={instancedMeshRef}
          args={[undefined, undefined, vectors.matrices.length]}
        >
          <coneGeometry args={[0.5, 2, 8]} />
          <meshBasicMaterial 
            vertexColors={true} 
            transparent={true} 
            opacity={0.9} 
            depthWrite={false} 
            blending={THREE.AdditiveBlending}
          />
        </instancedMesh>
      )}
    </group>
  );
}
