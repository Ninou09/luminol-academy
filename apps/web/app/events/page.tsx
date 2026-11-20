import { EventsSection } from '../../components/events-section';
import { SiteHeader, SiteFooter } from '../../components/site-shell';
import { getRequestLocale } from '../../lib/request-locale';
export default async function EventsArchive() {
  const locale = await getRequestLocale();
  return (
    <>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        <EventsSection locale={locale} archive />
      </main>
      <SiteFooter />
    </>
  );
}
