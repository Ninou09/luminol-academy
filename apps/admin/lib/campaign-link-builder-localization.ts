import type { Locale } from '@luminol/localization';

import type { CampaignLinkError } from './campaign-link-builder';

type Copy = {
  eyebrow: string;
  title: string;
  intro: string;
  back: string;
  pathname: string;
  pathnameHint: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  optional: string;
  build: string;
  result: string;
  resultHint: string;
  boundary: string;
  error: (error: CampaignLinkError) => string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: 'Acquisition operations',
    title: 'Campaign link builder',
    intro:
      'Build a consistent public relative path with the same UTM fields captured by enquiry attribution. Source is required; the other campaign fields are optional.',
    back: 'Back to operations',
    pathname: 'Public pathname',
    pathnameHint:
      'Example: /programmes. Enter a pathname only, without a query string or hash.',
    source: 'UTM source',
    medium: 'UTM medium',
    campaign: 'UTM campaign',
    content: 'UTM content',
    optional: 'Optional',
    build: 'Build tagged path',
    result: 'Generated tagged path',
    resultHint:
      'Select and copy this path into the public Luminol Academy URL you control.',
    boundary:
      'This utility only constructs supported UTM parameters. It does not track clicks, set cookies, deliver ads, prove conversions, measure ROI or infer lead quality.',
    error: (error) => {
      if (error === 'path-required') return 'Enter a public pathname.';
      if (error === 'path-too-long')
        return 'The pathname exceeds 240 characters.';
      if (error === 'path-unsafe')
        return 'Use a relative public pathname beginning with one slash and no query, hash, backslash, colon or whitespace.';
      if (error === 'source-required') return 'UTM source is required.';
      if (error === 'source-too-long')
        return 'UTM source exceeds 160 characters.';
      if (error === 'medium-too-long')
        return 'UTM medium exceeds 160 characters.';
      if (error === 'campaign-too-long')
        return 'UTM campaign exceeds 160 characters.';
      return 'UTM content exceeds 160 characters.';
    },
  },
  fr: {
    eyebrow: 'Opérations d’acquisition',
    title: 'Générateur de lien de campagne',
    intro:
      'Créez un chemin public relatif cohérent avec les mêmes champs UTM enregistrés pour l’attribution des demandes. La source est obligatoire ; les autres champs de campagne sont facultatifs.',
    back: 'Retour aux opérations',
    pathname: 'Chemin public',
    pathnameHint:
      'Exemple : /programmes. Saisissez uniquement un chemin, sans chaîne de requête ni ancre.',
    source: 'Source UTM',
    medium: 'Support UTM',
    campaign: 'Campagne UTM',
    content: 'Contenu UTM',
    optional: 'Facultatif',
    build: 'Créer le chemin balisé',
    result: 'Chemin balisé généré',
    resultHint:
      'Sélectionnez et copiez ce chemin dans l’URL publique de Luminol Academy que vous contrôlez.',
    boundary:
      'Cet outil construit uniquement les paramètres UTM pris en charge. Il ne suit pas les clics, ne dépose pas de cookies, ne diffuse pas de publicités, ne prouve pas les conversions, ne mesure pas le ROI et n’infère pas la qualité des prospects.',
    error: (error) => {
      if (error === 'path-required') return 'Saisissez un chemin public.';
      if (error === 'path-too-long') return 'Le chemin dépasse 240 caractères.';
      if (error === 'path-unsafe')
        return 'Utilisez un chemin public relatif commençant par une seule barre oblique, sans requête, ancre, barre oblique inverse, deux-points ni espace.';
      if (error === 'source-required') return 'La source UTM est obligatoire.';
      if (error === 'source-too-long')
        return 'La source UTM dépasse 160 caractères.';
      if (error === 'medium-too-long')
        return 'Le support UTM dépasse 160 caractères.';
      if (error === 'campaign-too-long')
        return 'La campagne UTM dépasse 160 caractères.';
      return 'Le contenu UTM dépasse 160 caractères.';
    },
  },
  ar: {
    eyebrow: 'عمليات الاستحواذ',
    title: 'منشئ رابط الحملة',
    intro:
      'أنشئ مسارًا عامًا نسبيًا ومتسقًا باستخدام حقول UTM نفسها التي يتم تسجيلها في إسناد الطلبات. المصدر مطلوب، أما بقية حقول الحملة فهي اختيارية.',
    back: 'العودة إلى العمليات',
    pathname: 'المسار العام',
    pathnameHint:
      'مثال: /programmes. أدخل المسار فقط من دون سلسلة استعلام أو علامة تجزئة.',
    source: 'مصدر UTM',
    medium: 'وسيط UTM',
    campaign: 'حملة UTM',
    content: 'محتوى UTM',
    optional: 'اختياري',
    build: 'إنشاء المسار الموسوم',
    result: 'المسار الموسوم الناتج',
    resultHint:
      'حدد هذا المسار وانسخه داخل عنوان Luminol Academy العام الذي تتحكم فيه.',
    boundary:
      'تقوم هذه الأداة بإنشاء معاملات UTM المدعومة فقط. وهي لا تتعقب النقرات ولا تضبط ملفات تعريف الارتباط ولا تنشر الإعلانات ولا تثبت التحويلات ولا تقيس العائد على الاستثمار ولا تستنتج جودة العملاء المحتملين.',
    error: (error) => {
      if (error === 'path-required') return 'أدخل مسارًا عامًا.';
      if (error === 'path-too-long') return 'يتجاوز المسار 240 حرفًا.';
      if (error === 'path-unsafe')
        return 'استخدم مسارًا عامًا نسبيًا يبدأ بشرطة مائلة واحدة ومن دون استعلام أو تجزئة أو شرطة مائلة عكسية أو نقطتين أو مسافات.';
      if (error === 'source-required') return 'مصدر UTM مطلوب.';
      if (error === 'source-too-long') return 'يتجاوز مصدر UTM عدد 160 حرفًا.';
      if (error === 'medium-too-long') return 'يتجاوز وسيط UTM عدد 160 حرفًا.';
      if (error === 'campaign-too-long')
        return 'تتجاوز حملة UTM عدد 160 حرفًا.';
      return 'يتجاوز محتوى UTM عدد 160 حرفًا.';
    },
  },
};

export function getCampaignLinkBuilderCopy(locale: Locale): Copy {
  return COPY[locale];
}
