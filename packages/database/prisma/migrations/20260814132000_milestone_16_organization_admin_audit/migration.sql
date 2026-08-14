-- Milestone 16 Slice C: privacy-minimized organization administration audit trail.
-- Audit rows record only actor, organization, action, and opaque subject identifiers;
-- no learner-authored content, assessment data, psychology content, enquiry text, or
-- finance payload is copied into the audit stream.
CREATE TABLE "OrganizationAuditEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "actorUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationAuditEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OrganizationAuditEvent_action_nonempty" CHECK (char_length("action") > 0),
    CONSTRAINT "OrganizationAuditEvent_subject_type_nonempty" CHECK (char_length("subjectType") > 0),
    CONSTRAINT "OrganizationAuditEvent_subject_id_nonempty" CHECK (char_length("subjectId") > 0)
);

CREATE INDEX "OrganizationAuditEvent_organizationId_createdAt_idx"
ON "OrganizationAuditEvent"("organizationId", "createdAt");

CREATE INDEX "OrganizationAuditEvent_actorUserId_createdAt_idx"
ON "OrganizationAuditEvent"("actorUserId", "createdAt");

CREATE INDEX "OrganizationAuditEvent_subjectType_subjectId_createdAt_idx"
ON "OrganizationAuditEvent"("subjectType", "subjectId", "createdAt");

ALTER TABLE "OrganizationAuditEvent"
ADD CONSTRAINT "OrganizationAuditEvent_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrganizationAuditEvent"
ADD CONSTRAINT "OrganizationAuditEvent_actorUserId_fkey"
FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- Audit history is append-only.
CREATE FUNCTION "prevent_organization_audit_event_mutation"() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Organization audit history is immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "OrganizationAuditEvent_update_guard"
BEFORE UPDATE ON "OrganizationAuditEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_organization_audit_event_mutation"();

CREATE TRIGGER "OrganizationAuditEvent_delete_guard"
BEFORE DELETE ON "OrganizationAuditEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_organization_audit_event_mutation"();
