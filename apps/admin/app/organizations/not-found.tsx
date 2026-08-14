import { localizeHref } from '@luminol/localization';
import Link from 'next/link';

import { getOrganizationAdminCopy } from '../../lib/organization-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';

export default async function OrganizationsAdminNotFound() {
  const locale = await getAdminRequestLocale();
  const copy = getOrganizationAdminCopy(locale);

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-panel">
            <h1>{copy.notFoundTitle}</h1>
            <p>{copy.notFoundBody}</p>
            <Link href={localizeHref(locale, '/organizations')}>
              {copy.returnOrganizations}
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
