'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import styles from './mobile-menu.module.css';

type MenuLink = { href: string; label: string; match: string };

/**
 * Phone navigation: a burger button opens a full-screen glass panel with
 * large links, direct contacts and the opening hours.
 */
export function MobileMenu({
  links,
  openLabel,
  closeLabel,
  contacts,
  hours,
  founderTheme = false,
}: {
  links: readonly MenuLink[];
  openLabel: string;
  closeLabel: string;
  contacts: readonly { href: string; label: string; external?: boolean }[];
  hours: string;
  founderTheme?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.dataset.menuOpen = 'true';
    panelRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const controls = [
          buttonRef.current,
          ...panelRef.current!.querySelectorAll<HTMLAnchorElement>('a[href]'),
        ];
        const current = controls.indexOf(
          document.activeElement as HTMLAnchorElement,
        );
        const next =
          (current + (event.shiftKey ? -1 : 1) + controls.length) %
          controls.length;
        event.preventDefault();
        controls[next]?.focus();
      }
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const wide = window.matchMedia('(min-width: 901px)');
    const closeWide = () => {
      if (wide.matches) setOpen(false);
    };
    wide.addEventListener('change', closeWide);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      delete document.documentElement.dataset.menuOpen;
      wide.removeEventListener('change', closeWide);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const localPath = pathname.replace(/^\/(en|fr|ar)(?=\/|$)/, '') || '/';

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls="mobile-menu-panel"
        aria-label={open ? closeLabel : openLabel}
        data-open={open || undefined}
        onClick={() => setOpen(!open)}
      >
        <span />
        <span />
        <span />
      </button>
      {mounted
        ? createPortal(
            <div
              id="mobile-menu-panel"
              ref={panelRef}
              className={styles.panel}
              data-open={open || undefined}
              data-founder-theme={founderTheme || undefined}
              hidden={!open}
            >
              <nav aria-label={openLabel}>
                <ol>
                  {links.map((link, index) => {
                    const active =
                      link.match === '/'
                        ? localPath === '/'
                        : localPath.startsWith(link.match);
                    return (
                      <li
                        key={link.href}
                        style={{ '--i': index } as React.CSSProperties}
                      >
                        <Link
                          href={link.href}
                          aria-current={active ? 'page' : undefined}
                          onClick={() => setOpen(false)}
                        >
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ol>
              </nav>
              <div className={styles.footer}>
                <p>{hours}</p>
                <div className={styles.contacts}>
                  {contacts.map((contact) => (
                    <a
                      key={contact.href}
                      href={contact.href}
                      dir="ltr"
                      {...(contact.external
                        ? { target: '_blank', rel: 'noopener' }
                        : {})}
                    >
                      {contact.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
