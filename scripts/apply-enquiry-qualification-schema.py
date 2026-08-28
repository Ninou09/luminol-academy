from pathlib import Path

schema_path = Path('packages/database/prisma/schema.prisma')
schema = schema_path.read_text()

enum_anchor = '''enum EnquiryStatus {
  NEW
  IN_REVIEW
  CONTACTED
  CLOSED
  SPAM
}
'''
qualification_enums = enum_anchor + '''
enum EnquiryContactPreference {
  EMAIL
  PHONE
  WHATSAPP
}

enum EnquiryDeliveryPreference {
  IN_PERSON
  ONLINE
  FLEXIBLE
  NOT_SURE
}

enum EnquiryTimingPreference {
  SOON
  WITHIN_MONTH
  LATER
  NOT_SURE
}
'''
if schema.count(enum_anchor) != 1:
    raise SystemExit('Expected exactly one EnquiryStatus enum anchor')
schema = schema.replace(enum_anchor, qualification_enums, 1)

field_anchor = '''  email           String
  phone           String?
  school          EnquirySchool
'''
qualification_fields = '''  email              String
  phone              String?
  city               String?
  preferredContact   EnquiryContactPreference?
  deliveryPreference EnquiryDeliveryPreference?
  timingPreference   EnquiryTimingPreference?
  school             EnquirySchool
'''
if schema.count(field_anchor) != 1:
    raise SystemExit('Expected exactly one Enquiry contact field anchor')
schema = schema.replace(field_anchor, qualification_fields, 1)
schema_path.write_text(schema)

migration = Path(
    'packages/database/prisma/migrations/20260828232000_enquiry_qualification/migration.sql'
)
migration.parent.mkdir(parents=True, exist_ok=False)
migration.write_text('''-- Add backward-compatible structured routing preferences to public enquiries.
CREATE TYPE "EnquiryContactPreference" AS ENUM ('EMAIL', 'PHONE', 'WHATSAPP');
CREATE TYPE "EnquiryDeliveryPreference" AS ENUM ('IN_PERSON', 'ONLINE', 'FLEXIBLE', 'NOT_SURE');
CREATE TYPE "EnquiryTimingPreference" AS ENUM ('SOON', 'WITHIN_MONTH', 'LATER', 'NOT_SURE');

ALTER TABLE "Enquiry"
ADD COLUMN "city" TEXT,
ADD COLUMN "preferredContact" "EnquiryContactPreference",
ADD COLUMN "deliveryPreference" "EnquiryDeliveryPreference",
ADD COLUMN "timingPreference" "EnquiryTimingPreference";
''')

admin_path = Path('apps/admin/app/enquiries/page.tsx')
admin = admin_path.read_text()

import_anchor = "import { getEnquiryDeskCopy } from '../../lib/enquiry-desk-localization';"
import_replacement = '''import {
  getEnquiryContactPreferenceLabel,
  getEnquiryDeliveryPreferenceLabel,
  getEnquiryDeskCopy,
  getEnquiryTimingPreferenceLabel,
} from '../../lib/enquiry-desk-localization';'''
if admin.count(import_anchor) != 1:
    raise SystemExit('Expected exactly one enquiry desk import anchor')
admin = admin.replace(import_anchor, import_replacement, 1)

select_anchor = '''      email: true,
      phone: true,
      school: true,
'''
select_replacement = '''      email: true,
      phone: true,
      city: true,
      preferredContact: true,
      deliveryPreference: true,
      timingPreference: true,
      school: true,
'''
if admin.count(select_anchor) != 1:
    raise SystemExit('Expected exactly one enquiry select anchor')
admin = admin.replace(select_anchor, select_replacement, 1)

meta_anchor = '''                      <div className={styles.metaItem}>
                        <span>{copy.contact}</span>
                        <p dir="auto">{enquiry.phone || copy.noPhone}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.owner}</span>
'''
meta_replacement = '''                      <div className={styles.metaItem}>
                        <span>{copy.contact}</span>
                        <p dir="auto">{enquiry.phone || copy.noPhone}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.city}</span>
                        <p dir="auto">{enquiry.city || copy.notProvided}</p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.preferredContact}</span>
                        <p>
                          {getEnquiryContactPreferenceLabel(
                            locale,
                            enquiry.preferredContact,
                          )}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.deliveryPreference}</span>
                        <p>
                          {getEnquiryDeliveryPreferenceLabel(
                            locale,
                            enquiry.deliveryPreference,
                          )}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.timingPreference}</span>
                        <p>
                          {getEnquiryTimingPreferenceLabel(
                            locale,
                            enquiry.timingPreference,
                          )}
                        </p>
                      </div>
                      <div className={styles.metaItem}>
                        <span>{copy.owner}</span>
'''
if admin.count(meta_anchor) != 1:
    raise SystemExit('Expected exactly one enquiry metadata anchor')
admin = admin.replace(meta_anchor, meta_replacement, 1)
admin_path.write_text(admin)
