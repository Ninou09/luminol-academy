'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';

import styles from './resources-menu.module.css';

type ResourceLink = {
  href: string;
  label: string;
  description?: string;
  /** Unprefixed path that marks this entry as the current page. */
  match: string;
};

/**
 * Header disclosure for the secondary public pages (journal, past events,
 * psychology library). Closes on Escape, on an outside click and after
 * navigation, and marks itself current when one of its pages is open.
 */
export function ResourcesMenu({
  label,
  links,
  openOnHover = false,
}: {
  label: string;
  links: readonly ResourceLink[];
  openOnHover?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const pathname = usePathname() ?? '/';
  const bare = pathname.replace(/^\/(ar|fr|en)(?=\/|$)/, '') || '/';
  const activeMatch = (
    links.find((link) => bare === link.match) ??
    links.find((link) => bare.startsWith(`${link.match}/`))
  )?.match;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div
      className={styles.root}
      ref={rootRef}
      data-hover-menu={openOnHover || undefined}
      onPointerEnter={
        openOnHover
          ? (event) => {
              if (event.pointerType === 'mouse') setOpen(true);
            }
          : undefined
      }
      onPointerLeave={
        openOnHover
          ? (event) => {
              if (
                event.pointerType === 'mouse' &&
                !event.currentTarget.contains(document.activeElement)
              )
                setOpen(false);
            }
          : undefined
      }
    >
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        data-current={activeMatch ? 'true' : undefined}
        onClick={(event) => {
          if (openOnHover && event.detail > 0) setOpen(true);
          else setOpen((value) => !value);
        }}
      >
        {label}
        <svg viewBox="0 0 12 12" aria-hidden="true" className={styles.chevron}>
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </button>
      <div className={styles.panel} id={panelId} hidden={!open}>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={activeMatch === link.match ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                <strong>{link.label}</strong>
                {link.description ? <span>{link.description}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
