from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected one anchor, found {count}')
    return text.replace(old, new, 1)


schema_path = Path('packages/database/prisma/schema.prisma')
schema = schema_path.read_text()
schema = replace_once(
    schema,
    '  enquiryFollowUpEvents       EnquiryFollowUpEvent[]       @relation("EnquiryFollowUpActor")\n',
    '  enquiryFollowUpEvents       EnquiryFollowUpEvent[]       @relation("EnquiryFollowUpActor")\n'
    '  enquiryOutcomeEvents        EnquiryOutcomeEvent[]        @relation("EnquiryOutcomeActor")\n',
    'user outcome relation',
)
schema = replace_once(
    schema,
    '  nextFollowUpAt     DateTime?\n  nextAction         String?\n  createdAt          DateTime                   @default(now())\n',
    '  nextFollowUpAt     DateTime?\n  nextAction         String?\n  outcome            String?\n  outcomeAt          DateTime?\n  createdAt          DateTime                   @default(now())\n',
    'enquiry outcome fields',
)
schema = replace_once(
    schema,
    '  followUpEvents     EnquiryFollowUpEvent[]\n\n  @@index([status, createdAt])\n',
    '  followUpEvents     EnquiryFollowUpEvent[]\n  outcomeEvents      EnquiryOutcomeEvent[]\n\n  @@index([status, createdAt])\n',
    'enquiry outcome relation',
)
outcome_model = '''model EnquiryOutcomeEvent {
  id            String    @id @default(cuid())
  enquiryId     String
  actorUserId   String
  fromOutcome   String?
  toOutcome     String?
  fromOutcomeAt DateTime?
  toOutcomeAt   DateTime?
  createdAt     DateTime  @default(now())
  enquiry       Enquiry   @relation(fields: [enquiryId], references: [id], onDelete: Cascade)
  actor         User      @relation("EnquiryOutcomeActor", fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([enquiryId, createdAt])
  @@index([actorUserId, createdAt])
}

'''
schema = replace_once(
    schema,
    'model SearchTelemetryDaily {\n',
    outcome_model + 'model SearchTelemetryDaily {\n',
    'outcome event model',
)
schema_path.write_text(schema)

migration = Path(
    'packages/database/prisma/migrations/20260828234500_enquiry_outcome/migration.sql'
)
migration.parent.mkdir(parents=True, exist_ok=False)
migration.write_text('''-- Add a protected, auditable operational outcome to enquiries.
ALTER TABLE "Enquiry"
ADD COLUMN "outcome" TEXT,
ADD COLUMN "outcomeAt" TIMESTAMP(3);

ALTER TABLE "Enquiry"
ADD CONSTRAINT "Enquiry_outcome_pair_check"
CHECK (
  ("outcome" IS NULL AND "outcomeAt" IS NULL)
  OR (
    "outcome" IS NOT NULL
    AND "outcomeAt" IS NOT NULL
    AND length(btrim("outcome")) BETWEEN 1 AND 240
  )
);

CREATE TABLE "EnquiryOutcomeEvent" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "fromOutcome" TEXT,
    "toOutcome" TEXT,
    "fromOutcomeAt" TIMESTAMP(3),
    "toOutcomeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryOutcomeEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "EnquiryOutcomeEvent_from_pair_check" CHECK (
      ("fromOutcome" IS NULL AND "fromOutcomeAt" IS NULL)
      OR (
        "fromOutcome" IS NOT NULL
        AND "fromOutcomeAt" IS NOT NULL
        AND length(btrim("fromOutcome")) BETWEEN 1 AND 240
      )
    ),
    CONSTRAINT "EnquiryOutcomeEvent_to_pair_check" CHECK (
      ("toOutcome" IS NULL AND "toOutcomeAt" IS NULL)
      OR (
        "toOutcome" IS NOT NULL
        AND "toOutcomeAt" IS NOT NULL
        AND length(btrim("toOutcome")) BETWEEN 1 AND 240
      )
    )
);

CREATE INDEX "EnquiryOutcomeEvent_enquiryId_createdAt_idx"
ON "EnquiryOutcomeEvent"("enquiryId", "createdAt");

CREATE INDEX "EnquiryOutcomeEvent_actorUserId_createdAt_idx"
ON "EnquiryOutcomeEvent"("actorUserId", "createdAt");

ALTER TABLE "EnquiryOutcomeEvent"
ADD CONSTRAINT "EnquiryOutcomeEvent_enquiryId_fkey"
FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EnquiryOutcomeEvent"
ADD CONSTRAINT "EnquiryOutcomeEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "prevent_enquiry_outcome_event_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Enquiry outcome history is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "EnquiryOutcomeEvent_append_only"
BEFORE UPDATE OR DELETE ON "EnquiryOutcomeEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_enquiry_outcome_event_mutation"();
''')

localization_path = Path('apps/admin/lib/enquiry-desk-localization.ts')
localization = localization_path.read_text()
localization = replace_once(
    localization,
    '  saveFollowUp: string;\n  clearFollowUp: string;\n  updateStatus: string;\n',
    '  saveFollowUp: string;\n  clearFollowUp: string;\n  outcome: string;\n  outcomeRecorded: string;\n  noOutcome: string;\n  outcomeGuidance: string;\n  saveOutcome: string;\n  clearOutcome: string;\n  updateStatus: string;\n',
    'outcome localization type',
)
localization = replace_once(
    localization,
    "    saveFollowUp: 'Save follow-up',\n    clearFollowUp: 'Clear follow-up',\n    updateStatus: 'Update enquiry status',\n",
    "    saveFollowUp: 'Save follow-up',\n    clearFollowUp: 'Clear follow-up',\n    outcome: 'Operational outcome',\n    outcomeRecorded: 'Recorded',\n    noOutcome: 'No operational outcome recorded',\n    outcomeGuidance:\n      'Record only the operational result of follow-up. Do not add clinical notes, diagnoses, symptoms or treatment decisions.',\n    saveOutcome: 'Save outcome',\n    clearOutcome: 'Clear outcome',\n    updateStatus: 'Update enquiry status',\n",
    'english outcome copy',
)
localization = replace_once(
    localization,
    "    saveFollowUp: 'Enregistrer le suivi',\n    clearFollowUp: 'Effacer le suivi',\n    updateStatus: 'Modifier le statut de la demande',\n",
    "    saveFollowUp: 'Enregistrer le suivi',\n    clearFollowUp: 'Effacer le suivi',\n    outcome: 'Résultat opérationnel',\n    outcomeRecorded: 'Enregistré le',\n    noOutcome: 'Aucun résultat opérationnel enregistré',\n    outcomeGuidance:\n      'Indiquez uniquement le résultat opérationnel du suivi. N’ajoutez pas de notes cliniques, diagnostics, symptômes ou décisions thérapeutiques.',\n    saveOutcome: 'Enregistrer le résultat',\n    clearOutcome: 'Effacer le résultat',\n    updateStatus: 'Modifier le statut de la demande',\n",
    'french outcome copy',
)
localization = replace_once(
    localization,
    "    saveFollowUp: 'حفظ المتابعة',\n    clearFollowUp: 'مسح المتابعة',\n    updateStatus: 'تحديث حالة الطلب',\n",
    "    saveFollowUp: 'حفظ المتابعة',\n    clearFollowUp: 'مسح المتابعة',\n    outcome: 'النتيجة التشغيلية',\n    outcomeRecorded: 'تاريخ التسجيل',\n    noOutcome: 'لم تُسجل نتيجة تشغيلية',\n    outcomeGuidance:\n      'سجّل فقط النتيجة التشغيلية للمتابعة. لا تضف ملاحظات سريرية أو تشخيصات أو أعراضًا أو قرارات علاجية.',\n    saveOutcome: 'حفظ النتيجة',\n    clearOutcome: 'مسح النتيجة',\n    updateStatus: 'تحديث حالة الطلب',\n",
    'arabic outcome copy',
)
localization_path.write_text(localization)

page_path = Path('apps/admin/app/enquiries/page.tsx')
page = page_path.read_text()
page = replace_once(
    page,
    '  transitionEnquiryStatus,\n  updateEnquiryFollowUpPlan,\n  updateEnquiryOwnership,\n',
    '  transitionEnquiryStatus,\n  updateEnquiryFollowUpPlan,\n  updateEnquiryOutcome,\n  updateEnquiryOwnership,\n',
    'outcome action import',
)
page = replace_once(
    page,
    '      nextFollowUpAt: true,\n      nextAction: true,\n      owner: {\n',
    '      nextFollowUpAt: true,\n      nextAction: true,\n      outcome: true,\n      outcomeAt: true,\n      owner: {\n',
    'outcome select',
)
page = replace_once(
    page,
    '                const hasFollowUpPlan = Boolean(\n                  enquiry.nextFollowUpAt && enquiry.nextAction,\n                );\n\n                return (\n',
    '                const hasFollowUpPlan = Boolean(\n                  enquiry.nextFollowUpAt && enquiry.nextAction,\n                );\n                const hasOutcome = Boolean(enquiry.outcome && enquiry.outcomeAt);\n\n                return (\n',
    'outcome state',
)
outcome_section = '''                    <section className={styles.followUpBlock}>
                      <div className={styles.followUpHeading}>
                        <div>
                          <span className={styles.messageLabel}>
                            {copy.outcome}
                          </span>
                          <p dir="auto">{enquiry.outcome || copy.noOutcome}</p>
                          {enquiry.outcomeAt ? (
                            <p className={styles.privacyNote}>
                              {copy.outcomeRecorded}: {date(enquiry.outcomeAt)}
                            </p>
                          ) : null}
                          <p className={styles.privacyNote}>
                            {copy.outcomeGuidance}
                          </p>
                        </div>
                      </div>
                      <form
                        action={updateEnquiryOutcome}
                        className={styles.followUpForm}
                      >
                        <input
                          type="hidden"
                          name="enquiryId"
                          value={enquiry.id}
                        />
                        <input type="hidden" name="operation" value="save" />
                        <label className={styles.followUpField}>
                          <span>{copy.outcome}</span>
                          <input
                            type="text"
                            name="outcome"
                            defaultValue={enquiry.outcome ?? ''}
                            maxLength={240}
                            required
                            dir="auto"
                          />
                        </label>
                        <button type="submit">{copy.saveOutcome}</button>
                      </form>
                      {hasOutcome ? (
                        <form action={updateEnquiryOutcome}>
                          <input
                            type="hidden"
                            name="enquiryId"
                            value={enquiry.id}
                          />
                          <input type="hidden" name="operation" value="clear" />
                          <button
                            className={styles.clearFollowUpButton}
                            type="submit"
                          >
                            {copy.clearOutcome}
                          </button>
                        </form>
                      ) : null}
                    </section>

'''
page = replace_once(
    page,
    '                    <div className={styles.statusRow}>\n',
    outcome_section + '                    <div className={styles.statusRow}>\n',
    'outcome admin section',
)
page_path.write_text(page)

test_path = Path('apps/admin/lib/enquiry-desk-localization.test.ts')
test = test_path.read_text()
test = replace_once(
    test,
    "      saveFollowUp: 'Save follow-up',\n",
    "      saveFollowUp: 'Save follow-up',\n      outcome: 'Operational outcome',\n      saveOutcome: 'Save outcome',\n",
    'english outcome test',
)
test = replace_once(
    test,
    "      saveFollowUp: 'Enregistrer le suivi',\n",
    "      saveFollowUp: 'Enregistrer le suivi',\n      outcome: 'Résultat opérationnel',\n      saveOutcome: 'Enregistrer le résultat',\n",
    'french outcome test',
)
test = replace_once(
    test,
    "      saveFollowUp: 'حفظ المتابعة',\n",
    "      saveFollowUp: 'حفظ المتابعة',\n      outcome: 'النتيجة التشغيلية',\n      saveOutcome: 'حفظ النتيجة',\n",
    'arabic outcome test',
)
test_path.write_text(test)

integration_path = Path('packages/database/src/enquiry-outcome.integration.test.ts')
integration = integration_path.read_text()
integration = replace_once(
    integration,
    "  test('rejects partial and blank outcome pairs at the database boundary', async () => {\n",
    "  test('rejects partial, blank and oversized outcome pairs at the database boundary', async () => {\n",
    'outcome invariant test title',
)
integration = replace_once(
    integration,
    "    await expect(\n      db.enquiry.create({\n        data: {\n          id: `enquiry-outcome-blank-${suffix}`,\n          name: `Outcome Blank Test ${suffix}`,\n          email: `enquiry-outcome-blank-${suffix}@example.test`,\n          school: 'GENERAL',\n          message: 'This row should fail because the outcome text is blank.',\n          consent: true,\n          outcome: '   ',\n          outcomeAt: new Date('2026-08-28T12:00:00.000Z'),\n        },\n      }),\n    ).rejects.toThrow();\n",
    "    await expect(\n      db.enquiry.create({\n        data: {\n          id: `enquiry-outcome-blank-${suffix}`,\n          name: `Outcome Blank Test ${suffix}`,\n          email: `enquiry-outcome-blank-${suffix}@example.test`,\n          school: 'GENERAL',\n          message: 'This row should fail because the outcome text is blank.',\n          consent: true,\n          outcome: '   ',\n          outcomeAt: new Date('2026-08-28T12:00:00.000Z'),\n        },\n      }),\n    ).rejects.toThrow();\n\n    await expect(\n      db.enquiry.create({\n        data: {\n          id: `enquiry-outcome-oversized-${suffix}`,\n          name: `Outcome Oversized Test ${suffix}`,\n          email: `enquiry-outcome-oversized-${suffix}@example.test`,\n          school: 'GENERAL',\n          message: 'This row should fail because the outcome text is too long.',\n          consent: true,\n          outcome: 'x'.repeat(241),\n          outcomeAt: new Date('2026-08-28T12:00:00.000Z'),\n        },\n      }),\n    ).rejects.toThrow();\n",
    'oversized outcome database test',
)
integration_path.write_text(integration)
