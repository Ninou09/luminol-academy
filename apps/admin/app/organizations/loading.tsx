export default function OrganizationsAdminLoading() {
  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-panel">
            <p className="admin-empty">Loading organization administration…</p>
          </section>
        </div>
      </section>
    </main>
  );
}
