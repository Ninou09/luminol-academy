import { UserButton } from '@clerk/nextjs';
import { requirePermission } from '@luminol/auth';
import { Wordmark } from '@luminol/ui';
import Link from 'next/link';

import { displayPersonName } from '../../lib/operations';
import styles from './page.module.css';
import { AdminSearchWorkspace } from './search-workspace';

export default async function AdminSearchPage() {
  const administrator = await requirePermission('academy:manage');
  const administratorName = displayPersonName(
    administrator.firstName,
    administrator.lastName,
    'Administrator',
  );

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar}>
        <Link
          className={styles.brand}
          href="/"
          aria-label="Luminol administration"
        >
          <Wordmark />
        </Link>
        <p className={styles.label}>Administration</p>
        <nav aria-label="Administration search navigation">
          <Link href="/">Overview</Link>
          <Link className={styles.active} href="/search" aria-current="page">
            Search
          </Link>
          <Link href="/finance">Finance</Link>
        </nav>
        <p className={styles.privacyNote}>
          Search is limited to operational identity, enquiry routing and course
          metadata. Enquiry messages and sensitive learning content are not
          searched here.
        </p>
      </aside>

      <section className={styles.workspace}>
        <header className={styles.topbar}>
          <div>
            <p>Operations search</p>
            <span>Protected administration workspace</span>
          </div>
          <div className={styles.account}>
            <span>{administratorName}</span>
            <UserButton />
          </div>
        </header>

        <AdminSearchWorkspace />
      </section>
    </main>
  );
}
