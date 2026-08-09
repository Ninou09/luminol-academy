import { UserButton } from '@clerk/nextjs';
import { requirePermission } from '@luminol/auth';
import { getCommonDictionary, localizeHref } from '@luminol/localization';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';
import { getAdminCopy } from '../../lib/admin-localization';
import { displayPersonName } from '../../lib/operations';
import { getAdminRequestLocale } from '../../lib/request-locale';
import styles from './page.module.css';
import { AdminSearchWorkspace } from './search-workspace';

export default async function AdminSearchPage() {
  const administrator = await requirePermission('academy:manage');
  const locale = await getAdminRequestLocale();
  const copy = getAdminCopy(locale);
  const common = getCommonDictionary(locale);
  const administratorName = displayPersonName(
    administrator.firstName,
    administrator.lastName,
    copy.shell.administrator,
  );

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link
          className={styles.brand}
          href={localizeHref(locale, '/')}
          aria-label={copy.shell.aria}
        >
          <Wordmark />
        </Link>
        <p className={styles.label}>{copy.shell.administration}</p>
        <nav aria-label={copy.shell.aria}>
          <Link href={localizeHref(locale, '/')}>{copy.shell.overview}</Link>
          <Link
            className={styles.active}
            href={localizeHref(locale, '/search')}
            aria-current="page"
          >
            {copy.shell.search}
          </Link>
          <Link href={localizeHref(locale, '/finance')}>
            {copy.shell.finance}
          </Link>
        </nav>
        <p className={styles.privacyNote}>{copy.shell.privacyNote}</p>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <p>{copy.shell.searchWorkspace}</p>
            <span>{copy.shell.protectedWorkspace}</span>
          </div>
          <div className={styles.account}>
            <AdminLanguageSwitcher
              locale={locale}
              label={common.languageSelectorLabel}
            />
            <span dir="auto">{administratorName}</span>
            <UserButton />
          </div>
        </header>

        <AdminSearchWorkspace locale={locale} copy={copy.search} />
      </section>
    </main>
  );
}
