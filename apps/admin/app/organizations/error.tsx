'use client';

export default function OrganizationsAdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      className="admin-shell"
      style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}
    >
      <section className="admin-dashboard">
        <div className="admin-content">
          <section className="admin-panel">
            <h1>Organization administration is unavailable</h1>
            <p>
              No organization mutation was assumed to have succeeded. Retry the
              protected workspace after checking the current data state.
            </p>
            <button type="button" onClick={() => reset()}>
              Retry
            </button>
          </section>
        </div>
      </section>
    </main>
  );
}
