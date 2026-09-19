// Explicitly opt-in, process-local CMS transport for browser tests. This file
// is never imported by the application or a production start command.
if (
  process.env.LUMINOL_PROGRAMME_FIXTURE !== 'isolated-browser-test' ||
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID !== 'e2eprogrammefixture'
) {
  throw new Error('Programme fixture requires its isolated test environment.');
}

const nativeFetch = globalThis.fetch;
const programme = {
  _id: 'fixture-act-not-live',
  title: 'العلاج بالتقبل والالتزام ACT',
  summary:
    'بيانات اختبار لصفحة برنامج تدريبي، مخصصة للتحقق من وضوح المعلومات وروابط الاستفسار في بيئة الاختبار فقط.',
  slug: { current: 'acceptance-commitment-therapy-act' },
  school: 'psychology',
  languages: ['ar'],
  delivery: null,
  featured: false,
  image: null,
  localizedCopy: null,
  bodyText: '',
  outcomes: ['مخرجات اختبار لصفحة البرنامج'],
  audience: ['الفئة المستهدفة في بيانات الاختبار'],
};

globalThis.fetch = async function programmeFixtureFetch(input, init) {
  const url = new URL(
    typeof input === 'string' || input instanceof URL ? input : input.url,
  );
  if (url.hostname !== 'e2eprogrammefixture.api.sanity.io') {
    return nativeFetch(input, init);
  }
  const method = init?.method ?? input?.method ?? 'GET';
  if (method !== 'GET' || url.pathname !== '/v2024-01-01/data/query/fixtures') {
    throw new Error('Unexpected request to the isolated programme fixture.');
  }
  const query = url.searchParams.get('query') ?? '';
  if (!query.includes('programme')) {
    throw new Error('Unexpected CMS query in programme browser fixture.');
  }
  const slug = JSON.parse(url.searchParams.get('$slug') ?? 'null');
  const school = JSON.parse(url.searchParams.get('$school') ?? 'null');
  const result =
    slug !== null
      ? slug === programme.slug.current
        ? programme
        : null
      : school !== null && school !== programme.school
        ? []
        : [programme];
  return new Response(JSON.stringify({ result }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
