'use client';

import {
  LOCALE_DEFINITIONS,
  SUPPORTED_LOCALES,
  localizePathname,
  parseLocalizedPathname,
  type Locale,
} from '@luminol/localization';
import { usePathname } from 'next/navigation';

type PortalLanguageSwitcherProps = {
  locale: Locale;
  label: string;
};

export function PortalLanguageSwitcher({
  locale,
  label,
}: PortalLanguageSwitcherProps) {
  const pathname = usePathname();
  const parsed = parseLocalizedPathname(pathname);
  const basePathname = parsed?.pathname ?? pathname;

  return (
    <nav className="portal-locale-switcher" aria-label={label}>
      {SUPPORTED_LOCALES.map((target) => (
        <a
          href={localizePathname(target, basePathname)}
          key={target}
          lang={target}
          dir={LOCALE_DEFINITIONS[target].direction}
          aria-current={target === locale ? 'page' : undefined}
        >
          {target.toUpperCase()}
        </a>
      ))}
    </nav>
  );
}
