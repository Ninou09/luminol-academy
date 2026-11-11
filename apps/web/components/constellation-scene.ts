import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  IcosahedronGeometry,
  Mesh,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from 'three';

/**
 * "Three schools, one light": a luminous core that releases three glass
 * spheres onto their orbits as the visitor scrolls. Loaded lazily, only when
 * the section approaches the viewport.
 */

export type ConstellationScene = {
  /** Scroll story progress, 0 → 1. */
  setProgress(value: number): void;
  setPointer(x: number, y: number): void;
  /** Screen positions (px, relative to the canvas) of the three spheres. */
  getAnchors(): Array<{ x: number; y: number; visible: number }>;
  start(): void;
  stop(): void;
  destroy(): void;
};

const noiseChunk = /* glsl */ `
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
`;

/** Living core: noise-displaced icosphere with a hot centre and cool rim. */
function createCore() {
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uEnergy: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uEnergy;
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vNoise;
      ${noiseChunk}
      void main() {
        // Low-frequency, layered noise: a liquid surface, not a spiky blob.
        float n = snoise(normal * 0.9 + uTime * 0.22) * 0.7
          + snoise(normal * 2.1 - uTime * 0.31) * 0.3;
        vNoise = n;
        vec3 displaced = position + normal * n * (0.045 + uEnergy * 0.045);
        vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      varying float vNoise;
      void main() {
        float facing = clamp(dot(vNormal, vView), 0.0, 1.0);
        float rim = pow(1.0 - facing, 3.0);
        vec3 hot = vec3(0.82, 0.97, 1.0);
        vec3 cyan = vec3(0.25, 0.75, 0.9);
        vec3 deep = vec3(0.01, 0.12, 0.22);
        // Dark glassy body, glowing veins of light and a luminous rim.
        float veins = smoothstep(0.05, 0.55, abs(vNoise));
        vec3 color = mix(deep, cyan * 0.55, veins);
        color += hot * pow(facing, 6.0) * 0.55;
        color += cyan * rim * 1.6 + hot * pow(rim, 3.0) * 0.6;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  });
  return new Mesh(new IcosahedronGeometry(1, 48), material);
}

/** Additive halo sprite drawn as a camera-facing sphere shell. */
function createHalo(color: Color, size: number, strength: number) {
  const material = new ShaderMaterial({
    uniforms: {
      uColor: { value: color },
      uStrength: { value: strength },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uStrength;
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        float facing = clamp(dot(vNormal, vView), 0.0, 1.0);
        float glow = pow(facing, 2.8) * uStrength;
        gl_FragColor = vec4(uColor * glow, glow);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const mesh = new Mesh(new SphereGeometry(size, 32, 32), material);
  mesh.renderOrder = 2;
  return mesh;
}

/** Glass school sphere: fresnel rim, tinted body, moving inner caustic. */
function createGlassSphere(tint: Color) {
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTint: { value: tint },
      uOpacity: { value: 0 },
    },
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
      uniform vec3 uTint;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vView;
      varying vec3 vPos;
      ${noiseChunk}
      void main() {
        float facing = clamp(dot(vNormal, vView), 0.0, 1.0);
        float rim = pow(1.0 - facing, 3.0);
        float caustic = snoise(vPos * 2.4 + vec3(0.0, uTime * 0.4, uTime * 0.2));
        caustic = smoothstep(0.35, 0.9, caustic);
        vec3 light = normalize(vec3(-0.5, 0.8, 0.6));
        float spec = pow(max(dot(reflect(-light, vNormal), vView), 0.0), 48.0);
        vec3 color = uTint * (0.25 + caustic * 0.9) + vec3(0.9, 0.98, 1.0) * (rim * 1.2 + spec * 1.5);
        float alpha = clamp(0.18 + rim * 0.85 + caustic * 0.35 + spec, 0.0, 1.0);
        gl_FragColor = vec4(color, alpha * uOpacity);
      }
    `,
    transparent: true,
    depthWrite: false,
  });
  return new Mesh(new SphereGeometry(0.42, 64, 64), material);
}

/** Orbiting dust ring with soft round points. */
function createRing(count: number) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let index = 0; index < count; index++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 2.1 + Math.pow(Math.random(), 1.6) * 2.6;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = (Math.random() - 0.5) * 0.35 * (radius - 1.5);
    positions[index * 3 + 2] = Math.sin(angle) * radius;
    seeds[index] = Math.random();
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uReveal: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixelRatio;
      uniform float uReveal;
      attribute float aSeed;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        float r = length(p.xz);
        float spin = uTime * (0.18 / r) + aSeed * 0.2;
        float c = cos(spin);
        float s = sin(spin);
        p.xz = mat2(c, -s, s, c) * p.xz;
        p.y += sin(uTime * 0.6 + aSeed * 30.0) * 0.04;
        p *= mix(0.25, 1.0, uReveal);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (6.0 + aSeed * 14.0) * uPixelRatio / -mv.z;
        vAlpha = (0.35 + 0.65 * sin(uTime * (0.8 + aSeed) + aSeed * 50.0) * 0.5 + 0.5) * uReveal;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float glow = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vec3(0.6, 0.9, 1.0) * glow, glow * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  return new Points(geometry, material);
}

const smooth = (edge0: number, edge1: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

export function createConstellationScene(
  canvas: HTMLCanvasElement,
  options: { tints: [string, string, string]; mobile: boolean },
): ConstellationScene | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return null;
  }
  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    options.mobile ? 1.5 : 2,
  );
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0.6, 8.5);

  const world = new Group();
  scene.add(world);

  const core = createCore();
  core.scale.setScalar(0.75);
  world.add(core);
  const coreHalo = createHalo(new Color('#5fd4ef'), 2.4, 0.9);
  world.add(coreHalo);

  const ring = createRing(options.mobile ? 900 : 2200);
  (ring.material as ShaderMaterial).uniforms.uPixelRatio!.value =
    pixelRatio * 2.2;
  ring.rotation.x = 0.32;
  world.add(ring);

  const spheres = options.tints.map((tint, index) => {
    const color = new Color(tint);
    const group = new Group();
    const glass = createGlassSphere(color);
    const halo = createHalo(
      color.clone().lerp(new Color('#ffffff'), 0.25),
      0.95,
      0.75,
    );
    group.add(halo, glass);
    world.add(group);
    // Triangle orbit slots, evenly spaced, slightly tilted toward the viewer.
    const angle = (index / 3) * Math.PI * 2 + Math.PI / 2;
    return { group, glass, halo, angle };
  });

  let width = 1;
  let height = 1;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the whole orbit in frame on narrow portrait screens.
    camera.position.z =
      camera.aspect < 0.6
        ? 19
        : camera.aspect < 0.8
          ? 14
          : camera.aspect < 1.2
            ? 10.5
            : 8.5;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  let progress = 0;
  let eased = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let raf = 0;
  let running = false;
  const startedAt = performance.now();
  const anchorVector = new Vector3();
  let anchors = spheres.map(() => ({ x: 0, y: 0, visible: 0 }));

  const render = (now: number) => {
    raf = 0;
    if (!running) return;
    const time = (now - startedAt) / 1000;
    eased += (progress - eased) * 0.08;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    const emerge = smooth(0.12, 0.62, eased);
    const settle = smooth(0.55, 1, eased);

    (core.material as ShaderMaterial).uniforms.uTime!.value = time;
    (core.material as ShaderMaterial).uniforms.uEnergy!.value =
      1 - emerge * 0.6;
    core.rotation.y = time * 0.15;
    const breathe = 1 + Math.sin(time * 1.2) * 0.025;
    core.scale.setScalar((0.78 - emerge * 0.18) * breathe);
    coreHalo.scale.setScalar(1 + Math.sin(time * 1.2) * 0.04);

    const ringUniforms = (ring.material as ShaderMaterial).uniforms;
    ringUniforms.uTime!.value = time;
    ringUniforms.uReveal!.value = 0.35 + emerge * 0.65;

    const orbitRadius = 2.9 * emerge;
    const orbitSpin = time * 0.12 * (1 - settle * 0.6) + settle * 0.35;
    spheres.forEach((sphere, index) => {
      // Each sphere leaves the core slightly after the previous one.
      const own = smooth(0.12 + index * 0.08, 0.62 + index * 0.06, eased);
      const angle = sphere.angle + orbitSpin;
      const radius = orbitRadius * (0.6 + own * 0.4);
      sphere.group.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius * 0.58 +
          Math.sin(time * 0.9 + index * 2) * 0.08,
        Math.sin(angle) * 0.9,
      );
      sphere.group.scale.setScalar(0.2 + own * 0.8);
      const uniforms = (sphere.glass.material as ShaderMaterial).uniforms;
      uniforms.uTime!.value = time + index * 10;
      uniforms.uOpacity!.value = own;
      (sphere.halo.material as ShaderMaterial).uniforms.uStrength!.value =
        own * 0.75;
      sphere.glass.rotation.y = time * 0.3 + index;

      anchorVector.copy(sphere.group.position);
      world.localToWorld(anchorVector);
      anchorVector.project(camera);
      anchors[index] = {
        x: (anchorVector.x * 0.5 + 0.5) * width,
        y: (-anchorVector.y * 0.5 + 0.5) * height,
        visible: smooth(0.45 + index * 0.08, 0.7 + index * 0.06, eased),
      };
    });
    anchors = [...anchors];

    // The core rises from below the title into the centre as schools emerge.
    world.position.y =
      -1.25 * (1 - emerge) + (camera.aspect < 0.8 ? 1.6 * emerge : 0);
    world.rotation.y = pointer.x * 0.25 + settle * 0.15;
    world.rotation.x = -pointer.y * 0.15;
    camera.position.y = 0.6 - settle * 0.4;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(render);
  };

  return {
    setProgress(value) {
      progress = value;
    },
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    getAnchors() {
      return anchors;
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
      observer.disconnect();
      scene.traverse((object) => {
        if (object instanceof Mesh || object instanceof Points) {
          object.geometry.dispose();
          (object.material as ShaderMaterial).dispose();
        }
      });
      renderer.dispose();
    },
  };
}
