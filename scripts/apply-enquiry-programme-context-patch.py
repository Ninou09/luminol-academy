from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


# Prisma schema + migration
schema_path = Path('packages/database/prisma/schema.prisma')
schema = schema_path.read_text()
schema = replace_once(
    schema,
    '  timingPreference   EnquiryTimingPreference?\n  school             EnquirySchool\n  message            String\n',
    '  timingPreference   EnquiryTimingPreference?\n  school             EnquirySchool\n  programmeSlug      String?\n  programmeTitleSnapshot String?\n  message            String\n',
    'enquiry programme fields',
)
schema = replace_once(
    schema,
    '  @@index([ownerUserId, status, createdAt])\n  @@index([nextFollowUpAt, status])\n  @@index([email])\n',
    '  @@index([ownerUserId, status, createdAt])\n  @@index([nextFollowUpAt, status])\n  @@index([programmeSlug, createdAt])\n  @@index([email])\n',
    'enquiry programme index',
)
schema_path.write_text(schema)

migration_path = Path(
    'packages/database/prisma/migrations/20260829054500_enquiry_programme_context/migration.sql'
)
migration_path.parent.mkdir(parents=True, exist_ok=True)
migration_path.write_text(
    '''-- Capture a verified snapshot of the public programme that originated an enquiry.\nALTER TABLE "Enquiry"\nADD COLUMN "programmeSlug" TEXT,\nADD COLUMN "programmeTitleSnapshot" TEXT;\n\nALTER TABLE "Enquiry"\nADD CONSTRAINT "Enquiry_programme_context_check"\nCHECK (\n  ("programmeSlug" IS NULL AND "programmeTitleSnapshot" IS NULL)\n  OR (\n    "programmeSlug" IS NOT NULL\n    AND "programmeTitleSnapshot" IS NOT NULL\n    AND length(btrim("programmeSlug")) BETWEEN 1 AND 96\n    AND "programmeSlug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'\n    AND length(btrim("programmeTitleSnapshot")) BETWEEN 1 AND 120\n  )\n);\n\nCREATE INDEX "Enquiry_programmeSlug_createdAt_idx"\nON "Enquiry"("programmeSlug", "createdAt");\n'''
)

integration_test_path = Path(
    'packages/database/src/enquiry-programme-context.integration.test.ts'
)
integration_test_path.write_text(
    '''import { describe, expect, test } from 'vitest';\n\nimport { db } from './index';\n\nconst runDatabaseTests = Boolean(process.env.TEST_DATABASE_URL);\nconst suite = runDatabaseTests ? describe : describe.skip;\nconst suffix = `${process.pid}-${Date.now()}`;\n\nsuite('enquiry programme context persistence', () => {\n  test('persists a verified programme snapshot while keeping legacy rows nullable', async () => {\n    const enquiry = await db.enquiry.create({\n      data: {\n        id: `enquiry-programme-${suffix}`,\n        name: `Programme Context Test ${suffix}`,\n        email: `enquiry-programme-${suffix}@example.test`,\n        school: 'PSYCHOLOGY',\n        programmeSlug: 'acceptance-commitment-therapy',\n        programmeTitleSnapshot: 'Acceptance and Commitment Therapy',\n        message: 'I would like to ask about this programme and the next steps.',\n        consent: true,\n      },\n      select: { programmeSlug: true, programmeTitleSnapshot: true },\n    });\n\n    expect(enquiry).toEqual({\n      programmeSlug: 'acceptance-commitment-therapy',\n      programmeTitleSnapshot: 'Acceptance and Commitment Therapy',\n    });\n\n    const legacyCompatible = await db.enquiry.create({\n      data: {\n        id: `enquiry-programme-legacy-${suffix}`,\n        name: `Legacy Programme Context Test ${suffix}`,\n        email: `enquiry-programme-legacy-${suffix}@example.test`,\n        school: 'GENERAL',\n        message: 'This row verifies programme context remains optional.',\n        consent: true,\n      },\n      select: { programmeSlug: true, programmeTitleSnapshot: true },\n    });\n\n    expect(legacyCompatible).toEqual({\n      programmeSlug: null,\n      programmeTitleSnapshot: null,\n    });\n  });\n\n  test('rejects partial and oversized programme snapshots at the database boundary', async () => {\n    await expect(\n      db.enquiry.create({\n        data: {\n          id: `enquiry-programme-partial-${suffix}`,\n          name: `Partial Programme Context Test ${suffix}`,\n          email: `enquiry-programme-partial-${suffix}@example.test`,\n          school: 'GENERAL',\n          programmeSlug: 'programme-only',\n          message: 'This row should fail because the programme pair is partial.',\n          consent: true,\n        },\n      }),\n    ).rejects.toThrow();\n\n    await expect(\n      db.enquiry.create({\n        data: {\n          id: `enquiry-programme-oversized-${suffix}`,\n          name: `Oversized Programme Context Test ${suffix}`,\n          email: `enquiry-programme-oversized-${suffix}@example.test`,\n          school: 'GENERAL',\n          programmeSlug: 'bounded-programme',\n          programmeTitleSnapshot: 'x'.repeat(121),\n          message: 'This row should fail because the programme title is too long.',\n          consent: true,\n        },\n      }),\n    ).rejects.toThrow();\n  });\n});\n'''
)

# Validation
validation_path = Path('packages/validation/src/index.ts')
validation = validation_path.read_text()
validation = replace_once(
    validation,
    "export const enquiryTimingPreferenceSchema = z.enum([\n  'SOON',\n  'WITHIN_MONTH',\n  'LATER',\n  'NOT_SURE',\n]);\n",
    "export const enquiryTimingPreferenceSchema = z.enum([\n  'SOON',\n  'WITHIN_MONTH',\n  'LATER',\n  'NOT_SURE',\n]);\nexport const publicProgrammeSlugSchema = z\n  .string()\n  .trim()\n  .toLowerCase()\n  .min(1)\n  .max(96)\n  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);\n",
    'public programme slug schema',
)
validation = replace_once(
    validation,
    '    school: enquirySchoolSchema,\n    message: z.string().trim().min(10).max(2_000),\n',
    '    school: enquirySchoolSchema,\n    programmeSlug: publicProgrammeSlugSchema.optional(),\n    message: z.string().trim().min(10).max(2_000),\n',
    'contact programme slug',
)
validation_path.write_text(validation)

validation_test_path = Path('packages/validation/src/index.test.ts')
validation_test = validation_test_path.read_text()
validation_test = replace_once(
    validation_test,
    "  it('requires a phone number for phone and WhatsApp follow-up', () => {\n",
    "  it('accepts a bounded programme slug and rejects arbitrary offer text', () => {\n    const result = contactSchema.safeParse({\n      ...validEnquiry,\n      programmeSlug: 'Acceptance-Commitment-Therapy',\n    });\n    expect(result.success).toBe(true);\n    if (result.success) {\n      expect(result.data.programmeSlug).toBe('acceptance-commitment-therapy');\n    }\n\n    expect(\n      contactSchema.safeParse({\n        ...validEnquiry,\n        programmeSlug: 'not a valid programme slug',\n      }).success,\n    ).toBe(false);\n  });\n\n  it('requires a phone number for phone and WhatsApp follow-up', () => {\n",
    'programme slug validation test',
)
validation_test_path.write_text(validation_test)

# Public contact page + form
contact_page_path = Path('apps/web/app/contact/page.tsx')
contact_page = contact_page_path.read_text()
contact_page = replace_once(
    contact_page,
    '              initialSchool={enquiryDefaults?.school}\n              initialMessage={enquiryDefaults?.message}\n',
    '              initialSchool={enquiryDefaults?.school}\n              initialMessage={enquiryDefaults?.message}\n              initialProgrammeSlug={programme?.slug.current}\n',
    'contact form programme prop',
)
contact_page_path.write_text(contact_page)

form_path = Path('apps/web/components/enquiry-form.tsx')
form = form_path.read_text()
form = replace_once(
    form,
    '  initialSchool?: PublicEnquirySchool | undefined;\n  initialMessage?: string | undefined;\n};\n',
    '  initialSchool?: PublicEnquirySchool | undefined;\n  initialMessage?: string | undefined;\n  initialProgrammeSlug?: string | undefined;\n};\n',
    'form programme prop type',
)
form = replace_once(
    form,
    "  initialSchool = 'GENERAL',\n  initialMessage = '',\n}: EnquiryFormProps) {\n",
    "  initialSchool = 'GENERAL',\n  initialMessage = '',\n  initialProgrammeSlug,\n}: EnquiryFormProps) {\n",
    'form programme prop destructure',
)
form = replace_once(
    form,
    "          school: formData.get('school'),\n          message: formData.get('message'),\n",
    "          school: formData.get('school'),\n          programmeSlug: initialProgrammeSlug,\n          message: formData.get('message'),\n",
    'form programme payload',
)
form_path.write_text(form)

# Public API: re-verify the slug server-side and fail open to null context.
route_path = Path('apps/web/app/api/enquiries/route.ts')
route = route_path.read_text()
route = replace_once(
    route,
    "import { contactSchema } from '@luminol/validation';\n",
    "import { contactSchema } from '@luminol/validation';\n\nimport { getPublicProgrammeBySlug } from '../../../lib/programme-detail';\n",
    'route programme import',
)
route = replace_once(
    route,
    "  try {\n    await db.enquiry.create({\n",
    "  const programme = result.data.programmeSlug\n    ? await getPublicProgrammeBySlug(result.data.programmeSlug).catch(() => null)\n    : null;\n\n  try {\n    await db.enquiry.create({\n",
    'route programme verification',
)
route = replace_once(
    route,
    '        school: result.data.school,\n        message: result.data.message,\n',
    '        school: result.data.school,\n        programmeSlug: programme?.slug.current ?? null,\n        programmeTitleSnapshot: programme?.title ?? null,\n        message: result.data.message,\n',
    'route programme persistence',
)
route_path.write_text(route)

route_test_path = Path('apps/web/app/api/enquiries/route.test.ts')
route_test = route_test_path.read_text()
route_test = replace_once(
    route_test,
    "const { createEnquiry } = vi.hoisted(() => ({\n  createEnquiry: vi.fn(),\n}));\n",
    "const { createEnquiry, getPublicProgrammeBySlug } = vi.hoisted(() => ({\n  createEnquiry: vi.fn(),\n  getPublicProgrammeBySlug: vi.fn(),\n}));\n",
    'route test hoisted mocks',
)
route_test = replace_once(
    route_test,
    "vi.mock('@luminol/database', () => ({\n  db: { enquiry: { create: createEnquiry } },\n}));\n\nimport { POST } from './route';\n",
    "vi.mock('@luminol/database', () => ({\n  db: { enquiry: { create: createEnquiry } },\n}));\n\nvi.mock('../../../lib/programme-detail', () => ({\n  getPublicProgrammeBySlug,\n}));\n\nimport { POST } from './route';\n",
    'route test programme mock',
)
route_test = replace_once(
    route_test,
    "    createEnquiry.mockReset();\n    createEnquiry.mockResolvedValue({ id: 'enquiry_1' });\n",
    "    createEnquiry.mockReset();\n    createEnquiry.mockResolvedValue({ id: 'enquiry_1' });\n    getPublicProgrammeBySlug.mockReset();\n    getPublicProgrammeBySlug.mockResolvedValue(null);\n",
    'route test programme reset',
)
route_test = replace_once(
    route_test,
    '        school: validEnquiry.school,\n        message: validEnquiry.message,\n',
    '        school: validEnquiry.school,\n        programmeSlug: null,\n        programmeTitleSnapshot: null,\n        message: validEnquiry.message,\n',
    'route test generic programme fields',
)
route_test = replace_once(
    route_test,
    "  it('returns a safe error when persistence fails', async () => {\n",
    "  it('persists only server-verified public programme context', async () => {\n    getPublicProgrammeBySlug.mockResolvedValueOnce({\n      title: 'Acceptance and Commitment Therapy',\n      slug: { current: 'acceptance-commitment-therapy' },\n    });\n\n    const response = await POST(\n      createRequest(\n        {\n          ...validEnquiry,\n          programmeSlug: 'acceptance-commitment-therapy',\n        },\n        '203.0.113.21',\n      ),\n    );\n\n    expect(response.status).toBe(201);\n    expect(getPublicProgrammeBySlug).toHaveBeenCalledWith(\n      'acceptance-commitment-therapy',\n    );\n    expect(createEnquiry).toHaveBeenCalledWith({\n      data: expect.objectContaining({\n        programmeSlug: 'acceptance-commitment-therapy',\n        programmeTitleSnapshot: 'Acceptance and Commitment Therapy',\n      }),\n    });\n  });\n\n  it('keeps lead capture available when programme verification fails', async () => {\n    getPublicProgrammeBySlug.mockResolvedValueOnce(null);\n\n    const response = await POST(\n      createRequest(\n        { ...validEnquiry, programmeSlug: 'retired-programme' },\n        '203.0.113.22',\n      ),\n    );\n\n    expect(response.status).toBe(201);\n    expect(createEnquiry).toHaveBeenCalledWith({\n      data: expect.objectContaining({\n        programmeSlug: null,\n        programmeTitleSnapshot: null,\n      }),\n    });\n  });\n\n  it('returns a safe error when persistence fails', async () => {\n",
    'route test verified programme cases',
)
route_test_path.write_text(route_test)

# Protected admin desk display + localization.
localization_path = Path('apps/admin/lib/enquiry-desk-localization.ts')
localization = localization_path.read_text()
localization = replace_once(
    localization,
    '  school: string;\n  language: string;\n',
    '  school: string;\n  programmeContext: string;\n  language: string;\n',
    'admin programme localization type',
)
localization = replace_once(
    localization,
    "    school: 'School',\n    language: 'Language',\n",
    "    school: 'School',\n    programmeContext: 'Programme / offer',\n    language: 'Language',\n",
    'admin english programme copy',
)
localization = replace_once(
    localization,
    "    school: 'Pôle',\n    language: 'Langue',\n",
    "    school: 'Pôle',\n    programmeContext: 'Programme / offre',\n    language: 'Langue',\n",
    'admin french programme copy',
)
localization = replace_once(
    localization,
    "    school: 'المجال',\n    language: 'اللغة',\n",
    "    school: 'المجال',\n    programmeContext: 'البرنامج / العرض',\n    language: 'اللغة',\n",
    'admin arabic programme copy',
)
localization_path.write_text(localization)

localization_test_path = Path('apps/admin/lib/enquiry-desk-localization.test.ts')
localization_test = localization_test_path.read_text()
localization_test = replace_once(
    localization_test,
    "      city: 'City / area',\n      preferredContact: 'Preferred contact',\n",
    "      city: 'City / area',\n      programmeContext: 'Programme / offer',\n      preferredContact: 'Preferred contact',\n",
    'admin english programme copy test',
)
localization_test = replace_once(
    localization_test,
    "      city: 'Ville / région',\n      preferredContact: 'Contact préféré',\n",
    "      city: 'Ville / région',\n      programmeContext: 'Programme / offre',\n      preferredContact: 'Contact préféré',\n",
    'admin french programme copy test',
)
localization_test = replace_once(
    localization_test,
    "      city: 'المدينة / المنطقة',\n      preferredContact: 'وسيلة التواصل المفضلة',\n",
    "      city: 'المدينة / المنطقة',\n      programmeContext: 'البرنامج / العرض',\n      preferredContact: 'وسيلة التواصل المفضلة',\n",
    'admin arabic programme copy test',
)
localization_test_path.write_text(localization_test)

admin_page_path = Path('apps/admin/app/enquiries/page.tsx')
admin_page = admin_page_path.read_text()
admin_page = replace_once(
    admin_page,
    '        timingPreference: true,\n        school: true,\n        message: true,\n',
    '        timingPreference: true,\n        school: true,\n        programmeSlug: true,\n        programmeTitleSnapshot: true,\n        message: true,\n',
    'admin programme select',
)
admin_page = replace_once(
    admin_page,
    '''                      <div className={styles.metaItem}>\n                        <span>{copy.school}</span>\n                        <p>{getAdminEnumLabel(locale, enquiry.school)}</p>\n                      </div>\n                      <div className={styles.metaItem}>\n                        <span>{copy.language}</span>\n''',
    '''                      <div className={styles.metaItem}>\n                        <span>{copy.school}</span>\n                        <p>{getAdminEnumLabel(locale, enquiry.school)}</p>\n                      </div>\n                      <div className={styles.metaItem}>\n                        <span>{copy.programmeContext}</span>\n                        <p dir="auto">\n                          {enquiry.programmeTitleSnapshot ?? copy.notProvided}\n                        </p>\n                      </div>\n                      <div className={styles.metaItem}>\n                        <span>{copy.language}</span>\n''',
    'admin programme display',
)
admin_page_path.write_text(admin_page)
