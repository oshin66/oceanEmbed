export const earthVertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;
  
  void main() {
    vUv = uv;
    // Use the 3x3 portion of modelMatrix for normals (correct for non-uniform scale cases)
    // modelMatrix includes both the group tilt and mesh rotation
    mat3 worldMat = mat3(modelMatrix);
    vWorldNormal = normalize(worldMat * normal);
    vec4 worldPos4 = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos4.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos4;
  }
`;

export const earthFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform sampler2D tNight;
  uniform sampler2D tSpecular;
  uniform sampler2D tClouds;

  uniform vec3 sunDirection;

  uniform float uAtmosphereBoost; // Boost atmosphere glow on close pass

  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  // Boost color saturation by factor s (1.0 = unchanged)
  vec3 saturate(vec3 color, float s) {
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    return mix(vec3(lum), color, s);
  }

  void main() {
    vec3 normal   = normalize(vWorldNormal);
    vec3 viewDir  = normalize(cameraPosition - vWorldPosition);
    // lightDir is the fixed world-space sun direction
    vec3 lightDir = normalize(sunDirection);

    // ---- read textures ----
    vec3 dayColor   = texture2D(tDiffuse,  vUv).rgb;
    vec3 nightColor = texture2D(tNight,    vUv).rgb;
    float specStr   = texture2D(tSpecular, vUv).r;
    float cloudMask = clamp(texture2D(tClouds, vUv).r, 0.0, 1.0);

    // Boost day texture saturation to eliminate washed-out grey-tan look
    dayColor = saturate(dayColor, 1.35);

    // ================================================================
    // UNIFIED LIGHTING / TERMINATOR
    // Computed in world space: normal rotates with the earth,
    // lightDir is fixed → NdotL changes as earth spins → visible terminator
    // ================================================================
    float NdotL = dot(normal, lightDir);
    // Soft graduated band spanning ~50° either side of the terminator
    float terminator = smoothstep(-0.25, 0.25, NdotL);

    // ================================================================
    // 1. DAY TEXTURE (Lit & Shadowed)
    // ================================================================
    vec3 dayBase = mix(dayColor, vec3(1.0), cloudMask * 0.85);
    
    // Specular highlight only on lit side (Blinn-Phong)
    float NdotH  = max(dot(normal, normalize(lightDir + viewDir)), 0.0);
    float specular = pow(NdotH, 32.0) * specStr * 0.6;
    
    // Shadowed side: cool blue-grey tint, ~10% brightness — texture remains readable
    vec3 shadowTint = vec3(0.08, 0.10, 0.18);
    vec3 dayShadow  = dayBase * shadowTint;
    
    // Lit side: dimmed down for reduced overall brightness
    vec3 dayLit  = dayBase * 0.65 + vec3(specular * 0.7);
    vec3 dayFace = mix(dayShadow, dayLit, terminator);

    // ================================================================
    // 2. NIGHT TEXTURE (City Lights & Dark Ocean)
    // ================================================================
    vec3 oceanDark   = vec3(0.012, 0.020, 0.045);
    vec3 oceanLight  = vec3(0.045, 0.10, 0.22);
    // Ocean gets subtle directional volume on the lit side too
    float oceanLit   = clamp(NdotL * 0.5 + 0.5, 0.0, 1.0) * 0.15;
    vec3 oceanColor  = mix(oceanDark, oceanLight, oceanLit);
    
    vec3 landColor   = vec3(0.22, 0.25, 0.18) * 0.10;
    vec3 nightSurface = mix(landColor, oceanColor, smoothstep(0.0, 0.1, specStr));
    
    vec3 cloudTintN  = vec3(0.82, 0.85, 0.88);
    nightSurface = mix(nightSurface, cloudTintN, cloudMask * 0.25);

    // City lights — tweaked for larger clusters, smoother falloff, and warmer gold
    float rawLum     = dot(nightColor, vec3(0.299, 0.587, 0.114));
    
    // Lower start threshold expands the visible light spread for all countries
    float cityMask   = smoothstep(0.04, 0.60, rawLum);
    
    float nightGate  = 1.0 - smoothstep(-0.1, 0.2, NdotL); // fade lights in shadow
    
    // Warmer, richer amber-gold palette
    vec3 sparseCity  = vec3(0.85, 0.40, 0.1); 
    vec3 midCity     = vec3(1.0, 0.76, 0.32);  // Rich amber-gold (#FFC251)
    vec3 coreCity    = vec3(1.0, 0.95, 0.65);  // Very bright cores
    vec3 cityColorMap = mix(mix(sparseCity, midCity, smoothstep(0.0, 0.5, cityMask)), coreCity, smoothstep(0.5, 1.0, cityMask));
    
    // Lower exponent softens the harsh edges, higher multiplier boosts brightness
    float cityIntensity = pow(cityMask, 0.9) * 4.2 * nightGate;
    nightSurface += cityColorMap * cityIntensity;
    
    vec3 nightFace = nightSurface * 0.75;

    // ================================================================
    // 3. ATMOSPHERIC RIM — only on the sunlit limb
    // ================================================================
    float NdotV  = clamp(dot(normal, viewDir), 0.0, 1.0);
    float fresnel = pow(1.0 - NdotV, 4.5);
    // Gate: rim appears only where sun hits the edge (not on dark side)
    float rimGate = smoothstep(-0.1, 0.25, NdotL);
    vec3 rimCore  = vec3(0.40, 0.80, 1.0);
    vec3 rimOuter = vec3(0.20, 0.60, 0.98);
    vec3 rimColor = mix(rimOuter, rimCore, pow(fresnel, 1.2));
    vec3 atmosphereRim = rimColor * fresnel * rimGate * 1.5 * uAtmosphereBoost;

    // ================================================================
    // 4. COMBINE DAY AND NIGHT
    // ================================================================
    vec3 finalColor = mix(nightFace, dayFace, terminator);
    
    finalColor += atmosphereRim;
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

