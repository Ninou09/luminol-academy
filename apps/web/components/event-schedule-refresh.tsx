'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useMotionAllowed } from '../lib/calm-mode';

/** Refresh the scheduled dates and CMS data only while the schedule is in view. */
export function EventScheduleRefresh() {
  const router = useRouter();
  const allowMotion = useMotionAllowed();
  useEffect(() => {
    const section = document.getElementById('home-events');
    if (!section) return;
    let visible = false;
    let lastRefresh = Date.now();
    const refresh = () => {
      if (!visible || document.hidden || Date.now() - lastRefresh < 60_000)
        return;
      lastRefresh = Date.now();
      router.refresh();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      refresh();
    });
    observer.observe(section);
    const interval = window.setInterval(refresh, 15_000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      observer.disconnect();
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [router]);
  useEffect(() => {
    const section = document.getElementById('home-events');
    if (!allowMotion || !section) return;
    const currentCard = () =>
      section.querySelector<HTMLElement>('[data-upcoming-event]');
    let previous = currentCard()?.dataset.upcomingEvent;
    let animation: Animation | undefined;
    const observer = new MutationObserver(() => {
      const card = currentCard();
      if (!card || card.dataset.upcomingEvent === previous) return;
      previous = card.dataset.upcomingEvent;
      animation?.cancel();
      animation = card.animate(
        [{ transform: 'translateY(4px)' }, { transform: 'translateY(0)' }],
        { duration: 260, easing: 'ease-out' },
      );
    });
    observer.observe(section, {
      subtree: true,
      childList: true,
      attributeFilter: ['data-upcoming-event'],
    });
    return () => {
      observer.disconnect();
      animation?.cancel();
    };
  }, [allowMotion]);

  return null;
}
