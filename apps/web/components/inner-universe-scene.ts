import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  TorusKnotGeometry,
  Vector3,
  WebGLRenderer,
  type BufferGeometry as Geometry,
} from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

import { createCinematicComposer, createThoughtFlow } from './universe-cinema';

/**
 * "The inner universe": a fixed WebGL backdrop for the home page. Thoughts
 * are stars, emotions are nebulae, ideas are glass forms drifting past, and
 * neural constellations draw themselves as the visitor scrolls deeper. The
 * journey ends at a luminous ringed sphere, the self.
 */

export type InnerUniverse = {
  setProgress(value: number): void;
  setVelocity(value: number): void;
  setPointer(x: number, y: number): void;
  start(): void;
  stop(): void;
  destroy(): void;
};

const DEPTH = 320;

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function createStars(count: number, pixelRatio: number, colors: string[]) {
  const positions = new Float32Array(count * 3);
  const colorsAttr = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const palette = colors.map((hex) => new Color(hex));
  for (let index = 0; index < count; index++) {
    // A long tunnel around the camera path, denser near the edges.
    const radius = 6 + Math.pow(Math.random(), 0.6) * 70;
    const angle = Math.random() * Math.PI * 2;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = Math.sin(angle) * radius * 0.7;
    positions[index * 3 + 2] = rand(-DEPTH - 40, 30);
    const color = palette[Math.floor(Math.random() * palette.length)]!;
    colorsAttr[index * 3] = color.r;
    colorsAttr[index * 3 + 1] = color.g;
    colorsAttr[index * 3 + 2] = color.b;
    seeds[index] = Math.random();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colorsAttr, 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uWarp: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uWarp;
      attribute float aSeed;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float depth = -mv.z;
        float twinkle = 0.55 + 0.45 * sin(uTime * (0.6 + aSeed * 2.0) + aSeed * 80.0);
        gl_PointSize = (1.4 + aSeed * 3.2) * uPixelRatio * (90.0 / max(depth, 1.0)) * (1.0 + uWarp * 1.5);
        gl_PointSize = clamp(gl_PointSize, 0.0, 26.0 * uPixelRatio);
        vColor = color;
        vAlpha = twinkle * smoothstep(260.0, 20.0, depth) * smoothstep(0.5, 4.0, depth);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float core = smoothstep(0.5, 0.0, d);
        float glow = pow(core, 2.5);
        gl_FragColor = vec4(vColor * (glow + core * 0.25), (glow + core * 0.2) * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  return new Points(geometry, material);
}

/** Soft emotional nebula: domain-warped fbm on a large camera-facing plane. */
function createNebula(colorA: string, colorB: string, seed: number) {
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new Color(colorA) },
      uColorB: { value: new Color(colorB) },
      uSeed: { value: seed },
      uOpacity: { value: 0.75 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      uniform float uSeed;
      uniform float uOpacity;
      varying vec2 vUv;
      float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }
      float fbm(vec2 p) { float v = 0.0; float a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 1.7; a *= 0.5; } return v; }
      void main() {
        vec2 p = (vUv - 0.5) * 3.0 + uSeed;
        float t = uTime * 0.015;
        vec2 q = vec2(fbm(p + t), fbm(p - t + 5.2));
        float n = fbm(p + 2.2 * q);
        float mask = smoothstep(0.75, 0.05, length(vUv - 0.5) * 1.6);
        float cloud = smoothstep(0.35, 0.95, n) * mask;
        vec3 color = mix(uColorA, uColorB, smoothstep(0.3, 0.8, q.x));
        float filaments = smoothstep(0.62, 0.66, n) - smoothstep(0.66, 0.72, n);
        color += vec3(1.0) * filaments * 0.25;
        gl_FragColor = vec4(color * cloud, cloud * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    side: DoubleSide,
  });
  return new Mesh(new PlaneGeometry(120, 80), material);
}

/** Glass thought-form: fresnel rim, iridescent tint and a moving highlight. */
function createGlassMaterial(tint: string) {
  return new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uTint: { value: new Color(tint) } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vDepth;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vDepth = -mv.z;
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uTint;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vDepth;
      void main() {
        float facing = clamp(dot(vNormal, vView), 0.0, 1.0);
        float rim = pow(1.0 - facing, 2.6);
        vec3 iris = 0.5 + 0.5 * cos(6.2831 * (rim * 0.6 + vec3(0.0, 0.33, 0.67) + uTime * 0.05));
        vec3 light = normalize(vec3(-0.4, 0.8, 0.5));
        float spec = pow(max(dot(reflect(-light, vNormal), vView), 0.0), 40.0);
        vec3 color = uTint * (0.18 + rim * 1.2) + iris * rim * 0.35 + vec3(1.0) * spec;
        float haze = smoothstep(120.0, 28.0, vDepth);
        gl_FragColor = vec4(color, clamp(0.12 + rim * 0.9 + spec, 0.0, 1.0) * haze);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
}

/** Neural constellations that draw themselves as the journey progresses. */
function createConstellations() {
  const segments: number[] = [];
  for (let cluster = 0; cluster < 7; cluster++) {
    const z = -30 - cluster * 42;
    const side = cluster % 2 ? 1 : -1;
    const cx = side * rand(9, 18);
    const cy = rand(-7, 7);
    const nodes = Array.from({ length: 7 }, () => [
      cx + rand(-6, 6),
      cy + rand(-5, 5),
      z + rand(-6, 6),
    ]);
    for (let index = 1; index < nodes.length; index++) {
      const from = nodes[index - 1]!;
      const to = nodes[index]!;
      segments.push(...from, ...to);
      if (index > 2 && Math.random() > 0.5)
        segments.push(...nodes[index - 2]!, ...to);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(segments), 3),
  );
  const material = new LineBasicMaterial({
    color: new Color('#8bdeef'),
    transparent: true,
    opacity: 0.32,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const lines = new LineSegments(geometry, material);
  // Bright stars sit on every node so the lines read as constellations.
  const nodeMaterial = new ShaderMaterial({
    vertexShader: /* glsl */ `
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = clamp(260.0 / max(-mv.z, 1.0), 2.0, 22.0);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float glow = pow(smoothstep(0.5, 0.0, d), 2.2);
        gl_FragColor = vec4(vec3(0.75, 0.95, 1.0) * glow, glow);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const nodes = new Points(geometry, nodeMaterial);
  lines.add(nodes);
  return { lines, vertexCount: segments.length / 3 };
}

/** Long glowing axons along the tunnel walls, carrying pulses inward. */
function createAxons(count: number) {
  const perAxon = 420;
  const positions = new Float32Array(count * perAxon * 3);
  const along = new Float32Array(count * perAxon);
  const seeds = new Float32Array(count * perAxon);
  for (let axon = 0; axon < count; axon++) {
    const angle = (axon / count) * Math.PI * 2 + rand(-0.2, 0.2);
    const radius = rand(11, 20);
    const points = Array.from({ length: 7 }, (_, step) => {
      const wobble = angle + Math.sin(step * 1.3 + axon) * 0.35;
      const r = radius + Math.sin(step * 0.9 + axon * 2) * 3;
      return new Vector3(
        Math.cos(wobble) * r,
        Math.sin(wobble) * r * 0.7,
        20 - step * 58,
      );
    });
    const curve = new CatmullRomCurve3(points);
    const seed = Math.random();
    for (let index = 0; index < perAxon; index++) {
      const t = index / (perAxon - 1);
      const point = curve.getPoint(t);
      const offset = axon * perAxon + index;
      positions.set([point.x, point.y, point.z], offset * 3);
      along[offset] = t;
      seeds[offset] = seed;
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aAlong', new BufferAttribute(along, 1));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  const material = new ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      attribute float aAlong;
      attribute float aSeed;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float depth = -mv.z;
        // Pulses travel down each axon at its own pace.
        float pulse = smoothstep(0.9, 1.0, sin(aAlong * 90.0 - uTime * (2.0 + aSeed * 2.0) + aSeed * 40.0));
        gl_PointSize = clamp((1.2 + pulse * 3.5) * (110.0 / max(depth, 1.0)), 0.0, 18.0);
        vAlpha = (0.12 + pulse * 0.9) * smoothstep(220.0, 15.0, depth) * smoothstep(1.0, 6.0, depth);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float glow = pow(smoothstep(0.5, 0.0, d), 2.0);
        gl_FragColor = vec4(vec3(0.55, 0.9, 1.0) * glow, glow * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  return new Points(geometry, material);
}

/** The destination: a luminous ringed sphere, the self. */
/**
 * Iridescent crystal rock: a faceted, noise-carved icosphere with a thin-film
 * shader (pearl, cyan and gold interference colours shifting with angle).
 */
function createCrystal(radius: number, warmth: number) {
  // Merged vertices give smooth, pebble-like normals with soft facets.
  const base = mergeVertices(new IcosahedronGeometry(radius, 4));
  const position = base.getAttribute('position');
  const vertex = new Vector3();
  const seed = Math.random() * 100;
  // Carve each vertex by layered noise so every rock has its own silhouette.
  for (let index = 0; index < position.count; index++) {
    vertex.fromBufferAttribute(position, index);
    const n = vertex.clone().normalize();
    const scale =
      1 +
      Math.sin(n.x * 3.1 + seed) * 0.16 +
      Math.sin(n.y * 5.3 + seed * 1.7) * 0.1 +
      Math.sin(n.z * 7.9 + seed * 0.6) * 0.06 +
      Math.sin((n.x + n.z) * 13.0 + seed) * 0.025;
    vertex.multiplyScalar(scale);
    // Slightly flattened, like a shard of rock.
    position.setXYZ(index, vertex.x * 1.15, vertex.y * 0.8, vertex.z);
  }
  base.computeVertexNormals();
  const material = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uWarmth: { value: warmth } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vWorld;
      varying float vDepth;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vec4 mv = viewMatrix * world;
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        vWorld = world.xyz;
        vDepth = -mv.z;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uWarmth;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vWorld;
      varying float vDepth;
      void main() {
        float facing = clamp(dot(vNormal, vView), 0.0, 1.0);
        float fresnel = pow(1.0 - facing, 2.2);
        // Thin-film interference: colour cycles with viewing angle and time.
        float film = facing * 3.2 + dot(vNormal, vec3(0.3, 0.6, 0.2)) * 1.5 + uTime * 0.08;
        // Pearl-like pastel interference (cyan, lilac, rose, soft gold).
        vec3 iris = 0.62 + 0.38 * cos(6.2831 * (film + vec3(0.0, 0.12, 0.3)));
        vec3 gold = vec3(1.0, 0.82, 0.5);
        vec3 pearl = vec3(0.92, 0.97, 1.0);
        vec3 cyan = vec3(0.45, 0.88, 0.98);
        vec3 body = mix(vec3(0.06, 0.13, 0.22), mix(cyan, gold, uWarmth) * 0.3, 0.55);
        vec3 light = normalize(vec3(-0.4, 0.8, 0.45));
        float spec = pow(max(dot(reflect(-light, vNormal), vView), 0.0), 26.0);
        float glint = pow(max(dot(reflect(-normalize(vec3(0.6, -0.2, 0.7)), vNormal), vView), 0.0), 60.0);
        vec3 color = body + iris * (0.28 + fresnel * 1.0) * mix(pearl, gold, uWarmth * 0.55);
        color += pearl * spec * 1.1 + gold * glint * 0.9 + pearl * fresnel * 0.35;
        // Cosmic haze: distant rocks dissolve into the night.
        color = mix(vec3(0.03, 0.11, 0.2), color, smoothstep(120.0, 28.0, vDepth));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  const mesh = new Mesh(base, material);
  mesh.userData.spin = new Vector3(
    rand(-0.4, 0.4),
    rand(0.2, 0.6),
    rand(-0.3, 0.3),
  );
  mesh.userData.float = rand(0, Math.PI * 2);
  return mesh;
}

function createSelf() {
  const group = new Group();
  const body = new Mesh(
    new SphereGeometry(9, 64, 64),
    new ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vView;
        varying vec3 vPos;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vNormal = normalize(normalMatrix * normal);
          vView = normalize(-mv.xyz);
          vPos = position;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vView;
        varying vec3 vPos;
        void main() {
          float facing = clamp(dot(vNormal, vView), 0.0, 1.0);
          float rim = pow(1.0 - facing, 2.0);
          float bands = 0.5 + 0.5 * sin(vPos.y * 1.4 + sin(vPos.x * 0.6 + uTime * 0.2) * 1.5);
          vec3 deep = vec3(0.02, 0.1, 0.2);
          vec3 cyan = vec3(0.35, 0.8, 0.95);
          vec3 color = mix(deep, cyan * 0.45, bands * 0.6) + cyan * rim * 1.3;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
    }),
  );
  const ring = new Mesh(
    new RingGeometry(12, 19, 128),
    new ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        varying vec3 vPos;
        void main() { vUv = uv; vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vPos;
        void main() {
          float r = length(vPos.xy);
          float t = (r - 12.0) / 7.0;
          float lanes = 0.5 + 0.5 * sin(t * 60.0) * sin(t * 13.0 + 1.0);
          float fade = smoothstep(0.0, 0.15, t) * smoothstep(1.0, 0.7, t);
          vec3 color = mix(vec3(0.55, 0.87, 0.94), vec3(0.85, 0.8, 1.0), t);
          float a = fade * (0.25 + lanes * 0.45);
          gl_FragColor = vec4(color * a, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: DoubleSide,
      blending: AdditiveBlending,
    }),
  );
  ring.rotation.x = Math.PI / 2.4;
  ring.rotation.y = 0.3;
  group.add(body, ring);
  return { group, body, ring };
}

/** Per-page personality of the universe backdrop. */
export type UniverseTheme = {
  clear: string;
  starCount: number;
  starPalette: string[];
  moods: Array<[string, string]>;
  nebulaOpacity: number;
  crystals: number;
  crystalWarmth: number;
  thoughts: boolean;
  axons: number;
  constellations: boolean;
  self: boolean;
  orbs: number;
  orbColors: [string, string];
  camera: 'flight' | 'orbit' | 'dive' | 'rise';
};

const cool = ['#ffffff', '#bff3ff', '#8bdeef', '#b8b2ff', '#9fe7d6'];
const warm = ['#ffffff', '#fff1d6', '#f3d48f', '#ffd6b0', '#e8eef3'];

export const universeThemes = {
  // Home: the full cosmic flight toward the self.
  home: {
    clear: '#081d33',
    starCount: 1,
    starPalette: [...cool, '#ffe2b8'],
    moods: [
      ['#0d6e8c', '#3fb8a9'],
      ['#4b3fa8', '#159bc2'],
      ['#0b4f8a', '#8bdeef'],
      ['#8a5a32', '#d09a62'],
      ['#2f6b67', '#8bdeef'],
      ['#5b3f9a', '#3fb8a9'],
    ],
    nebulaOpacity: 0.75,
    crystals: 14,
    crystalWarmth: 0.3,
    thoughts: true,
    axons: 12,
    constellations: true,
    self: true,
    orbs: 0,
    orbColors: ['#8bdeef', '#ffffff'],
    camera: 'flight',
  },
  // About: warm gold and pearl, a slow orbit through human constellations.
  about: {
    clear: '#13183a',
    starCount: 0.8,
    starPalette: warm,
    moods: [
      ['#8a5a32', '#f3d48f'],
      ['#5b3f9a', '#c9a0dc'],
      ['#7a4a6a', '#f3b48f'],
      ['#3b3f8a', '#f3d48f'],
    ],
    nebulaOpacity: 0.7,
    crystals: 12,
    crystalWarmth: 0.8,
    thoughts: false,
    axons: 0,
    constellations: true,
    self: false,
    orbs: 60,
    orbColors: ['#f3d48f', '#fff4d6'],
    camera: 'orbit',
  },
  // Consultations: a calm ocean of the mind with rising bubbles.
  consultations: {
    clear: '#052a38',
    starCount: 0.45,
    starPalette: ['#ffffff', '#bff3ff', '#8bdeef', '#9fe7d6'],
    moods: [
      ['#0d6e8c', '#3fd0c4'],
      ['#0b4f6a', '#8bdeef'],
      ['#0f5c5c', '#5fd0c0'],
    ],
    nebulaOpacity: 0.65,
    crystals: 5,
    crystalWarmth: 0.05,
    thoughts: false,
    axons: 0,
    constellations: false,
    self: false,
    orbs: 140,
    orbColors: ['#8bdeef', '#d6fbff'],
    camera: 'dive',
  },
  // Contact: dawn sky, lanterns rising toward the conversation.
  contact: {
    clear: '#1c1f45',
    starCount: 0.5,
    starPalette: ['#ffffff', '#ffd6e6', '#f3d48f', '#d9c8ff'],
    moods: [
      ['#7a3f6a', '#f3a6c0'],
      ['#5b3f9a', '#c9b8ff'],
      ['#8a5a32', '#ffd29a'],
    ],
    nebulaOpacity: 0.7,
    crystals: 6,
    crystalWarmth: 0.6,
    thoughts: false,
    axons: 0,
    constellations: false,
    self: false,
    orbs: 90,
    orbColors: ['#ffd29a', '#fff1d6'],
    camera: 'rise',
  },
  // Programmes: a library of light, streams of knowledge.
  programmes: {
    clear: '#061a30',
    starCount: 0.9,
    starPalette: cool,
    moods: [
      ['#0b4f8a', '#8bdeef'],
      ['#0d6e8c', '#3fb8a9'],
      ['#3b3f9a', '#8bdeef'],
    ],
    nebulaOpacity: 0.6,
    crystals: 10,
    crystalWarmth: 0.1,
    thoughts: true,
    axons: 22,
    constellations: true,
    self: false,
    orbs: 0,
    orbColors: ['#8bdeef', '#ffffff'],
    camera: 'flight',
  },
  // Psychology school: deep teal neural space.
  psychology: {
    clear: '#06262e',
    starCount: 0.8,
    starPalette: ['#ffffff', '#bff3ff', '#9fe7d6', '#5fd0c0'],
    moods: [
      ['#0f5c5c', '#5fd0c0'],
      ['#0d6e8c', '#3fb8a9'],
      ['#2f6b67', '#8bdeef'],
    ],
    nebulaOpacity: 0.7,
    crystals: 6,
    crystalWarmth: 0.1,
    thoughts: false,
    axons: 20,
    constellations: true,
    self: false,
    orbs: 40,
    orbColors: ['#5fd0c0', '#d6fbff'],
    camera: 'dive',
  },
  // Languages school: indigo night with drifting lights like words.
  languages: {
    clear: '#0e1640',
    starCount: 1,
    starPalette: ['#ffffff', '#c9d8ff', '#8fb6ec', '#d9c8ff'],
    moods: [
      ['#3b3f9a', '#8fb6ec'],
      ['#5b3f9a', '#c9b8ff'],
      ['#0b4f8a', '#8bdeef'],
    ],
    nebulaOpacity: 0.7,
    crystals: 8,
    crystalWarmth: 0.15,
    thoughts: true,
    axons: 0,
    constellations: true,
    self: false,
    orbs: 110,
    orbColors: ['#8fb6ec', '#ffffff'],
    camera: 'orbit',
  },
  // Training school: bronze and gold, sparks rising.
  training: {
    clear: '#1d1a2e',
    starCount: 0.7,
    starPalette: warm,
    moods: [
      ['#8a5a32', '#e0b07a'],
      ['#5a3a22', '#f3d48f'],
      ['#3b3f6a', '#e0b07a'],
    ],
    nebulaOpacity: 0.65,
    crystals: 14,
    crystalWarmth: 0.9,
    thoughts: false,
    axons: 0,
    constellations: false,
    self: false,
    orbs: 120,
    orbColors: ['#f3b46a', '#fff1d6'],
    camera: 'rise',
  },
  // Workshop: warm amber dusk with lanterns of support.
  workshop: {
    clear: '#21182c',
    starCount: 0.5,
    starPalette: warm,
    moods: [
      ['#8a4a32', '#ffb27a'],
      ['#7a3f5a', '#f3a6c0'],
      ['#8a5a32', '#f3d48f'],
    ],
    nebulaOpacity: 0.6,
    crystals: 6,
    crystalWarmth: 0.85,
    thoughts: false,
    axons: 0,
    constellations: false,
    self: false,
    orbs: 120,
    orbColors: ['#ffc27a', '#fff4d6'],
    camera: 'rise',
  },
} satisfies Record<string, UniverseTheme>;

export type UniverseThemeName = keyof typeof universeThemes;

/** Soft glowing orbs (bubbles, lanterns, fireflies) that rise and sway. */
function createOrbs(
  count: number,
  colors: [string, string],
  pixelRatio: number,
) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let index = 0; index < count; index++) {
    positions.set([rand(-40, 40), rand(-30, 30), rand(-DEPTH, 10)], index * 3);
    seeds[index] = Math.random();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: pixelRatio },
      uColorA: { value: new Color(colors[0]) },
      uColorB: { value: new Color(colors[1]) },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSeed;
      varying float vSeed;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        // Rise slowly and loop, swaying like a lantern in still air.
        p.y = mod(p.y + uTime * (0.6 + aSeed * 1.4) + 30.0, 60.0) - 30.0;
        p.x += sin(uTime * 0.4 + aSeed * 30.0) * 1.2;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float depth = -mv.z;
        gl_PointSize = clamp((10.0 + aSeed * 26.0) * uPixelRatio * (24.0 / max(depth, 1.0)), 0.0, 90.0 * uPixelRatio);
        vSeed = aSeed;
        vAlpha = smoothstep(200.0, 20.0, depth) * smoothstep(1.0, 6.0, depth)
          * (0.55 + 0.45 * sin(uTime * (0.5 + aSeed) + aSeed * 50.0));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vSeed;
      varying float vAlpha;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        float body = smoothstep(0.5, 0.05, d);
        float rim = smoothstep(0.5, 0.42, d) - smoothstep(0.42, 0.3, d);
        float glint = smoothstep(0.12, 0.0, length(c - vec2(-0.14, -0.14)));
        vec3 color = mix(uColorA, uColorB, vSeed);
        float a = (body * 0.35 + rim * 0.5 + glint * 0.8) * vAlpha;
        gl_FragColor = vec4(color * a, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  return new Points(geometry, material);
}

export function createInnerUniverse(
  canvas: HTMLCanvasElement,
  options: { mobile: boolean; theme?: UniverseTheme },
): InnerUniverse | null {
  const theme: UniverseTheme = options.theme ?? universeThemes.home;
  const scaleCount = (n: number) => Math.round(options.mobile ? n * 0.5 : n);
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: false,
      antialias: !options.mobile,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }
  // Large or high-density screens cost the most: cap the density by area.
  const screenArea = window.innerWidth * window.innerHeight;
  let pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    options.mobile ? 1.25 : screenArea > 2_400_000 ? 1.25 : 1.6,
  );
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(new Color(theme.clear), 1);

  const scene = new Scene();
  const camera = new PerspectiveCamera(62, 1, 0.1, 500);

  const stars = createStars(
    Math.round((options.mobile ? 3200 : 7500) * theme.starCount),
    pixelRatio,
    theme.starPalette,
  );
  scene.add(stars);

  // Emotions along the journey, coloured per page.
  const moods = theme.moods;
  const nebulae = moods.map(([a, b], index) => {
    const nebula = createNebula(a, b, index * 3.7);
    (nebula.material as ShaderMaterial).uniforms.uOpacity!.value =
      theme.nebulaOpacity;
    const side = index % 2 ? 1 : -1;
    nebula.position.set(
      side * rand(18, 34),
      rand(-10, 10),
      -40 - index * (DEPTH / Math.max(1, moods.length)),
    );
    nebula.rotation.z = rand(-0.6, 0.6);
    scene.add(nebula);
    return nebula;
  });

  const shapes: Array<{ geometry: Geometry; tint: string }> = [
    { geometry: new IcosahedronGeometry(2.4, 1), tint: '#8bdeef' },
    { geometry: new TorusKnotGeometry(1.6, 0.5, 160, 24), tint: '#b8b2ff' },
    { geometry: new OctahedronGeometry(2.2, 0), tint: '#3fb8a9' },
    { geometry: new IcosahedronGeometry(1.8, 0), tint: '#d09a62' },
    {
      geometry: new TorusKnotGeometry(1.3, 0.42, 160, 24, 3, 4),
      tint: '#5b8fd6',
    },
    { geometry: new OctahedronGeometry(1.7, 1), tint: '#8bdeef' },
  ];
  const thoughtShapes = theme.thoughts
    ? options.mobile
      ? shapes.slice(0, 4)
      : shapes
    : [];
  const thoughts = thoughtShapes.map((shape, index) => {
    const mesh = new Mesh(shape.geometry, createGlassMaterial(shape.tint));
    const side = index % 2 ? -1 : 1;
    mesh.position.set(side * rand(7, 13), rand(-5, 5), -22 - index * 46);
    mesh.userData.spin = rand(0.15, 0.4);
    mesh.userData.float = rand(0, Math.PI * 2);
    scene.add(mesh);
    return mesh;
  });

  const axons = createAxons(Math.max(1, scaleCount(theme.axons)));
  axons.visible = theme.axons > 0;
  scene.add(axons);

  const orbs = createOrbs(
    Math.max(1, scaleCount(theme.orbs)),
    theme.orbColors,
    pixelRatio,
  );
  orbs.visible = theme.orbs > 0;
  scene.add(orbs);

  const { lines, vertexCount } = createConstellations();
  lines.visible = theme.constellations;
  scene.add(lines);

  // Iridescent crystal rocks drifting along the journey, framing the path.
  const crystals = Array.from(
    { length: scaleCount(theme.crystals) },
    (_, index) => {
      const crystal = createCrystal(
        rand(1.2, 3.6),
        Math.min(1, Math.max(0, theme.crystalWarmth + rand(-0.25, 0.25))),
      );
      const side = index % 2 ? 1 : -1;
      crystal.position.set(
        side * rand(9, 22),
        rand(-9, 9),
        -10 -
          index * (DEPTH / Math.max(1, scaleCount(theme.crystals))) -
          rand(0, 10),
      );
      crystal.rotation.set(rand(0, 6), rand(0, 6), rand(0, 6));
      scene.add(crystal);
      return crystal;
    },
  );

  const self = createSelf();
  self.group.position.set(0, -2, -DEPTH - 20);
  self.group.visible = theme.self;
  scene.add(self.group);

  // Cinematic layer (desktop): bloom + lens, and a GPU "stream of thoughts".
  const cinema = options.mobile
    ? null
    : createCinematicComposer(renderer, scene, camera);
  const flow = options.mobile
    ? null
    : createThoughtFlow(renderer, 128, [
        theme.moods[0]?.[1] ?? '#8bdeef',
        theme.orbColors[1],
      ]);
  if (flow) scene.add(flow.points);
  let lastTime = 0;

  let width = 1;
  let height = 1;
  // Portrait screens see a narrow slice of space; widen the lens for them.
  let baseFov = 62;
  const resize = () => {
    const nextWidth = Math.max(1, window.innerWidth);
    const nextHeight = Math.max(1, window.innerHeight);
    // Phone address bars change the height while scrolling: ignore those
    // small jumps so the universe does not stutter.
    if (
      options.mobile &&
      nextWidth === width &&
      Math.abs(nextHeight - height) < 160
    ) {
      return;
    }
    width = nextWidth;
    height = nextHeight;
    renderer.setSize(width, height, false);
    cinema?.setSize(width, height, pixelRatio);
    camera.aspect = width / height;
    baseFov = camera.aspect < 0.75 ? 76 : camera.aspect < 1.15 ? 69 : 62;
    camera.updateProjectionMatrix();
  };
  // Adaptive quality: if frames run slow for a while, lower the density.
  let slowFrames = 0;
  let sampledFrames = 0;
  const adaptQuality = (delta: number) => {
    if (pixelRatio <= 0.85) return;
    sampledFrames++;
    if (delta > 0.034) slowFrames++;
    if (sampledFrames < 90) return;
    if (slowFrames > 45) {
      pixelRatio = Math.max(0.85, pixelRatio - 0.25);
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
      cinema?.setSize(width, height, pixelRatio);
    }
    slowFrames = 0;
    sampledFrames = 0;
  };
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let progress = 0;
  let eased = 0;
  let velocity = 0;
  let warp = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let raf = 0;
  let running = false;
  const startedAt = performance.now();

  const render = (now: number) => {
    raf = 0;
    if (!running) return;
    const time = (now - startedAt) / 1000;
    eased += (progress - eased) * 0.06;
    warp += (Math.min(1, Math.abs(velocity) / 60) - warp) * 0.08;
    pointer.x += (pointer.tx - pointer.x) * 0.04;
    pointer.y += (pointer.ty - pointer.y) * 0.04;

    // Each page moves through its own universe differently.
    if (theme.camera === 'orbit') {
      // Circle slowly around the heart of the scene.
      const angle = eased * Math.PI * 1.6 + time * 0.015;
      const centre = -DEPTH * 0.45;
      camera.position.set(
        Math.sin(angle) * 70 + pointer.x * 3,
        Math.sin(eased * 3) * 6 - pointer.y * 2,
        centre + Math.cos(angle) * 70,
      );
      camera.lookAt(0, 0, centre);
    } else if (theme.camera === 'dive') {
      // Sink gently, as if into calm deep water.
      camera.position.set(
        pointer.x * 2 + Math.sin(time * 0.15) * 1.5,
        10 - eased * 40 - pointer.y * 1.5,
        12 - eased * DEPTH * 0.55,
      );
      camera.rotation.set(
        -0.08 + Math.sin(time * 0.2) * 0.01,
        0,
        Math.sin(time * 0.12) * 0.02,
      );
    } else if (theme.camera === 'rise') {
      // Ascend toward the light while drifting forward.
      camera.position.set(
        pointer.x * 2.5 + Math.sin(eased * 4) * 2,
        -12 + eased * 40 - pointer.y * 1.5,
        12 - eased * DEPTH * 0.6,
      );
      camera.rotation.set(0.1, 0, Math.sin(time * 0.1) * 0.02);
    } else {
      // Fly inward along the path; drift a little so it never stalls.
      camera.position.z = 12 - eased * DEPTH + Math.sin(time * 0.1) * 1.5;
      camera.position.x = pointer.x * 2.5 + Math.sin(eased * 6) * 3;
      camera.position.y = -pointer.y * 1.6 + Math.cos(eased * 5) * 2;
      camera.rotation.set(0, 0, Math.sin(eased * 4) * 0.06 + pointer.x * -0.03);
    }
    camera.fov = baseFov + warp * 14;
    camera.updateProjectionMatrix();

    const starUniforms = (stars.material as ShaderMaterial).uniforms;
    starUniforms.uTime!.value = time;
    starUniforms.uWarp!.value = warp;
    for (const nebula of nebulae) {
      (nebula.material as ShaderMaterial).uniforms.uTime!.value = time;
      nebula.rotation.z += 0.0004;
    }
    for (const crystal of crystals) {
      (crystal.material as ShaderMaterial).uniforms.uTime!.value = time;
      const spin = crystal.userData.spin as Vector3;
      crystal.rotation.x += spin.x * 0.002;
      crystal.rotation.y += spin.y * 0.002;
      crystal.rotation.z += spin.z * 0.002;
      crystal.position.y +=
        Math.sin(time * 0.4 + crystal.userData.float) * 0.003;
    }
    for (const thought of thoughts) {
      (thought.material as ShaderMaterial).uniforms.uTime!.value = time;
      thought.rotation.x += 0.003 * thought.userData.spin;
      thought.rotation.y += 0.006 * thought.userData.spin;
      thought.position.y +=
        Math.sin(time * 0.6 + thought.userData.float) * 0.004;
    }
    (axons.material as ShaderMaterial).uniforms.uTime!.value = time;
    (orbs.material as ShaderMaterial).uniforms.uTime!.value = time;
    lines.geometry.setDrawRange(
      0,
      Math.floor(vertexCount * Math.min(1, eased * 1.15)),
    );
    (self.body.material as ShaderMaterial).uniforms.uTime!.value = time;
    self.group.rotation.y = time * 0.05;

    if (flow) {
      // The stream of thoughts travels just ahead of the camera.
      flow.points.position.set(
        camera.position.x * 0.6,
        camera.position.y * 0.6,
        camera.position.z - 48,
      );
      flow.points.rotation.y = time * 0.02;
      flow.update(time, lastTime ? time - lastTime : 0.016);
    }
    if (lastTime) adaptQuality(time - lastTime);
    lastTime = time;

    if (cinema) cinema.render(time);
    else renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  };

  return {
    setProgress(value) {
      progress = value;
    },
    setVelocity(value) {
      velocity = value;
    },
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(render);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      flow?.dispose();
      cinema?.dispose();
      scene.traverse((object) => {
        if (
          object instanceof Mesh ||
          object instanceof Points ||
          object instanceof LineSegments
        ) {
          object.geometry.dispose();
          (object.material as ShaderMaterial).dispose();
        }
      });
      renderer.dispose();
    },
  };
}
