-- Membership authorization state is explicit. Inactive membership rows are historical
-- rows and therefore must carry an end time; callers may not rely on a permissive
-- database default for an authorization-bearing field.
ALTER TABLE "OrganizationMembership" ALTER COLUMN "active" DROP DEFAULT;

ALTER TABLE "OrganizationMembership"
ADD CONSTRAINT "OrganizationMembership_active_window_check"
CHECK (("active" = true AND "endedAt" IS NULL) OR ("active" = false AND "endedAt" IS NOT NULL));

-- Every sponsorship row, including inactive historical rows, must be tied to a learner
-- who had a seat in the same organization. Active sponsorship additionally requires
-- that seat to remain ACTIVE. Lock the assignment, enrollment, and seat rows while
-- validating to serialize against parent-side lifecycle changes.
CREATE OR REPLACE FUNCTION "enforce_organization_sponsorship_course_scope"() RETURNS trigger AS $$
DECLARE
    assigned_course_id TEXT;
    assigned_organization_id TEXT;
    assignment_active BOOLEAN;
    organization_status "OrganizationStatus";
    enrolled_course_id TEXT;
    enrolled_user_id TEXT;
    organization_seat_id TEXT;
    organization_seat_status "OrganizationSeatStatus";
BEGIN
    SELECT oc."courseId", oc."organizationId", oc."active", o."status"
    INTO assigned_course_id, assigned_organization_id, assignment_active, organization_status
    FROM "OrganizationCourse" oc
    JOIN "Organization" o ON o."id" = oc."organizationId"
    WHERE oc."id" = NEW."organizationCourseId"
    FOR SHARE OF oc, o;

    SELECT "courseId", "userId"
    INTO enrolled_course_id, enrolled_user_id
    FROM "Enrollment"
    WHERE "id" = NEW."enrollmentId"
    FOR SHARE;

    IF assigned_course_id IS NULL OR enrolled_course_id IS NULL OR assigned_course_id <> enrolled_course_id THEN
        RAISE EXCEPTION 'Organization sponsorship course scope mismatch';
    END IF;

    SELECT seat."id", seat."status"
    INTO organization_seat_id, organization_seat_status
    FROM "OrganizationSeat" seat
    WHERE seat."organizationId" = assigned_organization_id
      AND seat."userId" = enrolled_user_id
    FOR SHARE;

    IF organization_seat_id IS NULL THEN
        RAISE EXCEPTION 'Organization seat required for sponsorship history';
    END IF;

    IF NEW."active" THEN
        IF assignment_active IS DISTINCT FROM true OR organization_status IS DISTINCT FROM 'ACTIVE' THEN
            RAISE EXCEPTION 'Active organization course assignment required for sponsorship';
        END IF;

        IF organization_seat_status IS DISTINCT FROM 'ACTIVE' THEN
            RAISE EXCEPTION 'Active organization seat required for sponsorship';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ended sponsorships are terminal historical rows. A later sponsorship period must
-- create a new row rather than rewriting the recorded end of the previous period.
CREATE FUNCTION "prevent_organization_sponsorship_reactivation"() RETURNS trigger AS $$
BEGIN
    IF OLD."active" = false
       AND (NEW."active" = true OR NEW."endedAt" IS DISTINCT FROM OLD."endedAt") THEN
        RAISE EXCEPTION 'Ended organization sponsorship is terminal';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "OrganizationEnrollmentSponsorship_terminal_history"
BEFORE UPDATE OF "active", "endedAt" ON "OrganizationEnrollmentSponsorship"
FOR EACH ROW EXECUTE FUNCTION "prevent_organization_sponsorship_reactivation"();

-- Sponsorship history is append-only. Active rows are ended through lifecycle fields;
-- inactive rows remain as audit history rather than being physically deleted.
CREATE FUNCTION "prevent_organization_sponsorship_deletion"() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'Organization sponsorship history cannot be deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "OrganizationEnrollmentSponsorship_delete_guard"
BEFORE DELETE ON "OrganizationEnrollmentSponsorship"
FOR EACH ROW EXECUTE FUNCTION "prevent_organization_sponsorship_deletion"();

-- Lowering seatLimit must serialize with seat allocation. OrganizationSeat allocation
-- already locks this same Organization row, so concurrent limit reductions and seat
-- writes cannot commit a persisted allocation above capacity.
CREATE FUNCTION "enforce_organization_seat_limit_update"() RETURNS trigger AS $$
DECLARE
    allocated_seat_count INTEGER;
BEGIN
    IF NEW."seatLimit" < OLD."seatLimit" THEN
        SELECT COUNT(*) INTO allocated_seat_count
        FROM "OrganizationSeat"
        WHERE "organizationId" = OLD."id"
          AND "status" <> 'REVOKED';

        IF allocated_seat_count > NEW."seatLimit" THEN
            RAISE EXCEPTION 'Organization seat limit cannot be lower than allocated seats';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Organization_seat_limit_guard"
BEFORE UPDATE OF "seatLimit" ON "Organization"
FOR EACH ROW EXECUTE FUNCTION "enforce_organization_seat_limit_update"();

-- The sponsorship validator requires active organizations for active sponsorships.
-- Preserve that invariant from the parent side as well: an organization must end its
-- active sponsorships before becoming suspended or archived.
CREATE FUNCTION "prevent_inactive_organization_with_active_sponsorships"() RETURNS trigger AS $$
BEGIN
    IF OLD."status" = 'ACTIVE' AND NEW."status" <> 'ACTIVE'
       AND EXISTS (
           SELECT 1
           FROM "OrganizationEnrollmentSponsorship" sponsorship
           JOIN "OrganizationCourse" organization_course
             ON organization_course."id" = sponsorship."organizationCourseId"
           WHERE sponsorship."active" = true
             AND organization_course."organizationId" = OLD."id"
       ) THEN
        RAISE EXCEPTION 'End active sponsorships before suspending or archiving organization';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Organization_active_sponsorship_guard"
BEFORE UPDATE OF "status" ON "Organization"
FOR EACH ROW EXECUTE FUNCTION "prevent_inactive_organization_with_active_sponsorships"();
