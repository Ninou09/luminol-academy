'use client';

import {
  LOCALE_DEFINITIONS,
  SUPPORTED_LOCALES,
  localizePathname,
  parseLocalizedPathname,
  type Locale,
} from '@luminol/localization';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
};

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const parsed = parseLocalizedPathname(pathname);
  const basePathname = parsed?.pathname ?? pathname;

  function preserveLocation(
    event: MouseEvent<HTMLAnchorElement>,
    target: Locale,
  ) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    const destination = new URL(window.location.href);
    const current = parseLocalizedPathname(destination.pathname);
    destination.pathname = localizePathname(
      target,
      current?.pathname ?? destination.pathname,
    );
    window.location.assign(destination.toString());
  }

  return (
    <nav className="locale-switcher" aria-label={label}>
      {SUPPORTED_LOCALES.map((target) => (
        <a
          href={localizePathname(target, basePathname)}
          key={target}
          lang={target}
          dir={LOCALE_DEFINITIONS[target].direction}
          aria-current={target === locale ? 'page' : undefined}
          onClick={(event) => preserveLocation(event, target)}
        >
          {target.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}
