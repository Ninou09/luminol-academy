'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Progressive pointer interactions declared with data attributes:
 * - [data-tilt]       3D tilt with a light glare (--tilt-x/y, --glare-x/y)
 * - [data-magnetic]   controls lean gently toward the pointer
 * - [data-spotlight]  dark sections reveal a soft cursor light (--spot-x/y)
 *
 * Only fine pointers with full motion get them; content never depends on them.
 */
export function PublicInteractions() {
  const pathname = usePathname();

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (motion.matches || !finePointer.matches) return;

    const cleanups: Array<() => void> = [];
    const bind = (
      element: HTMLElement,
      move: (event: PointerEvent, rect: DOMRect) => void,
      leave: () => void,
    ) => {
      let frame = 0;
      let last: PointerEvent | null = null;
      const onMove = (event: PointerEvent) => {
        last = event;
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (last) move(last, element.getBoundingClientRect());
        });
      };
      const onLeave = () => {
        cancelAnimationFrame(frame);
        frame = 0;
        leave();
      };
      element.addEventListener('pointermove', onMove, { passive: true });
      element.addEventListener('pointerleave', onLeave);
      cleanups.push(() => {
        cancelAnimationFrame(frame);
        element.removeEventListener('pointermove', onMove);
        element.removeEventListener('pointerleave', onLeave);
        leave();
      });
    };

    for (const card of document.querySelectorAll<HTMLElement>('[data-tilt]')) {
      const strength = Number(card.dataset.tilt) || 7;
      bind(
        card,
        (event, rect) => {
          const x = (event.clientX - rect.left) / rect.width;
          const y = (event.clientY - rect.top) / rect.height;
          card.style.setProperty('--tilt-x', `${(0.5 - y) * strength}deg`);
          card.style.setProperty('--tilt-y', `${(x - 0.5) * strength}deg`);
          card.style.setProperty('--glare-x', `${x * 100}%`);
          card.style.setProperty('--glare-y', `${y * 100}%`);
          card.dataset.tiltActive = 'true';
        },
        () => {
          for (const name of ['--tilt-x', '--tilt-y', '--glare-x', '--glare-y'])
            card.style.removeProperty(name);
          delete card.dataset.tiltActive;
        },
      );
    }

    for (const control of document.querySelectorAll<HTMLElement>(
      '[data-magnetic], .luminol-button',
    )) {
      bind(
        control,
        (event, rect) => {
          const x = event.clientX - (rect.left + rect.width / 2);
          const y = event.clientY - (rect.top + rect.height / 2);
          control.style.translate = `${x * 0.18}px ${y * 0.28}px`;
        },
        () => {
          control.style.translate = '';
        },
      );
    }

    for (const area of document.querySelectorAll<HTMLElement>(
      '[data-spotlight]',
    )) {
      bind(
        area,
        (event, rect) => {
          area.style.setProperty('--spot-x', `${event.clientX - rect.left}px`);
          area.style.setProperty('--spot-y', `${event.clientY - rect.top}px`);
          area.dataset.spotlightActive = 'true';
        },
        () => {
          delete area.dataset.spotlightActive;
        },
      );
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, [pathname]);

  return null;
}
