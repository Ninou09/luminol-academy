-- Milestone 20 Slice D: append-only human review history for professional project submissions.
-- Review outcomes reuse the existing ProfessionalSubmissionStatus lifecycle and are derived
-- from the existing human-entered score/revision contract. No automated grading provider is introduced.

CREATE TABLE "ProfessionalSubmissionReview" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "reviewerUserId" TEXT NOT NULL,
  "score" INTEGER NOT NULL,
  "feedback" TEXT NOT NULL,
  "requiresRevision" BOOLEAN NOT NULL,
  "fromStatus" "ProfessionalSubmissionStatus" NOT NULL,
  "toStatus" "ProfessionalSubmissionStatus" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ProfessionalSubmissionReview_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProfessionalSubmissionReview_score_check"
    CHECK ("score" BETWEEN 0 AND 100),
  CONSTRAINT "ProfessionalSubmissionReview_feedback_check"
    CHECK (length(btrim("feedback")) BETWEEN 10 AND 5000),
  CONSTRAINT "ProfessionalSubmissionReview_from_status_check"
    CHECK ("fromStatus" = 'IN_REVIEW'::"ProfessionalSubmissionStatus"),
  CONSTRAINT "ProfessionalSubmissionReview_outcome_check"
    CHECK (
      ("requiresRevision" = true AND "toStatus" = 'REVISION_REQUIRED'::"ProfessionalSubmissionStatus")
      OR
      ("requiresRevision" = false AND "score" >= 70 AND "toStatus" = 'APPROVED'::"ProfessionalSubmissionStatus")
      OR
      ("requiresRevision" = false AND "score" < 70 AND "toStatus" = 'REJECTED'::"ProfessionalSubmissionStatus")
    )
);

CREATE INDEX "ProfessionalSubmissionReview_submissionId_createdAt_idx"
  ON "ProfessionalSubmissionReview"("submissionId", "createdAt");
CREATE INDEX "ProfessionalSubmissionReview_reviewerUserId_createdAt_idx"
  ON "ProfessionalSubmissionReview"("reviewerUserId", "createdAt");

ALTER TABLE "ProfessionalSubmissionReview"
  ADD CONSTRAINT "ProfessionalSubmissionReview_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "ProfessionalProjectSubmission"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProfessionalSubmissionReview"
  ADD CONSTRAINT "ProfessionalSubmissionReview_reviewerUserId_fkey"
  FOREIGN KEY ("reviewerUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "enforce_professional_submission_review_scope"() RETURNS trigger AS $$
DECLARE
  current_status "ProfessionalSubmissionStatus";
  assigned_reviewer_id TEXT;
BEGIN
  SELECT submission."status", submission."reviewerUserId"
  INTO current_status, assigned_reviewer_id
  FROM "ProfessionalProjectSubmission" AS submission
  WHERE submission."id" = NEW."submissionId";

  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Professional review requires an existing submission';
  END IF;

  IF current_status <> 'IN_REVIEW'::"ProfessionalSubmissionStatus" THEN
    RAISE EXCEPTION 'Professional review requires an in-review submission';
  END IF;

  IF assigned_reviewer_id IS NULL OR assigned_reviewer_id <> NEW."reviewerUserId" THEN
    RAISE EXCEPTION 'Professional review requires the exact assigned reviewer';
  END IF;

  IF NEW."fromStatus" <> current_status THEN
    RAISE EXCEPTION 'Professional review from-status must match persisted submission state';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ProfessionalSubmissionReview_scope"
BEFORE INSERT ON "ProfessionalSubmissionReview"
FOR EACH ROW EXECUTE FUNCTION "enforce_professional_submission_review_scope"();

CREATE FUNCTION "prevent_professional_submission_review_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Professional submission review history is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ProfessionalSubmissionReview_append_only"
BEFORE UPDATE OR DELETE ON "ProfessionalSubmissionReview"
FOR EACH ROW EXECUTE FUNCTION "prevent_professional_submission_review_mutation"();
