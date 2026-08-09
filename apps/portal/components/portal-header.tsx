import { UserButton } from '@clerk/nextjs';
import { getCommonDictionary, localizeHref } from '@luminol/localization';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

import { getPortalCopy } from '../lib/portal-localization';
import { getPortalRequestLocale } from '../lib/request-locale';
import { PortalLanguageSwitcher } from './portal-language-switcher';

export async function PortalHeader() {
  const locale = await getPortalRequestLocale();
  const copy = getPortalCopy(locale);
  const common = getCommonDictionary(locale);

  return (
    <header className="portal-header">
      <Link
        href={localizeHref(locale, '/')}
        className="brand-link"
        aria-label={copy.shell.homeAria}
      >
        <Wordmark />
      </Link>
      <div className="portal-account">
        <nav className="portal-nav" aria-label={copy.shell.portal}>
          <Link href={localizeHref(locale, '/')}>{copy.shell.dashboard}</Link>
          <Link href={localizeHref(locale, '/search')}>
            {copy.shell.search}
          </Link>
          <Link href={localizeHref(locale, '/notifications')}>
            {copy.shell.notifications}
          </Link>
          <Link href={localizeHref(locale, '/finance')}>
            {copy.shell.billing}
          </Link>
          <Link href={localizeHref(locale, '/account')}>
            {copy.shell.account}
          </Link>
        </nav>
        <PortalLanguageSwitcher
          locale={locale}
          label={common.languageSelectorLabel}
        />
        <span>{copy.shell.portal}</span>
        <UserButton />
      </div>
    </header>
  );
}
