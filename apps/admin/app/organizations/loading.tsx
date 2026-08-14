import { getOrganizationAdminCopy } from '../../lib/organization-localization';
import { getAdminRequestLocale } from '../../lib/request-locale';

export default async function OrganizationsAdminLoading() {
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
            <p className="admin-empty">{copy.loading}</p>
          </section>
        </div>
      </section>
    </main>
  );
}
