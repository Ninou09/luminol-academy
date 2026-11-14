'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import styles from './site-dock.module.css';

/**
 * Floating dock: a WhatsApp shortcut (only when Luminol has configured a
 * number) and a back-to-top button whose ring fills with scroll progress.
 * It also gives every route change a soft fade-in so pages feel connected.
 */
export function SiteDock({
  whatsappHref,
  whatsappLabel,
  topLabel,
}: {
  whatsappHref: string | null;
  whatsappLabel: string;
  topLabel: string;
}) {
  const pathname = usePathname();
  const ringRef = useRef<SVGCircleElement>(null);
  const [visible, setVisible] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      setVisible(window.scrollY > window.innerHeight * 0.8);
      ringRef.current?.style.setProperty('--progress', progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // A gentle page-in on client-side navigation.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.getElementById('main-content')?.animate(
      [
        { opacity: 0, transform: 'translate3d(0, 18px, 0)', filter: 'blur(6px)' },
        { opacity: 1, transform: 'none', filter: 'blur(0)' },
      ],
      { duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
    );
  }, [pathname]);

  return (
    <div className={styles.dock}>
      {whatsappHref ? (
        <a
          className={styles.whatsapp}
          href={whatsappHref}
          target="_blank"
          rel="noopener"
          aria-label={whatsappLabel}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3Z"
            />
          </svg>
        </a>
      ) : null}
      <button
        type="button"
        className={styles.top}
        data-visible={visible || undefined}
        aria-label={topLabel}
        tabIndex={visible ? 0 : -1}
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
              .matches
              ? 'auto'
              : 'smooth',
          })
        }
      >
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <circle className={styles.track} cx="24" cy="24" r="21" />
          <circle ref={ringRef} className={styles.ring} cx="24" cy="24" r="21" />
        </svg>
        <span aria-hidden="true">↑</span>
      </button>
    </div>
  );
}
