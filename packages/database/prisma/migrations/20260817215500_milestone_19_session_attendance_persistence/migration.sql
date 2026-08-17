-- Milestone 19 Slice B: first-party cohort sessions and attendance persistence.
-- No historical sessions or attendance are inferred or backfilled.

CREATE TYPE "CohortSessionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "CohortAttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED');

CREATE TABLE "CohortSession" (
    "id" TEXT NOT NULL,
    "cohortId" TEXT NOT NULL,
    "title" TEXT,
    "status" "CohortSessionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "timeZone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CohortSession_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CohortSession_window_check" CHECK (
      "endsAt" > "startsAt" AND "endsAt" <= "startsAt" + INTERVAL '12 hours'
    ),
    CONSTRAINT "CohortSession_timezone_check" CHECK (
      length(btrim("timeZone")) > 0 AND length("timeZone") <= 100
    )
);

CREATE TABLE "CohortSessionAttendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "cohortEnrollmentId" TEXT NOT NULL,
    "status" "CohortAttendanceStatus" NOT NULL,
    "recordedByUserId" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CohortSessionAttendance_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CohortSession_cohortId_status_startsAt_idx"
  ON "CohortSession"("cohortId", "status", "startsAt");
CREATE INDEX "CohortSession_startsAt_status_idx"
  ON "CohortSession"("startsAt", "status");
CREATE UNIQUE INDEX "CohortSessionAttendance_sessionId_cohortEnrollmentId_key"
  ON "CohortSessionAttendance"("sessionId", "cohortEnrollmentId");
CREATE INDEX "CohortSessionAttendance_cohortEnrollmentId_recordedAt_idx"
  ON "CohortSessionAttendance"("cohortEnrollmentId", "recordedAt");
CREATE INDEX "CohortSessionAttendance_sessionId_status_idx"
  ON "CohortSessionAttendance"("sessionId", "status");
CREATE INDEX "CohortSessionAttendance_recordedByUserId_recordedAt_idx"
  ON "CohortSessionAttendance"("recordedByUserId", "recordedAt");

ALTER TABLE "CohortSession"
  ADD CONSTRAINT "CohortSession_cohortId_fkey"
  FOREIGN KEY ("cohortId") REFERENCES "Cohort"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CohortSessionAttendance"
  ADD CONSTRAINT "CohortSessionAttendance_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "CohortSession"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CohortSessionAttendance"
  ADD CONSTRAINT "CohortSessionAttendance_cohortEnrollmentId_fkey"
  FOREIGN KEY ("cohortEnrollmentId") REFERENCES "CohortEnrollment"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CohortSessionAttendance"
  ADD CONSTRAINT "CohortSessionAttendance_recordedByUserId_fkey"
  FOREIGN KEY ("recordedByUserId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Sessions cannot be moved between cohorts after creation.
CREATE FUNCTION "prevent_cohort_session_identity_change"() RETURNS trigger AS $$
BEGIN
    IF OLD."cohortId" <> NEW."cohortId" THEN
        RAISE EXCEPTION 'Cohort session identity is immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CohortSession_immutable_identity"
BEFORE UPDATE OF "cohortId" ON "CohortSession"
FOR EACH ROW EXECUTE FUNCTION "prevent_cohort_session_identity_change"();

-- New sessions and reschedules are permitted only while the cohort can deliver teaching.
CREATE FUNCTION "enforce_cohort_session_delivery_scope"() RETURNS trigger AS $$
DECLARE
    cohort_status "CohortStatus";
BEGIN
    SELECT "status" INTO cohort_status FROM "Cohort" WHERE "id" = NEW."cohortId";

    IF cohort_status IS NULL OR cohort_status NOT IN ('PLANNED', 'ACTIVE') THEN
        RAISE EXCEPTION 'Cohort session requires a planned or active cohort';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CohortSession_delivery_scope_insert"
BEFORE INSERT ON "CohortSession"
FOR EACH ROW EXECUTE FUNCTION "enforce_cohort_session_delivery_scope"();

CREATE TRIGGER "CohortSession_delivery_scope_reschedule"
BEFORE UPDATE OF "startsAt", "endsAt", "timeZone" ON "CohortSession"
FOR EACH ROW EXECUTE FUNCTION "enforce_cohort_session_delivery_scope"();

-- Attendance must always reference an active learner membership in the exact session cohort.
CREATE FUNCTION "enforce_cohort_session_attendance_scope"() RETURNS trigger AS $$
DECLARE
    session_cohort_id TEXT;
    session_status "CohortSessionStatus";
    membership_cohort_id TEXT;
    membership_active BOOLEAN;
    enrollment_status "EnrollmentStatus";
BEGIN
    SELECT "cohortId", "status"
      INTO session_cohort_id, session_status
      FROM "CohortSession"
      WHERE "id" = NEW."sessionId";

    SELECT ce."cohortId", ce."active", e."status"
      INTO membership_cohort_id, membership_active, enrollment_status
      FROM "CohortEnrollment" ce
      JOIN "Enrollment" e ON e."id" = ce."enrollmentId"
      WHERE ce."id" = NEW."cohortEnrollmentId";

    IF session_cohort_id IS NULL OR membership_cohort_id IS NULL THEN
        RAISE EXCEPTION 'Attendance requires an existing session and cohort enrollment';
    END IF;

    IF session_status = 'CANCELLED' THEN
        RAISE EXCEPTION 'Attendance cannot be recorded for a cancelled session';
    END IF;

    IF membership_cohort_id <> session_cohort_id THEN
        RAISE EXCEPTION 'Attendance cohort scope mismatch';
    END IF;

    IF membership_active IS DISTINCT FROM true OR enrollment_status <> 'ACTIVE' THEN
        RAISE EXCEPTION 'Attendance requires an active cohort enrollment';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CohortSessionAttendance_scope"
BEFORE INSERT OR UPDATE OF "sessionId", "cohortEnrollmentId", "status" ON "CohortSessionAttendance"
FOR EACH ROW EXECUTE FUNCTION "enforce_cohort_session_attendance_scope"();

-- Attendance identity is historical; correct status/actor in place, but never move the record.
CREATE FUNCTION "prevent_cohort_session_attendance_identity_change"() RETURNS trigger AS $$
BEGIN
    IF OLD."sessionId" <> NEW."sessionId" OR OLD."cohortEnrollmentId" <> NEW."cohortEnrollmentId" THEN
        RAISE EXCEPTION 'Cohort session attendance identity is immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CohortSessionAttendance_immutable_identity"
BEFORE UPDATE OF "sessionId", "cohortEnrollmentId" ON "CohortSessionAttendance"
FOR EACH ROW EXECUTE FUNCTION "prevent_cohort_session_attendance_identity_change"();
