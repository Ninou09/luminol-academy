'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './site-shell.module.css';

export function SiteMenu({
  label,
  closeLabel,
  title,
  children,
  visual,
}: {
  label: string;
  closeLabel: string;
  title: string;
  children: ReactNode;
  visual: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  return (
    <>
      <button
        type="button"
        className={styles.menuToggle}
        aria-label={label}
        aria-expanded={open}
        aria-controls="academy-menu"
        onClick={() => {
          dialog.current?.showModal();
          setOpen(true);
        }}
      >
        <span>{label}</span>
        <span className={styles.menuLines} aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      <dialog
        ref={dialog}
        id="academy-menu"
        className={styles.menuDialog}
        aria-labelledby="academy-menu-title"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest('a'))
            dialog.current?.close();
        }}
      >
        <div className={styles.menuTop}>
          <p id="academy-menu-title">{title}</p>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={closeLabel}
          >
            ×
          </button>
        </div>
        <div className={styles.menuBody}>
          {children}
          <div className={styles.menuFeature}>
            {visual}
            <div className={styles.menuSignature} aria-hidden="true">
              Luminol<span>Academy</span>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
