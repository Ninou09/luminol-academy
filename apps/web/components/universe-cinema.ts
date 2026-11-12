import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  ShaderMaterial,
  Vector2,
  type Camera,
  type DataTexture,
  type Scene,
  type WebGLRenderer,
} from 'three';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/**
 * Cinematic layer for the universe backdrop, built only from the official
 * three.js addons (MIT): a bloom glow, plus a lens pass with film grain,
 * vignette and a whisper of chromatic aberration at the edges.
 */
export function createCinematicComposer(
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera,
) {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new Vector2(256, 256), 0.5, 0.45, 0.78);
  composer.addPass(bloom);
  const lens = new ShaderPass({
    uniforms: {
      tDiffuse: { value: null },
      uTime: { value: 0 },
      uAberration: { value: 0.0005 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      uniform float uAberration;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec2 centred = vUv - 0.5;
        float edge = dot(centred, centred);
        // Lens fringing grows toward the frame edges only.
        vec2 shift = centred * edge * uAberration * 40.0;
        vec3 color = vec3(
          texture2D(tDiffuse, vUv + shift).r,
          texture2D(tDiffuse, vUv).g,
          texture2D(tDiffuse, vUv - shift).b
        );
        // Soft cinematic vignette.
        color *= mix(0.72, 1.0, smoothstep(0.95, 0.2, edge * 1.6));
        // Fine animated film grain.
        float grain = hash(vUv * vec2(1920.0, 1080.0) + fract(uTime) * 100.0) - 0.5;
        color += grain * 0.022;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  composer.addPass(lens);

  return {
    setSize(width: number, height: number, pixelRatio: number) {
      composer.setPixelRatio(pixelRatio);
      composer.setSize(width, height);
      // Bloom at half resolution keeps the glow soft and inexpensive.
      bloom.resolution.set(width / 2, height / 2);
    },
    render(time: number) {
      lens.uniforms.uTime!.value = time;
      composer.render();
    },
    dispose() {
      bloom.dispose();
      composer.dispose();
    },
  };
}

const curlNoise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
vec3 noise3(vec3 p) {
  return vec3(snoise(p), snoise(p + vec3(31.4, 17.1, 9.2)), snoise(p + vec3(-12.7, 45.3, 3.9)));
}
// Divergence-free flow: particles swirl in ribbons instead of clumping.
vec3 curl(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);
  vec3 px0 = noise3(p - dx); vec3 px1 = noise3(p + dx);
  vec3 py0 = noise3(p - dy); vec3 py1 = noise3(p + dy);
  vec3 pz0 = noise3(p - dz); vec3 pz1 = noise3(p + dz);
  float x = (py1.z - py0.z) - (pz1.y - pz0.y);
  float y = (pz1.x - pz0.x) - (px1.z - px0.z);
  float z = (px1.y - px0.y) - (py1.x - py0.x);
  return normalize(vec3(x, y, z) / (2.0 * e));
}
`;

/**
 * "Stream of thoughts": GPU particles (GPUComputationRenderer) advected
 * through a curl-noise field around an invisible emitter, drawn as glowing
 * points that the bloom pass turns into luminous ribbons.
 */
export function createThoughtFlow(
  renderer: WebGLRenderer,
  size: number,
  colors: [string, string],
) {
  const compute = new GPUComputationRenderer(size, size, renderer);
  const seed = compute.createTexture();
  const start = compute.createTexture();
  fill(seed);
  fill(start);

  const positionVariable = compute.addVariable(
    'texturePosition',
    /* glsl */ `
      uniform float uTime;
      uniform float uDelta;
      uniform sampler2D textureSeed;
      ${curlNoise}
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 current = texture2D(texturePosition, uv);
        vec4 origin = texture2D(textureSeed, uv);
        float life = current.w - uDelta * (0.08 + origin.w * 0.12);
        vec3 p = current.xyz;
        if (life <= 0.0) {
          // Rebirth on a soft shell around the emitter.
          p = normalize(origin.xyz - 0.5) * (2.0 + origin.w * 4.0);
          life = 1.0;
        }
        vec3 flow = curl(p * 0.11 + vec3(0.0, uTime * 0.04, 0.0));
        // Gentle pull back toward the centre keeps the ribbons together.
        p += (flow * 3.2 - p * 0.035) * uDelta;
        gl_FragColor = vec4(p, life);
      }
    `,
    start,
  );
  compute.setVariableDependencies(positionVariable, [positionVariable]);
  const uniforms = positionVariable.material.uniforms;
  uniforms.uTime = { value: 0 };
  uniforms.uDelta = { value: 0.016 };
  uniforms.textureSeed = { value: seed };
  const error = compute.init();
  if (error !== null) return null;

  const count = size * size;
  const references = new Float32Array(count * 2);
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index++) {
    references[index * 2] = (index % size) / size + 0.5 / size;
    references[index * 2 + 1] = Math.floor(index / size) / size + 0.5 / size;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aReference', new BufferAttribute(references, 2));
  const material = new ShaderMaterial({
    uniforms: {
      texturePosition: { value: null },
      uColorA: { value: new Color(colors[0]) },
      uColorB: { value: new Color(colors[1]) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 1.6) },
    },
    vertexShader: /* glsl */ `
      uniform sampler2D texturePosition;
      uniform float uPixelRatio;
      attribute vec2 aReference;
      varying float vLife;
      varying float vMix;
      void main() {
        vec4 data = texture2D(texturePosition, aReference);
        vec4 mv = modelViewMatrix * vec4(data.xyz, 1.0);
        vLife = data.w;
        vMix = fract(aReference.x * 7.0 + aReference.y * 3.0);
        gl_PointSize = clamp(2.2 * uPixelRatio * (40.0 / max(-mv.z, 1.0)), 0.0, 6.0 * uPixelRatio);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vLife;
      varying float vMix;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float glow = smoothstep(0.5, 0.0, d);
        float fade = smoothstep(0.0, 0.2, vLife) * smoothstep(1.0, 0.85, vLife);
        vec3 color = mix(uColorA, uColorB, vMix);
        float a = glow * fade * 0.55;
        gl_FragColor = vec4(color * a, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;

  return {
    points,
    update(time: number, delta: number) {
      uniforms.uTime!.value = time;
      uniforms.uDelta!.value = Math.min(delta, 0.05);
      compute.compute();
      material.uniforms.texturePosition!.value =
        compute.getCurrentRenderTarget(positionVariable).texture;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      compute.dispose();
    },
  };
}

function fill(texture: DataTexture) {
  const data = texture.image.data as unknown as Float32Array;
  for (let index = 0; index < data.length; index += 4) {
    data[index] = Math.random();
    data[index + 1] = Math.random();
    data[index + 2] = Math.random();
    data[index + 3] = Math.random();
  }
}
