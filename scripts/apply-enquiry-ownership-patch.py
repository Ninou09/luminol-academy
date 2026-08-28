from pathlib import Path

schema = Path('packages/database/prisma/schema.prisma')
text = schema.read_text()

old_user = '''  certificates                Certificate[]
  enquiryStatusEvents         EnquiryStatusEvent[]
  enrollmentStatusEvents      EnrollmentStatusEvent[]'''
new_user = '''  certificates                Certificate[]
  assignedEnquiries           Enquiry[]                    @relation("EnquiryOwner")
  enquiryStatusEvents         EnquiryStatusEvent[]
  enquiryOwnershipEvents      EnquiryOwnershipEvent[]      @relation("EnquiryOwnershipActor")
  enrollmentStatusEvents      EnrollmentStatusEvent[]'''
if old_user not in text:
    raise SystemExit('User enquiry relation anchor not found')
text = text.replace(old_user, new_user, 1)

old_enquiry = '''model Enquiry {
  id           String               @id @default(cuid())
  name         String
  email        String
  phone        String?
  school       EnquirySchool
  message      String
  locale       String               @default("en")
  consent      Boolean
  status       EnquiryStatus        @default(NEW)
  source       String               @default("website")
  createdAt    DateTime             @default(now())
  updatedAt    DateTime             @updatedAt
  statusEvents EnquiryStatusEvent[]

  @@index([status, createdAt])
  @@index([email])
  @@index([name(ops: raw("gin_trgm_ops"))], type: Gin, map: "Enquiry_name_trgm_idx")
  @@index([email(ops: raw("gin_trgm_ops"))], type: Gin, map: "Enquiry_email_trgm_idx")
}

model EnquiryStatusEvent {
  id          String        @id @default(cuid())
  enquiryId   String
  actorUserId String
  fromStatus  EnquiryStatus
  toStatus    EnquiryStatus
  createdAt   DateTime      @default(now())
  enquiry     Enquiry       @relation(fields: [enquiryId], references: [id], onDelete: Cascade)
  actor       User          @relation(fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([enquiryId, createdAt])
  @@index([actorUserId, createdAt])
}
'''
new_enquiry = '''model Enquiry {
  id              String                  @id @default(cuid())
  name            String
  email           String
  phone           String?
  school          EnquirySchool
  message         String
  locale          String                  @default("en")
  consent         Boolean
  status          EnquiryStatus           @default(NEW)
  source          String                  @default("website")
  ownerUserId     String?
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt
  owner           User?                   @relation("EnquiryOwner", fields: [ownerUserId], references: [id], onDelete: SetNull)
  statusEvents    EnquiryStatusEvent[]
  ownershipEvents EnquiryOwnershipEvent[]

  @@index([status, createdAt])
  @@index([ownerUserId, status, createdAt])
  @@index([email])
  @@index([name(ops: raw("gin_trgm_ops"))], type: Gin, map: "Enquiry_name_trgm_idx")
  @@index([email(ops: raw("gin_trgm_ops"))], type: Gin, map: "Enquiry_email_trgm_idx")
}

model EnquiryStatusEvent {
  id          String        @id @default(cuid())
  enquiryId   String
  actorUserId String
  fromStatus  EnquiryStatus
  toStatus    EnquiryStatus
  createdAt   DateTime      @default(now())
  enquiry     Enquiry       @relation(fields: [enquiryId], references: [id], onDelete: Cascade)
  actor       User          @relation(fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([enquiryId, createdAt])
  @@index([actorUserId, createdAt])
}

model EnquiryOwnershipEvent {
  id              String   @id @default(cuid())
  enquiryId       String
  actorUserId     String
  fromOwnerUserId String?
  toOwnerUserId   String?
  createdAt       DateTime @default(now())
  enquiry         Enquiry  @relation(fields: [enquiryId], references: [id], onDelete: Cascade)
  actor           User     @relation("EnquiryOwnershipActor", fields: [actorUserId], references: [id], onDelete: Restrict)

  @@index([enquiryId, createdAt])
  @@index([actorUserId, createdAt])
}
'''
if old_enquiry not in text:
    raise SystemExit('Enquiry model anchor not found')
text = text.replace(old_enquiry, new_enquiry, 1)
schema.write_text(text)

migration = Path('packages/database/prisma/migrations/20260828221500_enquiry_ownership/migration.sql')
migration.parent.mkdir(parents=True, exist_ok=True)
migration.write_text('''-- Add internal ownership to enquiries without changing public enquiry collection.
ALTER TABLE "Enquiry"
ADD COLUMN "ownerUserId" TEXT;

CREATE INDEX "Enquiry_ownerUserId_status_createdAt_idx"
ON "Enquiry"("ownerUserId", "status", "createdAt");

ALTER TABLE "Enquiry"
ADD CONSTRAINT "Enquiry_ownerUserId_fkey"
FOREIGN KEY ("ownerUserId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "EnquiryOwnershipEvent" (
    "id" TEXT NOT NULL,
    "enquiryId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "fromOwnerUserId" TEXT,
    "toOwnerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnquiryOwnershipEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EnquiryOwnershipEvent_enquiryId_createdAt_idx"
ON "EnquiryOwnershipEvent"("enquiryId", "createdAt");

CREATE INDEX "EnquiryOwnershipEvent_actorUserId_createdAt_idx"
ON "EnquiryOwnershipEvent"("actorUserId", "createdAt");

ALTER TABLE "EnquiryOwnershipEvent"
ADD CONSTRAINT "EnquiryOwnershipEvent_enquiryId_fkey"
FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EnquiryOwnershipEvent"
ADD CONSTRAINT "EnquiryOwnershipEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "prevent_enquiry_ownership_event_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Enquiry ownership history is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "EnquiryOwnershipEvent_append_only"
BEFORE UPDATE OR DELETE ON "EnquiryOwnershipEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_enquiry_ownership_event_mutation"();
''')
