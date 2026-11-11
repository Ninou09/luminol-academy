'use client';

import { useEffect, useRef } from 'react';

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Pulse = { from: number; to: number; t: number; speed: number };

/**
 * A living "network of thoughts": drifting neurons link up when close, signals
 * travel along the links like synapses firing, and the area around the
 * pointer lights up as if attention were focusing there. Decorative only.
 */
export function ThoughtNetwork({
  className,
}: {
  className?: string | undefined;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    const context = canvas?.getContext('2d');
    if (!canvas || !host || !context) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let width = 0;
    let height = 0;
    let ratio = 1;
    let nodes: Node[] = [];
    const pulses: Pulse[] = [];
    const pointer = { x: -9999, y: -9999, active: false };
    let frame = 0;
    let inView = false;
    const linkDistance = () => Math.min(170, Math.max(110, width / 9));

    const seed = () => {
      const count = Math.round(Math.min(90, (width * height) / 16000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: 1 + Math.random() * 1.8,
      }));
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      ratio = Math.min(window.devicePixelRatio || 1, 1.75);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      seed();
    };

    const draw = () => {
      frame = 0;
      if (!inView) return;
      context.clearRect(0, 0, width, height);
      const reach = linkDistance();

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
        // Attention: nodes are drawn gently toward the pointer.
        if (pointer.active) {
          const dx = pointer.x - node.x;
          const dy = pointer.y - node.y;
          const distance = Math.hypot(dx, dy);
          if (distance < 220 && distance > 1) {
            node.x += (dx / distance) * 0.25;
            node.y += (dy / distance) * 0.25;
          }
        }
      }

      for (let a = 0; a < nodes.length; a++) {
        const first = nodes[a]!;
        for (let b = a + 1; b < nodes.length; b++) {
          const second = nodes[b]!;
          const distance = Math.hypot(first.x - second.x, first.y - second.y);
          if (distance > reach) continue;
          const near = pointer.active
            ? Math.max(
                0,
                1 -
                  Math.hypot(
                    (first.x + second.x) / 2 - pointer.x,
                    (first.y + second.y) / 2 - pointer.y,
                  ) /
                    260,
              )
            : 0;
          const alpha = (1 - distance / reach) * (0.16 + near * 0.55);
          context.strokeStyle = `rgba(139, 222, 239, ${alpha.toFixed(3)})`;
          context.lineWidth = 0.6 + near * 0.8;
          context.beginPath();
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
          if (pulses.length < 18 && Math.random() < 0.0009 + near * 0.01) {
            pulses.push({
              from: a,
              to: b,
              t: 0,
              speed: 0.012 + Math.random() * 0.02,
            });
          }
        }
      }

      for (let index = pulses.length - 1; index >= 0; index--) {
        const pulse = pulses[index]!;
        const from = nodes[pulse.from];
        const to = nodes[pulse.to];
        pulse.t += pulse.speed;
        if (!from || !to || pulse.t >= 1) {
          pulses.splice(index, 1);
          continue;
        }
        const x = from.x + (to.x - from.x) * pulse.t;
        const y = from.y + (to.y - from.y) * pulse.t;
        const glow = context.createRadialGradient(x, y, 0, x, y, 10);
        glow.addColorStop(0, 'rgba(220, 250, 255, 0.95)');
        glow.addColorStop(1, 'rgba(139, 222, 239, 0)');
        context.fillStyle = glow;
        context.beginPath();
        context.arc(x, y, 10, 0, Math.PI * 2);
        context.fill();
      }

      for (const node of nodes) {
        const near = pointer.active
          ? Math.max(
              0,
              1 - Math.hypot(node.x - pointer.x, node.y - pointer.y) / 200,
            )
          : 0;
        context.fillStyle = `rgba(190, 240, 250, ${(0.35 + near * 0.65).toFixed(3)})`;
        context.beginPath();
        context.arc(node.x, node.y, node.r + near * 1.6, 0, Math.PI * 2);
        context.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    const visibility = new IntersectionObserver(([entry]) => {
      inView = Boolean(entry?.isIntersecting) && !document.hidden;
      if (inView && !frame) frame = requestAnimationFrame(draw);
    });
    visibility.observe(host);
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibility.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
