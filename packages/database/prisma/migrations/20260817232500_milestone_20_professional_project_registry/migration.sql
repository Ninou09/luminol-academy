-- Milestone 20 Slice A: governed project definitions for learner eligibility.

CREATE TABLE "ProfessionalProject" (
  "id" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "brief" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProfessionalProject_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProfessionalProject_title_check"
    CHECK (length(btrim("title")) BETWEEN 1 AND 200),
  CONSTRAINT "ProfessionalProject_brief_check"
    CHECK ("brief" IS NULL OR length("brief") <= 5000)
);

CREATE INDEX "ProfessionalProject_courseId_active_createdAt_idx"
  ON "ProfessionalProject"("courseId", "active", "createdAt");

ALTER TABLE "ProfessionalProject"
  ADD CONSTRAINT "ProfessionalProject_courseId_fkey"
  FOREIGN KEY ("courseId") REFERENCES "Course"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ProfessionalProjectSubmission"
  ADD CONSTRAINT "ProfessionalProjectSubmission_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "ProfessionalProject"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION "enforce_professional_submission_project_scope"() RETURNS trigger AS $$
DECLARE
  project_course_id TEXT;
  project_active BOOLEAN;
BEGIN
  SELECT "courseId", "active"
  INTO project_course_id, project_active
  FROM "ProfessionalProject"
  WHERE "id" = NEW."projectId";

  IF project_course_id IS NULL THEN
    RAISE EXCEPTION 'Professional submission requires an existing project';
  END IF;

  IF project_course_id <> NEW."courseId" THEN
    RAISE EXCEPTION 'Professional submission project/course scope mismatch';
  END IF;

  IF (TG_OP = 'INSERT' OR NEW."status" = 'SUBMITTED') AND project_active IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Professional submission requires an active project';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ProfessionalProjectSubmission_project_scope"
BEFORE INSERT OR UPDATE OF "projectId", "courseId", "status"
ON "ProfessionalProjectSubmission"
FOR EACH ROW EXECUTE FUNCTION "enforce_professional_submission_project_scope"();
