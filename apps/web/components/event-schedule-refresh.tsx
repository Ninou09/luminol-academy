'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Refresh the scheduled dates and CMS data only while the schedule is in view. */
export function EventScheduleRefresh() {
  const router = useRouter();
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
  return null;
}
