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
