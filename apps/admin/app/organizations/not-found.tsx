import Link from 'next/link';

export default function OrganizationsAdminNotFound() {
  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-panel">
            <h1>Organization record not found</h1>
            <p>The requested organization scope does not exist.</p>
            <Link href="/organizations">Return to organizations</Link>
          </section>
        </div>
      </section>
    </main>
  );
}
