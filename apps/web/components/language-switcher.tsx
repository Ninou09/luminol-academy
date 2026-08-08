'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  localeMeta,
  localePath,
  publicLocales,
  type PublicLocale,
} from '../lib/i18n';

function basePublicPath(pathname: string) {
  const stripped = pathname.replace(/^\/(fr|en)(?=\/|$)/, '');
  return stripped || '/';
}

export function LanguageSwitcher({ locale }: { locale: PublicLocale }) {
  const pathname = usePathname();
  const currentPath = basePublicPath(pathname);

  return (
    <nav className="language-switcher" aria-label="Language selection">
      {publicLocales.map((targetLocale) => (
        <Link
          aria-current={targetLocale === locale ? 'page' : undefined}
          data-active={targetLocale === locale ? 'true' : 'false'}
          href={localePath(targetLocale, currentPath)}
          hrefLang={localeMeta[targetLocale].htmlLang}
          key={targetLocale}
          lang={localeMeta[targetLocale].htmlLang}
        >
          {localeMeta[targetLocale].short}
        </Link>
      ))}
    </nav>
  );
}
