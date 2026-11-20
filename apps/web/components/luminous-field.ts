/**
 * Dependency-free WebGL light field layered over the hero artwork.
 *
 * It adds depth particles, a breathing halo, slow energy inside the sphere and
 * soft light rays. The artwork stays the source of truth: if WebGL is missing
 * or fails, callers simply keep the static image.
 */

export type SphereAnchor = {
  /** Sphere centre in artwork UV space (0–1, origin top-left). */
  x: number;
  y: number;
  /** Sphere radius as a fraction of artwork width. */
  radius: number;
};

export type ArtworkFrame = {
  aspect: number;
  anchor: SphereAnchor;
};

const vertexSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentSource = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;
uniform vec3 u_sphere; // centre (px, y-up) and radius (px)
uniform float u_intensity;

const vec3 CYAN = vec3(0.545, 0.871, 0.937);
const vec3 DEEP = vec3(0.082, 0.608, 0.761);

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }
  return value;
}

// One layer of drifting bokeh particles. Nearer layers move more with the pointer.
float particles(vec2 uv, float scale, float depth, float speed) {
  vec2 p = uv * scale;
  p += u_pointer * depth * 0.9;
  p.y -= u_time * speed;
  p.x += sin(u_time * 0.07 + p.y * 0.35) * 0.35;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;
  float seed = hash(cell);
  if (seed < 0.72) return 0.0;
  vec2 offset = vec2(hash(cell + 3.1), hash(cell + 7.7)) - 0.5;
  float dist = length(local - offset * 0.7);
  float size = mix(0.035, 0.11, hash(cell + 1.3)) * depth;
  float twinkle = 0.55 + 0.45 * sin(u_time * (0.6 + seed * 1.6) + seed * 40.0);
  return smoothstep(size, size * 0.15, dist) * twinkle;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  float minSide = min(u_resolution.x, u_resolution.y);
  vec2 uv = frag / minSide;

  vec2 toSphere = frag - u_sphere.xy;
  float r = length(toSphere) / max(u_sphere.z, 1.0);

  // Breathing halo just outside the glass.
  float breathe = 0.82 + 0.18 * sin(u_time * 0.55);
  float halo = exp(-max(r - 0.92, 0.0) * 3.2) * smoothstep(0.7, 1.0, r);
  halo *= 0.42 * breathe;

  // Slow luminous energy inside the sphere.
  float inside = smoothstep(1.0, 0.82, r);
  float angle = atan(toSphere.y, toSphere.x);
  vec2 swirlUv = vec2(angle * 0.9 + u_time * 0.12, r * 2.4 - u_time * 0.08);
  float energy = fbm(swirlUv * 2.2 + fbm(swirlUv * 1.3 + u_time * 0.05));
  energy = smoothstep(0.52, 0.95, energy) * inside * 0.55;

  // Soft rays falling from above, gently swaying.
  vec2 rayUv = (frag - vec2(u_sphere.x, u_resolution.y * 1.15)) / u_resolution.y;
  float rayAngle = atan(rayUv.x, -rayUv.y);
  float rays = fbm(vec2(rayAngle * 7.0 + u_time * 0.04, u_time * 0.03));
  rays = pow(rays, 3.0) * smoothstep(1.6, 0.1, length(rayUv)) * 0.5;

  float dust =
    particles(uv, 9.0, 0.35, 0.05) * 0.45 +
    particles(uv, 5.5, 0.7, 0.08) * 0.7 +
    particles(uv, 3.2, 1.0, 0.12);
  // Fewer particles over the reading area on the text side.
  dust *= mix(0.35, 1.0, smoothstep(0.0, 0.55, frag.x / u_resolution.x));

  vec3 color =
    CYAN * (halo + energy * 1.1 + dust * 0.75) +
    DEEP * rays * 0.9;
  float alpha = clamp(max(max(halo, energy), max(dust * 0.8, rays * 0.7)), 0.0, 1.0);
  gl_FragColor = vec4(color * u_intensity, alpha * u_intensity);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export type LuminousField = {
  setFrame(frame: ArtworkFrame): void;
  setPointer(x: number, y: number): void;
  start(): void;
  stop(): void;
  destroy(): void;
};

/** Returns null when WebGL is unavailable so the static artwork remains. */
export function createLuminousField(
  canvas: HTMLCanvasElement,
): LuminousField | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: 'low-power',
    premultipliedAlpha: true,
  });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    time: gl.getUniformLocation(program, 'u_time'),
    pointer: gl.getUniformLocation(program, 'u_pointer'),
    sphere: gl.getUniformLocation(program, 'u_sphere'),
    intensity: gl.getUniformLocation(program, 'u_intensity'),
  };

  let frame: ArtworkFrame = {
    aspect: 16 / 9,
    anchor: { x: 0.7, y: 0.42, radius: 0.2 },
  };
  let width = 0;
  let height = 0;
  let raf = 0;
  let running = false;
  let startedAt = performance.now();
  let intensity = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.round(rect.width * ratio));
    height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  };

  // Map the sphere from artwork UV space through object-fit: cover.
  const sphereInPixels = () => {
    const canvasAspect = width / height;
    const artWidth =
      canvasAspect > frame.aspect ? width : height * frame.aspect;
    const artHeight = artWidth / frame.aspect;
    const left = (width - artWidth) / 2;
    const top = (height - artHeight) / 2;
    const x = left + frame.anchor.x * artWidth;
    const yFromTop = top + frame.anchor.y * artHeight;
    return [x, height - yFromTop, frame.anchor.radius * artWidth] as const;
  };

  const render = (now: number) => {
    raf = 0;
    if (!running) return;
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    intensity = Math.min(1, intensity + 0.02);
    const [sx, sy, sr] = sphereInPixels();

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uniforms.resolution, width, height);
    gl.uniform1f(uniforms.time, (now - startedAt) / 1000);
    gl.uniform2f(uniforms.pointer, pointer.x, pointer.y);
    gl.uniform3f(uniforms.sphere, sx, sy, sr);
    gl.uniform1f(uniforms.intensity, intensity);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    raf = requestAnimationFrame(render);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return {
    setFrame(next) {
      frame = next;
    },
    setPointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
    },
    start() {
      if (running) return;
      running = true;
      if (!startedAt) startedAt = performance.now();
      raf = requestAnimationFrame(render);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    },
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
      startedAt = 0;
    },
  };
}
