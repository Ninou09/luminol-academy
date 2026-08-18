-- Milestone 20 Slice A: professional project submissions and auditable lifecycle persistence.
-- Existing domain lifecycle: DRAFT -> SUBMITTED -> IN_REVIEW -> REVISION_REQUIRED/APPROVED/REJECTED.

CREATE TYPE "ProfessionalSubmissionStatus" AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'REVISION_REQUIRED',
  'APPROVED',
  'REJECTED'
);

CREATE TABLE "ProfessionalProjectSubmission" (
  "id" TEXT NOT NULL,
  "learnerUserId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "enrollmentId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "status" "ProfessionalSubmissionStatus" NOT NULL DEFAULT 'DRAFT',
  "artifactUrl" TEXT,
  "reflection" TEXT,
  "reviewerUserId" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewStartedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProfessionalProjectSubmission_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProfessionalProjectSubmission_projectId_check"
    CHECK (length(btrim("projectId")) BETWEEN 1 AND 160),
  CONSTRAINT "ProfessionalProjectSubmission_reflection_check"
    CHECK ("reflection" IS NULL OR length("reflection") <= 5000),
  CONSTRAINT "ProfessionalProjectSubmission_artifactUrl_check"
    CHECK ("artifactUrl" IS NULL OR length("artifactUrl") <= 2048)
);

CREATE TABLE "ProfessionalSubmissionAuditEvent" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "fromStatus" "ProfessionalSubmissionStatus",
  "toStatus" "ProfessionalSubmissionStatus",
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProfessionalSubmissionAuditEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProfessionalSubmissionAuditEvent_action_check"
    CHECK (length(btrim("action")) BETWEEN 1 AND 120)
);

CREATE UNIQUE INDEX "ProfessionalProjectSubmission_learnerUserId_projectId_key"
  ON "ProfessionalProjectSubmission"("learnerUserId", "projectId");
CREATE INDEX "ProfessionalProjectSubmission_learnerUserId_status_updatedAt_idx"
  ON "ProfessionalProjectSubmission"("learnerUserId", "status", "updatedAt");
CREATE INDEX "ProfessionalProjectSubmission_reviewerUserId_status_updatedAt_idx"
  ON "ProfessionalProjectSubmission"("reviewerUserId", "status", "updatedAt");
CREATE INDEX "ProfessionalProjectSubmission_courseId_status_updatedAt_idx"
  ON "ProfessionalProjectSubmission"("courseId", "status", "updatedAt");
CREATE INDEX "ProfessionalSubmissionAuditEvent_submissionId_occurredAt_idx"
  ON "ProfessionalSubmissionAuditEvent"("submissionId", "occurredAt");
CREATE INDEX "ProfessionalSubmissionAuditEvent_actorUserId_occurredAt_idx"
  ON "ProfessionalSubmissionAuditEvent"("actorUserId", "occurredAt");

ALTER TABLE "ProfessionalProjectSubmission"
  ADD CONSTRAINT "ProfessionalProjectSubmission_learnerUserId_fkey"
  FOREIGN KEY ("learnerUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfessionalProjectSubmission"
  ADD CONSTRAINT "ProfessionalProjectSubmission_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfessionalProjectSubmission"
  ADD CONSTRAINT "ProfessionalProjectSubmission_enrollmentId_fkey"
  FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfessionalProjectSubmission"
  ADD CONSTRAINT "ProfessionalProjectSubmission_reviewerUserId_fkey"
  FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfessionalSubmissionAuditEvent"
  ADD CONSTRAINT "ProfessionalSubmissionAuditEvent_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "ProfessionalProjectSubmission"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfessionalSubmissionAuditEvent"
  ADD CONSTRAINT "ProfessionalSubmissionAuditEvent_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "enforce_professional_submission_scope"() RETURNS trigger AS $$
DECLARE
  enrollment_user_id TEXT;
  enrollment_course_id TEXT;
  enrollment_status "EnrollmentStatus";
  learner_deleted_at TIMESTAMP(3);
BEGIN
  SELECT enrollment."userId", enrollment."courseId", enrollment."status", learner."deletedAt"
  INTO enrollment_user_id, enrollment_course_id, enrollment_status, learner_deleted_at
  FROM "Enrollment" AS enrollment
  JOIN "User" AS learner ON learner."id" = enrollment."userId"
  WHERE enrollment."id" = NEW."enrollmentId";

  IF enrollment_user_id IS NULL THEN
    RAISE EXCEPTION 'Professional submission requires an existing enrollment';
  END IF;

  IF enrollment_user_id <> NEW."learnerUserId" OR enrollment_course_id <> NEW."courseId" THEN
    RAISE EXCEPTION 'Professional submission learner/course scope mismatch';
  END IF;

  IF learner_deleted_at IS NOT NULL THEN
    RAISE EXCEPTION 'Professional submission learner is unavailable';
  END IF;

  IF TG_OP = 'INSERT' AND enrollment_status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'Professional submission draft requires an active enrollment';
  END IF;

  IF NEW."status" = 'SUBMITTED' AND enrollment_status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'Professional submission requires an active enrollment';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ProfessionalProjectSubmission_scope"
BEFORE INSERT OR UPDATE OF "enrollmentId", "learnerUserId", "courseId", "status"
ON "ProfessionalProjectSubmission"
FOR EACH ROW EXECUTE FUNCTION "enforce_professional_submission_scope"();

CREATE FUNCTION "prevent_professional_submission_identity_change"() RETURNS trigger AS $$
BEGIN
  IF OLD."learnerUserId" <> NEW."learnerUserId"
    OR OLD."courseId" <> NEW."courseId"
    OR OLD."enrollmentId" <> NEW."enrollmentId"
    OR OLD."projectId" <> NEW."projectId" THEN
    RAISE EXCEPTION 'Professional submission scope is immutable';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ProfessionalProjectSubmission_immutable_scope"
BEFORE UPDATE OF "learnerUserId", "courseId", "enrollmentId", "projectId"
ON "ProfessionalProjectSubmission"
FOR EACH ROW EXECUTE FUNCTION "prevent_professional_submission_identity_change"();

CREATE FUNCTION "enforce_professional_submission_transition"() RETURNS trigger AS $$
BEGIN
  IF OLD."status" = NEW."status" THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD."status" = 'DRAFT' AND NEW."status" = 'SUBMITTED') OR
    (OLD."status" = 'SUBMITTED' AND NEW."status" IN ('IN_REVIEW', 'REJECTED')) OR
    (OLD."status" = 'IN_REVIEW' AND NEW."status" IN ('REVISION_REQUIRED', 'APPROVED', 'REJECTED')) OR
    (OLD."status" = 'REVISION_REQUIRED' AND NEW."status" = 'SUBMITTED')
  ) THEN
    RAISE EXCEPTION 'Invalid professional submission transition: % -> %', OLD."status", NEW."status";
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ProfessionalProjectSubmission_transition"
BEFORE UPDATE OF "status" ON "ProfessionalProjectSubmission"
FOR EACH ROW EXECUTE FUNCTION "enforce_professional_submission_transition"();

CREATE FUNCTION "enforce_professional_submission_content"() RETURNS trigger AS $$
BEGIN
  IF NEW."status" <> 'DRAFT' THEN
    IF NEW."artifactUrl" IS NULL OR NEW."artifactUrl" !~* '^https?://[^[:space:]]+$' THEN
      RAISE EXCEPTION 'Submitted professional work requires a valid HTTP(S) artifact URL';
    END IF;
    IF NEW."reflection" IS NULL OR length(btrim(NEW."reflection")) < 20 OR length(NEW."reflection") > 5000 THEN
      RAISE EXCEPTION 'Submitted professional work requires a reflection between 20 and 5000 characters';
    END IF;
  END IF;

  IF NEW."reviewerUserId" IS NOT NULL AND NEW."reviewerUserId" = NEW."learnerUserId" THEN
    RAISE EXCEPTION 'Professional submissions cannot be self-reviewed';
  END IF;

  IF NEW."status" IN ('IN_REVIEW', 'REVISION_REQUIRED', 'APPROVED', 'REJECTED')
    AND NEW."reviewerUserId" IS NULL THEN
    RAISE EXCEPTION 'Reviewed professional work requires an assigned reviewer';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ProfessionalProjectSubmission_content"
BEFORE INSERT OR UPDATE OF "status", "artifactUrl", "reflection", "reviewerUserId"
ON "ProfessionalProjectSubmission"
FOR EACH ROW EXECUTE FUNCTION "enforce_professional_submission_content"();