'use client';

import { parseLocalizedPathname } from '@luminol/localization';
import { usePathname } from 'next/navigation';

import { getOrganizationAdminCopy } from '../../lib/organization-localization';

export default function OrganizationsAdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = parseLocalizedPathname(pathname)?.locale ?? 'en';
  const copy = getOrganizationAdminCopy(locale);

  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-panel">
            <h1>{copy.errorTitle}</h1>
            <p>{copy.errorBody}</p>
            <button type="button" onClick={() => reset()}>
              {copy.retry}
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
