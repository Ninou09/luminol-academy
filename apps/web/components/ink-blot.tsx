'use client';

import { useEffect, useRef } from 'react';

/**
 * A living, mirror-symmetric inkblot in the spirit of the Rorschach plates:
 * luminous ink folds into new shapes over time and leans toward the pointer.
 * Pure WebGL, no dependencies; skipped for reduced motion or without WebGL.
 */
const vertexSource = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const fragmentSource = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.02 + 3.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  // Fold the page: the defining symmetry of an inkblot.
  vec2 p = vec2(abs(uv.x), uv.y);
  vec2 pointer = vec2(abs(u_pointer.x), u_pointer.y);
  float t = u_time * 0.06;

  // Domain warping makes the ink bleed organically.
  vec2 q = vec2(fbm(p * 2.2 + t), fbm(p * 2.2 - t + 4.7));
  vec2 r = vec2(fbm(p * 1.6 + 1.6 * q + vec2(1.7, 9.2) + t * 1.4),
                fbm(p * 1.6 + 1.6 * q + vec2(8.3, 2.8) - t));
  float ink = fbm(p * 1.3 + 1.5 * r);

  // Two soft wings (a butterfly-like blot) that the pointer gently pulls.
  vec2 wing = p - vec2(0.24, 0.04);
  float body = 1.0 - smoothstep(0.0, 0.42, length(wing * vec2(0.95, 1.2)));
  body = max(body, 1.0 - smoothstep(0.0, 0.2, length(p * vec2(2.4, 1.0))));
  body += 0.25 * (1.0 - smoothstep(0.0, 0.3, length(p - pointer)));
  float field = ink * 0.8 + body * 0.7 - 0.66;

  // Watercolour: wide soft falloff, pigment pooling at the rim.
  float shape = smoothstep(-0.02, 0.12, field);
  float rim = smoothstep(-0.01, 0.03, field) - smoothstep(0.03, 0.16, field);
  float depth = smoothstep(0.05, 0.4, field);

  vec3 cyan = vec3(0.4, 0.84, 0.94);
  vec3 teal = vec3(0.16, 0.55, 0.6);
  vec3 bright = vec3(0.86, 0.98, 1.0);
  vec3 color = mix(cyan, teal, depth * 0.7);
  color += bright * rim * 0.35;

  float alpha = shape * (0.22 + rim * 0.3 + (1.0 - depth) * 0.1);
  gl_FragColor = vec4(color * alpha, alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export function InkBlot({ className }: { className?: string | undefined }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const gl = canvas.getContext('webgl', {
      premultipliedAlpha: true,
      alpha: true,
    });
    if (!gl) return;
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
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
    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uPointer = gl.getUniformLocation(program, 'u_pointer');

    const pointer = { x: 0.2, y: 0.1, tx: 0.2, ty: 0.1 };
    let frame = 0;
    let inView = false;
    const started = performance.now();

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const render = (now: number) => {
      frame = 0;
      if (!inView || document.hidden) return;
      pointer.x += (pointer.tx - pointer.x) * 0.03;
      pointer.y += (pointer.ty - pointer.y) * 0.03;
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, (now - started) / 1000);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = requestAnimationFrame(render);
    };
    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.tx = (event.clientX - rect.left - rect.width / 2) / rect.height;
      pointer.ty = -(event.clientY - rect.top - rect.height / 2) / rect.height;
    };
    const wake = () => {
      if (inView && !document.hidden && !frame)
        frame = requestAnimationFrame(render);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting);
      wake();
    });
    visibility.observe(canvas);
    host.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', wake);
    canvas.dataset.live = 'true';

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      host.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', wake);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
