CREATE TABLE "MuseRun" (
  "id" TEXT PRIMARY KEY, "requestId" TEXT NOT NULL UNIQUE, "actorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "agent" TEXT NOT NULL, "intent" TEXT NOT NULL, "prompt" TEXT NOT NULL, "response" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MuseRun_actorId_createdAt_idx" ON "MuseRun"("actorId", "createdAt");
CREATE TABLE "MuseKnowledge" (
  "id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "content" TEXT NOT NULL, "source" TEXT NOT NULL,
  "agent" TEXT NOT NULL, "locale" TEXT NOT NULL, "actorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "active" BOOLEAN NOT NULL DEFAULT TRUE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MuseKnowledge_active_locale_agent_idx" ON "MuseKnowledge"("active", "locale", "agent");
CREATE TABLE "MuseTask" (
  "id" TEXT PRIMARY KEY, "title" TEXT NOT NULL, "goal" TEXT NOT NULL, "dueAt" DATE NOT NULL,
  "agent" TEXT NOT NULL, "actorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "done" BOOLEAN NOT NULL DEFAULT FALSE, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MuseTask_actorId_done_dueAt_idx" ON "MuseTask"("actorId", "done", "dueAt");
CREATE TABLE "MuseEvent" (
  "id" TEXT PRIMARY KEY, "actorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "kind" TEXT NOT NULL, "reference" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MuseEvent_actorId_createdAt_idx" ON "MuseEvent"("actorId", "createdAt");
CREATE TABLE "MuseDraft" (
  "id" TEXT PRIMARY KEY, "requestId" TEXT NOT NULL UNIQUE,
  "actorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT,
  "enquiryId" TEXT NOT NULL REFERENCES "Enquiry"("id") ON DELETE RESTRICT,
  "recipient" TEXT NOT NULL, "text" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "MuseDraft_actorId_createdAt_idx" ON "MuseDraft"("actorId", "createdAt");
CREATE FUNCTION "muse_immutable_audit"() RETURNS TRIGGER AS $$
BEGIN RAISE EXCEPTION 'Muse audit records are append-only'; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "MuseEvent_immutable" BEFORE UPDATE OR DELETE ON "MuseEvent" FOR EACH ROW EXECUTE FUNCTION "muse_immutable_audit"();
CREATE TRIGGER "MuseRun_immutable" BEFORE UPDATE OR DELETE ON "MuseRun" FOR EACH ROW EXECUTE FUNCTION "muse_immutable_audit"();
CREATE TRIGGER "MuseDraft_immutable" BEFORE UPDATE OR DELETE ON "MuseDraft" FOR EACH ROW EXECUTE FUNCTION "muse_immutable_audit"();
