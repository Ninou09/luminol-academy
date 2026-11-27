// Register filters before Vercel's deferred script can send the first page view.
// The DOM allowlist carries fixed event names only, without payloads or form data.
const setup = `
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  window.va('beforeSend', function (event) {
    try {
      var url = new URL(event.url, location.origin);
      if (url.origin !== location.origin) return null;
      url.search = '';
      url.hash = '';
      return { type: event.type, url: url.href };
    } catch (_) { return null; }
  });
  document.addEventListener('click', function (event) {
    var target = event.target;
    var link = target instanceof Element && target.closest('a[data-public-action]');
    var name = link && link.getAttribute('data-public-action');
    if (['Programme opened', 'Programme enquiry opened', 'Event registration', 'Calendar download'].includes(name)) {
      window.va('event', { name: name });
    }
  }, true);
`;

export function PublicAnalytics() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: setup }} />
      <script defer src="/_vercel/insights/script.js" />
    </>
  );
}
