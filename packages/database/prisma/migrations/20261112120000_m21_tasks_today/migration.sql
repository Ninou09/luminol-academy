-- Milestone 21 Slice D: staff tasks and owner approval requests.
-- Approvals record a decision only; nothing here sends, publishes or spends.

CREATE TYPE "OperationsTaskKind" AS ENUM ('TASK', 'APPROVAL');
CREATE TYPE "OperationsTaskStatus" AS ENUM ('OPEN', 'DONE', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "OperationsTaskPriority" AS ENUM ('HIGH', 'NORMAL', 'LOW');
CREATE TYPE "OperationsTaskEventType" AS ENUM ('CREATED', 'STATUS_CHANGED');

CREATE TABLE "OperationsTask" (
  "id" TEXT NOT NULL,
  "kind" "OperationsTaskKind" NOT NULL,
  "title" TEXT NOT NULL,
  "details" TEXT,
  "assigneeUserId" TEXT,
  "dueOn" DATE,
  "priority" "OperationsTaskPriority" NOT NULL DEFAULT 'NORMAL',
  "status" "OperationsTaskStatus" NOT NULL DEFAULT 'OPEN',
  "decisionNote" TEXT,
  "clientId" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "decidedByUserId" TEXT,
  "closedAt" TIMESTAMP(3),
  "revision" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OperationsTask_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OperationsTask_kind_assignee" CHECK (
    ("kind" = 'TASK' AND "assigneeUserId" IS NOT NULL)
    OR ("kind" = 'APPROVAL' AND "assigneeUserId" IS NULL)
  ),
  CONSTRAINT "OperationsTask_kind_status" CHECK (
    ("kind" = 'TASK' AND "status" IN ('OPEN', 'DONE', 'CANCELLED'))
    OR ("kind" = 'APPROVAL' AND "status" IN ('OPEN', 'APPROVED', 'REJECTED', 'CANCELLED'))
  ),
  CONSTRAINT "OperationsTask_text_lengths" CHECK (
    char_length("title") BETWEEN 3 AND 160
    AND ("details" IS NULL OR char_length("details") <= 1000)
    AND ("decisionNote" IS NULL OR char_length("decisionNote") <= 240)
  )
);

CREATE TABLE "OperationsTaskEvent" (
  "id" TEXT NOT NULL,
  "taskId" TEXT NOT NULL,
  "eventType" "OperationsTaskEventType" NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "fromStatus" "OperationsTaskStatus",
  "toStatus" "OperationsTaskStatus" NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OperationsTaskEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OperationsTask_assigneeUserId_status_dueOn_idx" ON "OperationsTask"("assigneeUserId", "status", "dueOn");
CREATE INDEX "OperationsTask_kind_status_createdAt_idx" ON "OperationsTask"("kind", "status", "createdAt");
CREATE INDEX "OperationsTask_createdByUserId_status_idx" ON "OperationsTask"("createdByUserId", "status");
CREATE INDEX "OperationsTask_clientId_idx" ON "OperationsTask"("clientId");
CREATE INDEX "OperationsTaskEvent_taskId_occurredAt_idx" ON "OperationsTaskEvent"("taskId", "occurredAt");
CREATE INDEX "OperationsTaskEvent_actorUserId_occurredAt_idx" ON "OperationsTaskEvent"("actorUserId", "occurredAt");

ALTER TABLE "OperationsTask" ADD CONSTRAINT "OperationsTask_assigneeUserId_fkey" FOREIGN KEY ("assigneeUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperationsTask" ADD CONSTRAINT "OperationsTask_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperationsTask" ADD CONSTRAINT "OperationsTask_decidedByUserId_fkey" FOREIGN KEY ("decidedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperationsTask" ADD CONSTRAINT "OperationsTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperationsTaskEvent" ADD CONSTRAINT "OperationsTaskEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "OperationsTask"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "OperationsTaskEvent" ADD CONSTRAINT "OperationsTaskEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION "prevent_operations_task_event_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Operations task history is append-only';
END;
$$;

CREATE TRIGGER "OperationsTaskEvent_append_only_update"
BEFORE UPDATE ON "OperationsTaskEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_operations_task_event_mutation"();

CREATE TRIGGER "OperationsTaskEvent_append_only_delete"
BEFORE DELETE ON "OperationsTaskEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_operations_task_event_mutation"();

INSERT INTO "Permission" ("id", "key", "description") VALUES
  ('permission_task_work', 'task:work', 'Use the Today view, work own tasks and request owner approvals'),
  ('permission_task_manage', 'task:manage', 'Assign tasks to any staff member and see every task'),
  ('permission_approval_decide', 'approval:decide', 'Approve or reject approval requests (records a decision only)')
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT 'role_admin', "id" FROM "Permission" WHERE "key" IN ('task:work', 'task:manage', 'approval:decide')
ON CONFLICT DO NOTHING;

INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT "Role"."id", "Permission"."id"
FROM "Role", "Permission"
WHERE "Role"."key" IN ('consultant', 'enquiry-agent', 'staff') AND "Permission"."key" = 'task:work'
ON CONFLICT DO NOTHING;
