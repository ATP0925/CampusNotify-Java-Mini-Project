import * as THREE from 'three';

export const PulseBeaconShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uColor: { value: new THREE.Color(0.23, 0.51, 0.96) },
    uIntensity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uIntensity;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      float dist = distance(vUv, vec2(0.5));
      float pulse = 0.6 + 0.4 * sin(uTime * 4.0);
      float alpha = smoothstep(0.5, 0.0, dist) * pulse * uIntensity;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

export const createPulseBeaconMaterial = (colorHex: string = '#3b82f6') => {
  const uniforms = {
    uTime: { value: 0.0 },
    uColor: { value: new THREE.Color(colorHex) },
    uIntensity: { value: 1.0 },
  };

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader: PulseBeaconShader.vertexShader,
    fragmentShader: PulseBeaconShader.fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
};
