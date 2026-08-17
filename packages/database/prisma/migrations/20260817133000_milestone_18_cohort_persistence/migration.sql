-- Milestone 18 Slice B: first-class cohort/instructor ownership persistence.
-- Existing records are deliberately not backfilled because the repository has no historical ownership relation that can prove cohort or instructor assignment safely.

-- CreateEnum
CREATE TYPE "CohortStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CohortInstructorRole" AS ENUM ('LEAD', 'ASSISTANT', 'REVIEWER');

-- CreateTable
CREATE TABLE "Cohort" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CohortStatus" NOT NULL DEFAULT 'PLANNED',
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cohort_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Cohort_schedule_window_check" CHECK ("startsAt" IS NULL OR "endsAt" IS NULL OR "endsAt" >= "startsAt")
);

-- CreateTable
CREATE TABLE "CohortInstructorAssignment" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "instructorUserId" TEXT NOT NULL,
    "role" "CohortInstructorRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CohortInstructorAssignment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CohortInstructorAssignment_active_window_check" CHECK (("active" = true AND "endedAt" IS NULL) OR ("active" = false AND "endedAt" IS NOT NULL))
);

-- CreateTable
CREATE TABLE "CohortEnrollment" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CohortEnrollment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CohortEnrollment_active_window_check" CHECK (("active" = true AND "endedAt" IS NULL) OR ("active" = false AND "endedAt" IS NOT NULL))
);

-- CreateIndex
CREATE INDEX "Cohort_courseId_status_idx" ON "Cohort"("courseId", "status");
CREATE INDEX "Cohort_status_startsAt_idx" ON "Cohort"("status", "startsAt");
CREATE INDEX "CohortInstructorAssignment_instructorUserId_active_idx" ON "CohortInstructorAssignment"("instructorUserId", "active");
CREATE INDEX "CohortInstructorAssignment_cohortId_active_role_idx" ON "CohortInstructorAssignment"("cohortId", "active", "role");
CREATE INDEX "CohortEnrollment_enrollmentId_active_idx" ON "CohortEnrollment"("enrollmentId", "active");
CREATE INDEX "CohortEnrollment_cohortId_active_idx" ON "CohortEnrollment"("cohortId", "active");

-- Preserve assignment/membership history while allowing only one active row for the same authority relationship.
CREATE UNIQUE INDEX "CohortInstructorAssignment_active_instructor_cohort_key"
  ON "CohortInstructorAssignment"("cohortId", "instructorUserId") WHERE "active" = true;
CREATE UNIQUE INDEX "CohortEnrollment_active_enrollment_key"
  ON "CohortEnrollment"("enrollmentId") WHERE "active" = true;

-- AddForeignKey
ALTER TABLE "Cohort" ADD CONSTRAINT "Cohort_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CohortInstructorAssignment" ADD CONSTRAINT "CohortInstructorAssignment_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CohortInstructorAssignment" ADD CONSTRAINT "CohortInstructorAssignment_instructorUserId_fkey" FOREIGN KEY ("instructorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CohortEnrollment" ADD CONSTRAINT "CohortEnrollment_cohortId_fkey" FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CohortEnrollment" ADD CONSTRAINT "CohortEnrollment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- A cohort is permanently owned by one course. Changing its course would silently change every instructor/learner scope attached to it.
CREATE FUNCTION "prevent_cohort_course_change"() RETURNS trigger AS $$
BEGIN
    IF OLD."courseId" <> NEW."courseId" THEN
        RAISE EXCEPTION 'Cohort course identity is immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Cohort_immutable_course"
BEFORE UPDATE OF "courseId" ON "Cohort"
FOR EACH ROW EXECUTE FUNCTION "prevent_cohort_course_change"();

-- Assignment authority is historical. To move an instructor, end the existing row and create a new assignment.
CREATE FUNCTION "prevent_cohort_instructor_assignment_identity_change"() RETURNS trigger AS $$
BEGIN
    IF OLD."cohortId" <> NEW."cohortId" OR OLD."instructorUserId" <> NEW."instructorUserId" THEN
        RAISE EXCEPTION 'Cohort instructor assignment identity is immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CohortInstructorAssignment_immutable_identity"
BEFORE UPDATE OF "cohortId", "instructorUserId" ON "CohortInstructorAssignment"
FOR EACH ROW EXECUTE FUNCTION "prevent_cohort_instructor_assignment_identity_change"();

-- A cohort enrollment can only reference an enrollment for the cohort's own course.
CREATE FUNCTION "enforce_cohort_enrollment_course_scope"() RETURNS trigger AS $$
DECLARE
    cohort_course_id TEXT;
    enrollment_course_id TEXT;
BEGIN
    SELECT "courseId" INTO cohort_course_id FROM "Cohort" WHERE "id" = NEW."cohortId";
    SELECT "courseId" INTO enrollment_course_id FROM "Enrollment" WHERE "id" = NEW."enrollmentId";

    IF cohort_course_id IS NULL OR enrollment_course_id IS NULL OR cohort_course_id <> enrollment_course_id THEN
        RAISE EXCEPTION 'Cohort enrollment course scope mismatch';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CohortEnrollment_course_scope"
BEFORE INSERT OR UPDATE OF "cohortId", "enrollmentId" ON "CohortEnrollment"
FOR EACH ROW EXECUTE FUNCTION "enforce_cohort_enrollment_course_scope"();

-- Cohort membership identity is historical. Move a learner by ending the old row and creating a new row.
CREATE FUNCTION "prevent_cohort_enrollment_identity_change"() RETURNS trigger AS $$
BEGIN
    IF OLD."cohortId" <> NEW."cohortId" OR OLD."enrollmentId" <> NEW."enrollmentId" THEN
        RAISE EXCEPTION 'Cohort enrollment identity is immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CohortEnrollment_immutable_identity"
BEFORE UPDATE OF "cohortId", "enrollmentId" ON "CohortEnrollment"
FOR EACH ROW EXECUTE FUNCTION "prevent_cohort_enrollment_identity_change"();
