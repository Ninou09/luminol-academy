-- Milestone 21 Slice A: governed staff roles and append-only role audit.

CREATE TYPE "StaffRoleAuditAction" AS ENUM ('GRANTED', 'REVOKED');

CREATE TABLE "StaffRoleAuditEvent" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "targetUserId" TEXT NOT NULL,
  "roleKey" TEXT NOT NULL,
  "action" "StaffRoleAuditAction" NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StaffRoleAuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StaffRoleAuditEvent_targetUserId_occurredAt_idx" ON "StaffRoleAuditEvent"("targetUserId", "occurredAt");
CREATE INDEX "StaffRoleAuditEvent_actorUserId_occurredAt_idx" ON "StaffRoleAuditEvent"("actorUserId", "occurredAt");
CREATE INDEX "StaffRoleAuditEvent_occurredAt_idx" ON "StaffRoleAuditEvent"("occurredAt");

ALTER TABLE "StaffRoleAuditEvent" ADD CONSTRAINT "StaffRoleAuditEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "StaffRoleAuditEvent" ADD CONSTRAINT "StaffRoleAuditEvent_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION "prevent_staff_role_audit_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Staff role audit history is append-only';
END;
$$;

CREATE TRIGGER "StaffRoleAuditEvent_append_only_update"
BEFORE UPDATE ON "StaffRoleAuditEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_staff_role_audit_mutation"();

CREATE TRIGGER "StaffRoleAuditEvent_append_only_delete"
BEFORE DELETE ON "StaffRoleAuditEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_staff_role_audit_mutation"();

INSERT INTO "Permission" ("id", "key", "description") VALUES
  ('permission_enquiry_work', 'enquiry:work', 'Work the enquiry desk: ownership, follow-up plans, outcomes and status'),
  ('permission_team_manage', 'team:manage', 'Grant and revoke governed staff roles')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "Role" ("id", "key", "name", "description", "updatedAt") VALUES
  ('role_enquiry_agent', 'enquiry-agent', 'Enquiry agent', 'Works consented enquiry follow-up; no finance, consultation or team access', CURRENT_TIMESTAMP)
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT 'role_admin', "id" FROM "Permission" WHERE "key" IN ('enquiry:work', 'team:manage')
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT "Role"."id", "Permission"."id"
FROM "Role", "Permission"
WHERE "Role"."key" = 'enquiry-agent' AND "Permission"."key" = 'enquiry:work'
ON CONFLICT DO NOTHING;
