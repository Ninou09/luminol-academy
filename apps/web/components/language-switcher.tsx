'use client';

import {
  LOCALE_DEFINITIONS,
  SUPPORTED_LOCALES,
  localizePathname,
  parseLocalizedPathname,
  type Locale,
} from '@luminol/localization';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type LanguageSwitcherProps = {
  locale: Locale;
  label: string;
};

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hash, setHash] = useState('');
  const parsed = parseLocalizedPathname(pathname);
  const basePathname = parsed?.pathname ?? pathname;
  const search = searchParams.toString();

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener('hashchange', syncHash);
    return () => window.removeEventListener('hashchange', syncHash);
  }, []);

  return (
    <nav className="locale-switcher" aria-label={label}>
      {SUPPORTED_LOCALES.map((target) => {
        const localizedPathname = localizePathname(target, basePathname);
        const href = `${localizedPathname}${search ? `?${search}` : ''}${hash}`;
        const definition = LOCALE_DEFINITIONS[target];

        return (
          <a
            href={href}
            key={target}
            lang={target}
            hrefLang={target}
            dir={definition.direction}
            aria-label={definition.nativeLabel}
            aria-current={target === locale ? 'page' : undefined}
          >
            {target.toUpperCase()}
          </a>
        );
      })}
    </nav>
  );
}
