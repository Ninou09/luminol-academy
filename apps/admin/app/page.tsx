import { Wordmark } from '@luminol/ui';
import { requirePermission } from '@luminol/auth';
export default async function Page() {
  await requirePermission('academy:manage');
  return (
    <main className="shell">
      <aside>
        <Wordmark />
        <p className="label">Administration</p>
        <nav>
          <a className="active">Overview</a>
          <a>Students</a>
          <a>Programmes</a>
          <a>Content</a>
        </nav>
      </aside>
      <section className="dashboard">
        <header>
          <div>
            <p className="eyebrow">Academic operations</p>
            <h1>Good morning.</h1>
          </div>
          <span className="status">Foundation ready</span>
        </header>
        <div className="cards">
          <article>
            <p>Applications</p>
            <strong>—</strong>
            <small>Awaiting integration</small>
          </article>
          <article>
            <p>Active students</p>
            <strong>—</strong>
            <small>Awaiting integration</small>
          </article>
          <article>
            <p>Programmes</p>
            <strong>—</strong>
            <small>Awaiting integration</small>
          </article>
        </div>
        <section className="panel">
          <h2>Platform foundation</h2>
          <p>
            The administration workspace is configured and ready for the next
            product milestone.
          </p>
        </section>
      </section>
    </main>
  );
}
