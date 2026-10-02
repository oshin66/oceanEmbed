import * as THREE from 'three';

// Axial tilt of Earth in radians (23.436 degrees)
export const EARTH_TILT = (23.436 * Math.PI) / 180;

/**
 * Calculates the Earth's rotation (around its Y axis) based on the given time.
 * At 12:00:00 UTC, the Prime Meridian (0 longitude) faces the Sun directly.
 * @param timeMs Time in milliseconds
 * @returns Rotation angle in radians
 */
export function getEarthRotation(timeMs: number): number {
  const date = new Date(timeMs);
  
  // Hours since midnight UTC
  const hours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600 + date.getUTCMilliseconds() / 3600000;
  
  // The Earth rotates 360 degrees (2*PI) in 24 hours relative to the Sun.
  // 12:00 UTC -> Sun is at Prime Meridian (depending on the coordinate system).
  // Assuming Sun is on the +X axis (1, 0, 0).
  // We want longitude 0 to face +X at 12:00 UTC.
  // A standard Three.js sphere with equirectangular map has lon 0 at +Z, and lon -90 at -X.
  // Let's adjust the offset so it visually matches reality.
  
  // 24 hours = 2PI radians.
  // At hours = 12, rotation should be such that lon 0 faces the sun.
  // The exact offset depends on the texture map. We will use a tweakable constant offset.
  const rotationOffset = Math.PI; // Adjust this visually if the texture maps are offset
  
  // Earth rotates eastward (counter-clockwise when viewed from North Pole).
  const angle = (hours / 24) * Math.PI * 2 + rotationOffset;
  
  return angle;
}

/**
 * Calculates the Sun's position based on the day of the year.
 * Assuming the Earth is at (0,0,0), this returns a normalized vector pointing to the Sun.
 * Since we tilt the Earth group by 23.436 degrees, the Sun simply moves on the XZ plane over a year.
 * @param timeMs Time in milliseconds
 * @returns THREE.Vector3 normalized direction of the Sun
 */
export function getSunDirection(timeMs: number): THREE.Vector3 {
  const date = new Date(timeMs);
  const start = new Date(date.getUTCFullYear(), 0, 0);
  const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Simplified orbit: Sun moves in a circle in the ecliptic plane (XZ)
  // Day 80 is roughly the Vernal Equinox (March 20)
  const angle = ((dayOfYear - 80) / 365.25) * Math.PI * 2;
  
  return new THREE.Vector3(Math.cos(angle), 0, -Math.sin(angle)).normalize();
}
