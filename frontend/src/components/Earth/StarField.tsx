
const count = 3000;

const [positions, colors, sizes] = (() => {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const siz = new Float32Array(count);
  
  for (let i = 0; i < count; i++) {
    const r = 200 + Math.random() * 100;
    
    // Even scattering over a sphere
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    
    // Color: mostly pale blue/white, very sparse
    const temp = Math.random();
    if (temp > 0.8) {
      // Pale blue
      col[i * 3] = 0.6;
      col[i * 3 + 1] = 0.8;
      col[i * 3 + 2] = 1.0;
    } else if (temp > 0.7) {
      // Very subtle faint yellow
      col[i * 3] = 1.0;
      col[i * 3 + 1] = 0.95;
      col[i * 3 + 2] = 0.85;
    } else {
      // Pure white
      col[i * 3] = 1.0;
      col[i * 3 + 1] = 1.0;
      col[i * 3 + 2] = 1.0;
    }
    
    // Size & Brightness: most are very small/faint, a few are bright
    if (Math.random() > 0.98) {
      // Bright & slightly larger
      const brightness = 0.8 + Math.random() * 0.2;
      col[i * 3] *= brightness;
      col[i * 3 + 1] *= brightness;
      col[i * 3 + 2] *= brightness;
      siz[i] = 1.0 + Math.random() * 1.0;
    } else {
      // Dim & smaller
      const brightness = 0.1 + Math.random() * 0.4;
      col[i * 3] *= brightness;
      col[i * 3 + 1] *= brightness;
      col[i * 3 + 2] *= brightness;
      siz[i] = 0.2 + Math.random() * 0.5;
    }
  }
  return [pos, col, siz];
})();

export function StarField() {

  const vertexShader = `
    attribute float size;
    attribute vec3 color;
    varying vec3 vColor;
    
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      // Size attenuation based on distance
      gl_PointSize = size * (300.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;
    
    void main() {
      // Soft circular particle
      float r = distance(gl_PointCoord, vec2(0.5, 0.5));
      if (r > 0.5) discard;
      
      // Soft edge
      float a = smoothstep(0.5, 0.1, r);
      gl_FragColor = vec4(vColor, a);
      
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `;

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent={true}
        depthWrite={false}
      />
    </points>
  );
}
