import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

async function replaceExact(path, before, after) {
  const current = await readFile(path, 'utf8');
  if (!current.includes(before)) {
    throw new Error(`Expected patch marker not found in ${path}`);
  }
  const occurrences = current.split(before).length - 1;
  if (occurrences !== 1) {
    throw new Error(
      `Expected exactly one patch marker in ${path}, found ${occurrences}`,
    );
  }
  await writeFile(path, current.replace(before, after));
}

async function writeNew(path, content) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, content);
}

await replaceExact(
  'packages/database/prisma/schema.prisma',
  `  source                 String                     @default("website")\n  ownerUserId            String?`,
  `  source                 String                     @default("website")\n  landingPath            String?\n  utmSource              String?\n  utmMedium              String?\n  utmCampaign            String?\n  utmContent             String?\n  ownerUserId            String?`,
);

await replaceExact(
  'packages/database/prisma/schema.prisma',
  `  @@index([programmeSlug, createdAt])\n  @@index([email])`,
  `  @@index([programmeSlug, createdAt])\n  @@index([utmSource, utmCampaign, createdAt])\n  @@index([email])`,
);

await writeNew(
  'packages/database/prisma/migrations/20260829101500_enquiry_campaign_attribution/migration.sql',
  `-- Add privacy-bounded campaign attribution to public enquiries.\nALTER TABLE "Enquiry"\nADD COLUMN "landingPath" TEXT,\nADD COLUMN "utmSource" TEXT,\nADD COLUMN "utmMedium" TEXT,\nADD COLUMN "utmCampaign" TEXT,\nADD COLUMN "utmContent" TEXT;\n\nCREATE INDEX "Enquiry_utmSource_utmCampaign_createdAt_idx"\nON "Enquiry"("utmSource", "utmCampaign", "createdAt");\n`,
);

await replaceExact(
  'packages/validation/src/index.ts',
  `export const publicProgrammeSlugSchema = z\n  .string()\n  .trim()\n  .toLowerCase()\n  .min(1)\n  .max(96)\n  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);\n\nexport const contactSchema = z`,
  `export const publicProgrammeSlugSchema = z\n  .string()\n  .trim()\n  .toLowerCase()\n  .min(1)\n  .max(96)\n  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);\n\nconst enquiryCampaignValueSchema = z.preprocess(\n  (value) =>\n    typeof value === 'string' && value.trim().length === 0\n      ? undefined\n      : value,\n  z.string().trim().min(1).max(160).optional(),\n);\n\nconst enquiryLandingPathSchema = z.preprocess(\n  (value) =>\n    typeof value === 'string' && value.trim().length === 0\n      ? undefined\n      : value,\n  z\n    .string()\n    .trim()\n    .min(1)\n    .max(240)\n    .regex(/^\\/[^?#\\s]*$/)\n    .optional(),\n);\n\nexport const contactSchema = z`,
);

await replaceExact(
  'packages/validation/src/index.ts',
  `    school: enquirySchoolSchema,\n    programmeSlug: publicProgrammeSlugSchema.optional(),\n    message: z.string().trim().min(10).max(2_000),`,
  `    school: enquirySchoolSchema,\n    programmeSlug: publicProgrammeSlugSchema.optional(),\n    landingPath: enquiryLandingPathSchema,\n    utmSource: enquiryCampaignValueSchema,\n    utmMedium: enquiryCampaignValueSchema,\n    utmCampaign: enquiryCampaignValueSchema,\n    utmContent: enquiryCampaignValueSchema,\n    message: z.string().trim().min(10).max(2_000),`,
);

await replaceExact(
  'packages/validation/src/index.test.ts',
  `  it('requires a phone number for phone and WhatsApp follow-up', () => {`,
  `  it('accepts bounded campaign attribution and normalizes blank values away', () => {\n    const result = contactSchema.safeParse({\n      ...validEnquiry,\n      landingPath: '/en/programmes/act',\n      utmSource: ' instagram ',\n      utmMedium: 'paid_social',\n      utmCampaign: 'august-psychology',\n      utmContent: 'reel-03',\n    });\n\n    expect(result.success).toBe(true);\n    if (result.success) {\n      expect(result.data).toMatchObject({\n        landingPath: '/en/programmes/act',\n        utmSource: 'instagram',\n        utmMedium: 'paid_social',\n        utmCampaign: 'august-psychology',\n        utmContent: 'reel-03',\n      });\n    }\n\n    const blank = contactSchema.safeParse({\n      ...validEnquiry,\n      landingPath: '',\n      utmSource: '   ',\n    });\n    expect(blank.success).toBe(true);\n    if (blank.success) {\n      expect(blank.data.landingPath).toBeUndefined();\n      expect(blank.data.utmSource).toBeUndefined();\n    }\n  });\n\n  it('rejects oversized campaign values and non-path landing context', () => {\n    expect(\n      contactSchema.safeParse({\n        ...validEnquiry,\n        utmCampaign: 'x'.repeat(161),\n      }).success,\n    ).toBe(false);\n    expect(\n      contactSchema.safeParse({\n        ...validEnquiry,\n        landingPath: 'https://example.com/en/contact?utm_source=test',\n      }).success,\n    ).toBe(false);\n  });\n\n  it('requires a phone number for phone and WhatsApp follow-up', () => {`,
);

await writeNew(
  'apps/web/lib/enquiry-attribution.ts',
  `export type EnquiryCampaignAttribution = {\n  landingPath?: string;\n  utmSource?: string;\n  utmMedium?: string;\n  utmCampaign?: string;\n  utmContent?: string;\n};\n\nconst CAMPAIGN_VALUE_LIMIT = 160;\nconst LANDING_PATH_LIMIT = 240;\n\nfunction boundedValue(value: string | null, limit: number) {\n  const normalized = value?.trim();\n  return normalized ? normalized.slice(0, limit) : undefined;\n}\n\nexport function getCurrentEnquiryAttribution(location: {\n  pathname: string;\n  search: string;\n}): EnquiryCampaignAttribution {\n  const search = new URLSearchParams(location.search);\n  const landingPath = location.pathname.startsWith('/')\n    ? location.pathname.slice(0, LANDING_PATH_LIMIT)\n    : undefined;\n\n  return {\n    landingPath: boundedValue(landingPath ?? null, LANDING_PATH_LIMIT),\n    utmSource: boundedValue(search.get('utm_source'), CAMPAIGN_VALUE_LIMIT),\n    utmMedium: boundedValue(search.get('utm_medium'), CAMPAIGN_VALUE_LIMIT),\n    utmCampaign: boundedValue(\n      search.get('utm_campaign'),\n      CAMPAIGN_VALUE_LIMIT,\n    ),\n    utmContent: boundedValue(search.get('utm_content'), CAMPAIGN_VALUE_LIMIT),\n  };\n}\n`,
);

await writeNew(
  'apps/web/lib/enquiry-attribution.test.ts',
  `import { describe, expect, it } from 'vitest';\n\nimport { getCurrentEnquiryAttribution } from './enquiry-attribution';\n\ndescribe('public enquiry campaign attribution', () => {\n  it('captures only supported current-page UTM values and pathname', () => {\n    expect(\n      getCurrentEnquiryAttribution({\n        pathname: '/fr/contact',\n        search:\n          '?utm_source=instagram&utm_medium=paid_social&utm_campaign=august-psychology&utm_content=reel-03&email=private%40example.com',\n      }),\n    ).toEqual({\n      landingPath: '/fr/contact',\n      utmSource: 'instagram',\n      utmMedium: 'paid_social',\n      utmCampaign: 'august-psychology',\n      utmContent: 'reel-03',\n    });\n  });\n\n  it('omits blank attribution and never stores the query string as landing context', () => {\n    expect(\n      getCurrentEnquiryAttribution({\n        pathname: '/ar/contact',\n        search: '?utm_source=%20%20&utm_campaign=',\n      }),\n    ).toEqual({\n      landingPath: '/ar/contact',\n      utmSource: undefined,\n      utmMedium: undefined,\n      utmCampaign: undefined,\n      utmContent: undefined,\n    });\n  });\n\n  it('bounds campaign values before submission', () => {\n    const attribution = getCurrentEnquiryAttribution({\n      pathname: \`/${'p'.repeat(300)}\`,\n      search: \`?utm_campaign=${'c'.repeat(220)}\`,\n    });\n\n    expect(attribution.landingPath).toHaveLength(240);\n    expect(attribution.utmCampaign).toHaveLength(160);\n  });\n});\n`,
);

await replaceExact(
  'apps/web/components/enquiry-form.tsx',
  `import { getEnquiryQualificationCopy } from '../lib/enquiry-qualification-localization';\nimport type { PublicEnquirySchool } from '../lib/programme-enquiry';`,
  `import { getCurrentEnquiryAttribution } from '../lib/enquiry-attribution';\nimport { getEnquiryQualificationCopy } from '../lib/enquiry-qualification-localization';\nimport type { PublicEnquirySchool } from '../lib/programme-enquiry';`,
);

await replaceExact(
  'apps/web/components/enquiry-form.tsx',
  `    const form = event.currentTarget;\n    const formData = new FormData(form);\n\n    setSubmission({ status: 'submitting', message: copy.sending });`,
  `    const form = event.currentTarget;\n    const formData = new FormData(form);\n    const attribution = getCurrentEnquiryAttribution({\n      pathname: window.location.pathname,\n      search: window.location.search,\n    });\n\n    setSubmission({ status: 'submitting', message: copy.sending });`,
);

await replaceExact(
  'apps/web/components/enquiry-form.tsx',
  `          school: formData.get('school'),\n          programmeSlug: initialProgrammeSlug,\n          message: formData.get('message'),`,
  `          school: formData.get('school'),\n          programmeSlug: initialProgrammeSlug,\n          ...attribution,\n          message: formData.get('message'),`,
);

await replaceExact(
  'apps/web/app/api/enquiries/route.ts',
  `        programmeSlug: programme?.slug.current ?? null,\n        programmeTitleSnapshot: programme?.title ?? null,\n        message: result.data.message,`,
  `        programmeSlug: programme?.slug.current ?? null,\n        programmeTitleSnapshot: programme?.title ?? null,\n        landingPath: result.data.landingPath ?? null,\n        utmSource: result.data.utmSource ?? null,\n        utmMedium: result.data.utmMedium ?? null,\n        utmCampaign: result.data.utmCampaign ?? null,\n        utmContent: result.data.utmContent ?? null,\n        message: result.data.message,`,
);

await writeNew(
  'apps/admin/lib/enquiry-attribution-localization.ts',
  `import type { Locale } from '@luminol/localization';\n\ntype EnquiryAttributionCopy = {\n  campaignAttribution: string;\n  landingPath: string;\n  source: string;\n  medium: string;\n  campaign: string;\n  content: string;\n};\n\nconst COPY: Record<Locale, EnquiryAttributionCopy> = {\n  en: {\n    campaignAttribution: 'Campaign attribution',\n    landingPath: 'Landing path',\n    source: 'source',\n    medium: 'medium',\n    campaign: 'campaign',\n    content: 'content',\n  },\n  fr: {\n    campaignAttribution: 'Attribution de campagne',\n    landingPath: \"Page d’arrivée\",\n    source: 'source',\n    medium: 'support',\n    campaign: 'campagne',\n    content: 'contenu',\n  },\n  ar: {\n    campaignAttribution: 'إسناد الحملة',\n    landingPath: 'مسار صفحة الوصول',\n    source: 'المصدر',\n    medium: 'الوسيط',\n    campaign: 'الحملة',\n    content: 'المحتوى',\n  },\n};\n\nexport function getEnquiryAttributionCopy(locale: Locale) {\n  return COPY[locale];\n}\n`,
);

await writeNew(
  'apps/admin/lib/enquiry-attribution-localization.test.ts',
  `import { describe, expect, it } from 'vitest';\n\nimport { getEnquiryAttributionCopy } from './enquiry-attribution-localization';\n\ndescribe('enquiry campaign attribution localization', () => {\n  it('labels protected attribution fields in every admin locale', () => {\n    expect(getEnquiryAttributionCopy('en')).toMatchObject({\n      campaignAttribution: 'Campaign attribution',\n      landingPath: 'Landing path',\n    });\n    expect(getEnquiryAttributionCopy('fr')).toMatchObject({\n      campaignAttribution: 'Attribution de campagne',\n      landingPath: \"Page d’arrivée\",\n    });\n    expect(getEnquiryAttributionCopy('ar')).toMatchObject({\n      campaignAttribution: 'إسناد الحملة',\n      landingPath: 'مسار صفحة الوصول',\n    });\n  });\n});\n`,
);

await replaceExact(
  'apps/admin/app/enquiries/page.tsx',
  `import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';\nimport { getAdminEnumLabel } from '../../lib/admin-localization';\nimport {`,
  `import { AdminLanguageSwitcher } from '../../components/admin-language-switcher';\nimport { getAdminEnumLabel } from '../../lib/admin-localization';\nimport { getEnquiryAttributionCopy } from '../../lib/enquiry-attribution-localization';\nimport {`,
);

await replaceExact(
  'apps/admin/app/enquiries/page.tsx',
  `  const locale = await getAdminRequestLocale();\n  const copy = getEnquiryDeskCopy(locale);\n  const incompleteQualificationLabel =`,
  `  const locale = await getAdminRequestLocale();\n  const copy = getEnquiryDeskCopy(locale);\n  const attributionCopy = getEnquiryAttributionCopy(locale);\n  const incompleteQualificationLabel =`,
);

await replaceExact(
  'apps/admin/app/enquiries/page.tsx',
  `        status: true,\n        source: true,\n        createdAt: true,`,
  `        status: true,\n        source: true,\n        landingPath: true,\n        utmSource: true,\n        utmMedium: true,\n        utmCampaign: true,\n        utmContent: true,\n        createdAt: true,`,
);

await replaceExact(
  'apps/admin/app/enquiries/page.tsx',
  `                const hasOutcome = Boolean(\n                  enquiry.outcome && enquiry.outcomeAt,\n                );\n                const firstResponseSteps =`,
  `                const hasOutcome = Boolean(\n                  enquiry.outcome && enquiry.outcomeAt,\n                );\n                const campaignAttribution = [\n                  enquiry.utmSource\n                    ? \`${'${attributionCopy.source}'}: ${'${enquiry.utmSource}'}\`\n                    : null,\n                  enquiry.utmMedium\n                    ? \`${'${attributionCopy.medium}'}: ${'${enquiry.utmMedium}'}\`\n                    : null,\n                  enquiry.utmCampaign\n                    ? \`${'${attributionCopy.campaign}'}: ${'${enquiry.utmCampaign}'}\`\n                    : null,\n                  enquiry.utmContent\n                    ? \`${'${attributionCopy.content}'}: ${'${enquiry.utmContent}'}\`\n                    : null,\n                ]\n                  .filter(Boolean)\n                  .join(' · ');\n                const firstResponseSteps =`,
);

await replaceExact(
  'apps/admin/app/enquiries/page.tsx',
  `                      <div className={styles.metaItem}>\n                        <span>{copy.source}</span>\n                        <p dir="auto">{enquiry.source}</p>\n                      </div>\n                      <div className={styles.metaItem}>\n                        <span>{copy.contact}</span>`,
  `                      <div className={styles.metaItem}>\n                        <span>{copy.source}</span>\n                        <p dir="auto">{enquiry.source}</p>\n                      </div>\n                      {campaignAttribution ? (\n                        <div className={styles.metaItem}>\n                          <span>{attributionCopy.campaignAttribution}</span>\n                          <p dir="auto">{campaignAttribution}</p>\n                        </div>\n                      ) : null}\n                      {enquiry.landingPath ? (\n                        <div className={styles.metaItem}>\n                          <span>{attributionCopy.landingPath}</span>\n                          <p dir="auto">{enquiry.landingPath}</p>\n                        </div>\n                      ) : null}\n                      <div className={styles.metaItem}>\n                        <span>{copy.contact}</span>`,
);

console.log('Campaign attribution patch applied.');
