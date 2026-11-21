import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Group,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector3,
  WebGLRenderer,
} from 'three';

/**
 * A procedural brain made of light: thousands of neurons trace the cortex,
 * a sparse connectome links them, impulses race along the links, and glowing
 * nerve fibres descend from the brainstem. Scroll progress gathers scattered
 * stars into the brain, then lets it "think" ever more intensely.
 */

export type MindScene = {
  setProgress(value: number): void;
  setPointer(x: number, y: number): void;
  /** Screen anchors (px) for the three CBT labels: thoughts, feelings, actions. */
  getAnchors(): Array<{ x: number; y: number; visible: number }>;
  start(): void;
  stop(): void;
  destroy(): void;
};

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Gyri: cheap layered trigonometric ripples over the cortex. */
function folds(x: number, y: number, z: number) {
  return (
    Math.sin(x * 7.1 + Math.sin(z * 5.3)) * 0.5 +
    Math.sin(y * 8.3 + Math.cos(x * 4.7)) * 0.35 +
    Math.sin(z * 9.7 + Math.sin(y * 6.1)) * 0.25
  );
}

/** A point on the brain surface (or just under it), in model space. */
function samplePoint(): Vector3 {
  const region = Math.random();
  if (region < 0.86) {
    // Cerebrum: two hemispheres separated by the longitudinal fissure.
    const side = Math.random() < 0.5 ? -1 : 1;
    let x: number;
    let y: number;
    let z: number;
    do {
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(2 * Math.random() - 1);
      x = Math.abs(Math.sin(v) * Math.cos(u));
      y = Math.cos(v);
      z = Math.sin(v) * Math.sin(u);
    } while (y < -0.55 && Math.random() < 0.7); // flatter underside
    const ripple = 1 + folds(x, y, z) * 0.055;
    const depth = 0.94 + Math.random() * 0.06;
    return new Vector3(
      side * (0.08 + x * 0.88) * ripple * depth,
      y * 0.82 * ripple * depth + 0.08,
      z * 1.18 * ripple * depth,
    );
  }
  if (region < 0.96) {
    // Cerebellum, low at the back, finely striped.
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    const stripe = 1 + Math.sin(v * 24) * 0.03;
    return new Vector3(
      Math.sin(v) * Math.cos(u) * 0.62 * stripe,
      Math.cos(v) * 0.3 * stripe - 0.62,
      Math.sin(v) * Math.sin(u) * 0.38 * stripe - 0.78,
    );
  }
  // Brainstem.
  const t = Math.random();
  const angle = Math.random() * Math.PI * 2;
  const radius = 0.13 - t * 0.03;
  return new Vector3(
    Math.cos(angle) * radius,
    -0.45 - t * 0.85,
    Math.sin(angle) * radius - 0.35 - t * 0.12,
  );
}

export function createMindScene(
  canvas: HTMLCanvasElement,
  options: { mobile: boolean; compact?: boolean },
): MindScene | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true });
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
  const camera = new PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(0, 0.15, 6.2);
  const brain = new Group();
  scene.add(brain);

  // ---------- Neurons (cortex point cloud) ----------
  const count = options.mobile || options.compact ? 5200 : 11000;
  const targets = new Float32Array(count * 3);
  const starts = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const samples: Vector3[] = [];
  for (let index = 0; index < count; index++) {
    const point = samplePoint();
    samples.push(point);
    targets.set([point.x, point.y, point.z], index * 3);
    // Each neuron begins as a far-away star.
    const direction = new Vector3(
      Math.random() - 0.5,
      Math.random() - 0.5,
      Math.random() - 0.5,
    )
      .normalize()
      .multiplyScalar(4 + Math.random() * 7);
    starts.set([direction.x, direction.y, direction.z - 2], index * 3);
    seeds[index] = Math.random();
  }
  const neuronGeometry = new BufferGeometry();
  neuronGeometry.setAttribute('position', new BufferAttribute(targets, 3));
  neuronGeometry.setAttribute('aStart', new BufferAttribute(starts, 3));
  neuronGeometry.setAttribute('aSeed', new BufferAttribute(seeds, 1));
  const neuronMaterial = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uAssemble: { value: 0 },
      uActivity: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uAssemble;
      uniform float uActivity;
      uniform float uPixelRatio;
      attribute vec3 aStart;
      attribute float aSeed;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        // Neurons arrive at slightly different moments for an organic gather.
        float arrive = smoothstep(aSeed * 0.45, aSeed * 0.45 + 0.55, uAssemble);
        vec3 p = mix(aStart, position, arrive);
        // A wave of activity sweeps front to back across the cortex.
        float wave = sin(position.z * 3.2 - uTime * 1.6 + position.y * 2.0);
        float fire = smoothstep(0.82, 1.0, wave) * uActivity;
        float twinkle = 0.6 + 0.4 * sin(uTime * (1.0 + aSeed * 3.0) + aSeed * 60.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.6 + aSeed * 2.2 + fire * 4.0) * uPixelRatio * (6.0 / -mv.z);
        vec3 calm = mix(vec3(0.25, 0.75, 0.9), vec3(0.62, 0.55, 1.0), smoothstep(-0.6, 0.9, position.y + position.z * 0.3));
        vColor = mix(calm, vec3(0.95, 1.0, 1.0), fire);
        vAlpha = (0.35 + twinkle * 0.45 + fire) * mix(0.5, 1.0, arrive);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float glow = pow(smoothstep(0.5, 0.0, d), 1.8);
        gl_FragColor = vec4(vColor * glow, glow * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  brain.add(new Points(neuronGeometry, neuronMaterial));

  // ---------- Connectome: sparse links between nearby neurons ----------
  const hubs = samples.filter(
    (_, index) => index % (options.mobile ? 18 : 22) === 0,
  );
  const edges: Array<[Vector3, Vector3]> = [];
  for (const hub of hubs) {
    const nearest = hubs
      .filter((other) => other !== hub)
      .map((other) => ({ other, d: hub.distanceToSquared(other) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const { other, d } of nearest) if (d < 0.12) edges.push([hub, other]);
  }
  const edgePositions = new Float32Array(edges.length * 6);
  edges.forEach(([a, b], index) =>
    edgePositions.set([a.x, a.y, a.z, b.x, b.y, b.z], index * 6),
  );
  const edgeGeometry = new BufferGeometry();
  edgeGeometry.setAttribute('position', new BufferAttribute(edgePositions, 3));
  const edgeMaterial = new ShaderMaterial({
    uniforms: { uOpacity: { value: 0 } },
    vertexShader: /* glsl */ `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      void main() { gl_FragColor = vec4(vec3(0.45, 0.85, 0.95) * uOpacity, uOpacity); }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  brain.add(new LineSegments(edgeGeometry, edgeMaterial));

  // ---------- Impulses racing along the connectome ----------
  const impulseCount = Math.min(edges.length, options.mobile ? 140 : 320);
  const impulseA = new Float32Array(impulseCount * 3);
  const impulseB = new Float32Array(impulseCount * 3);
  const impulsePhase = new Float32Array(impulseCount * 2);
  for (let index = 0; index < impulseCount; index++) {
    const [a, b] = edges[Math.floor(Math.random() * edges.length)]!;
    impulseA.set([a.x, a.y, a.z], index * 3);
    impulseB.set([b.x, b.y, b.z], index * 3);
    impulsePhase.set([Math.random(), 0.25 + Math.random() * 0.9], index * 2);
  }
  const impulseGeometry = new BufferGeometry();
  impulseGeometry.setAttribute('position', new BufferAttribute(impulseA, 3));
  impulseGeometry.setAttribute('aTo', new BufferAttribute(impulseB, 3));
  impulseGeometry.setAttribute('aPhase', new BufferAttribute(impulsePhase, 2));
  const impulseMaterial = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uActivity: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uActivity;
      uniform float uPixelRatio;
      attribute vec3 aTo;
      attribute vec2 aPhase;
      varying float vAlpha;
      void main() {
        float t = fract(aPhase.x + uTime * aPhase.y * 0.6);
        vec3 p = mix(position, aTo, t);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = 7.0 * uPixelRatio * (6.0 / -mv.z);
        vAlpha = sin(t * 3.14159) * uActivity;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float glow = pow(smoothstep(0.5, 0.0, d), 2.0);
        gl_FragColor = vec4(vec3(0.9, 1.0, 1.0) * glow, glow * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  brain.add(new Points(impulseGeometry, impulseMaterial));

  // ---------- Nerve fibres descending from the brainstem ----------
  const fibreSamples = options.mobile ? 90 : 160;
  const fibreCount = 9;
  const fibrePositions = new Float32Array(fibreCount * fibreSamples * 3);
  const fibreT = new Float32Array(fibreCount * fibreSamples);
  for (let fibre = 0; fibre < fibreCount; fibre++) {
    const spread = (fibre / (fibreCount - 1) - 0.5) * 2;
    const curve = new CatmullRomCurve3([
      new Vector3(0, -1.25, -0.47),
      new Vector3(spread * 0.25, -1.7, -0.4),
      new Vector3(spread * 0.9, -2.3, -0.1 + Math.abs(spread) * 0.2),
      new Vector3(spread * 1.9, -2.8, 0.3),
      new Vector3(spread * 3.2, -3.1, 0.2),
    ]);
    for (let index = 0; index < fibreSamples; index++) {
      const t = index / (fibreSamples - 1);
      const point = curve.getPoint(t);
      const offset = (fibre * fibreSamples + index) * 3;
      fibrePositions.set([point.x, point.y, point.z], offset);
      fibreT[fibre * fibreSamples + index] = t;
    }
  }
  const fibreGeometry = new BufferGeometry();
  fibreGeometry.setAttribute(
    'position',
    new BufferAttribute(fibrePositions, 3),
  );
  fibreGeometry.setAttribute('aT', new BufferAttribute(fibreT, 1));
  const fibreMaterial = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uReveal: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uReveal;
      uniform float uPixelRatio;
      attribute float aT;
      varying float vAlpha;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float pulse = smoothstep(0.85, 1.0, sin(aT * 18.0 - uTime * 3.0));
        gl_PointSize = (2.0 + pulse * 4.0) * uPixelRatio * (6.0 / -mv.z);
        vAlpha = (0.25 + pulse * 0.9) * smoothstep(aT, aT + 0.08, uReveal) * (1.0 - aT * 0.6);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float glow = pow(smoothstep(0.5, 0.0, d), 2.0);
        gl_FragColor = vec4(vec3(0.55, 0.88, 1.0) * glow, glow * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  brain.add(new Points(fibreGeometry, fibreMaterial));

  // Label anchors: prefrontal (thoughts), limbic core (feelings), motor strip (actions).
  const labelPoints = [
    new Vector3(0.55, 0.55, 0.95),
    new Vector3(-0.2, -0.15, 0.1),
    new Vector3(-0.75, 0.75, -0.3),
  ];

  let width = 1;
  let height = 1;
  let brainOffsetX = 0;
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z =
      camera.aspect < 0.8 ? 9.5 : camera.aspect < 1.2 ? 7.4 : 6.2;
    // On wide screens the brain sits right of the introduction text.
    brainOffsetX = !options.compact && camera.aspect > 1.2 ? 0.95 : 0;
    if (options.compact) camera.position.z = camera.aspect < 0.9 ? 8.2 : 6.6;
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
  const projected = new Vector3();
  let anchors = labelPoints.map(() => ({ x: 0, y: 0, visible: 0 }));

  const render = (now: number) => {
    raf = 0;
    if (!running) return;
    const time = (now - startedAt) / 1000;
    eased += (progress - eased) * 0.07;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    const assemble = smooth(0.0, 0.45, eased);
    const activity = smooth(0.3, 0.75, eased);
    neuronMaterial.uniforms.uTime!.value = time;
    neuronMaterial.uniforms.uAssemble!.value = assemble;
    neuronMaterial.uniforms.uActivity!.value = 0.25 + activity * 0.75;
    edgeMaterial.uniforms.uOpacity!.value = activity * 0.22;
    impulseMaterial.uniforms.uTime!.value = time;
    impulseMaterial.uniforms.uActivity!.value = activity;
    fibreMaterial.uniforms.uTime!.value = time;
    fibreMaterial.uniforms.uReveal!.value = smooth(0.45, 0.9, eased) * 1.1;

    // A slow, contemplative turn, steered a little by the pointer.
    brain.rotation.y = -0.6 + eased * 1.4 + time * 0.05 + pointer.x * 0.35;
    brain.rotation.x = 0.12 + pointer.y * 0.18 + Math.sin(time * 0.3) * 0.03;
    brain.position.y = 0.35 + (1 - assemble) * 0.3;
    brain.position.x = brainOffsetX;
    brain.scale.setScalar(0.9 + assemble * 0.15 + Math.sin(time * 0.8) * 0.006);

    anchors = labelPoints.map((point, index) => {
      projected.copy(point);
      brain.localToWorld(projected);
      projected.project(camera);
      return {
        x: (projected.x * 0.5 + 0.5) * width,
        y: (-projected.y * 0.5 + 0.5) * height,
        visible: smooth(0.5 + index * 0.08, 0.68 + index * 0.08, eased),
      };
    });

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
      for (const geometry of [
        neuronGeometry,
        edgeGeometry,
        impulseGeometry,
        fibreGeometry,
      ])
        geometry.dispose();
      for (const material of [
        neuronMaterial,
        edgeMaterial,
        impulseMaterial,
        fibreMaterial,
      ])
        material.dispose();
      renderer.dispose();
    },
  };
}
