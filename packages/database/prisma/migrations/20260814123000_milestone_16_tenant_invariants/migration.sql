-- Team tenant identity is immutable once the row exists. Membership rows therefore
-- cannot be left attached to a team that silently moved to another organization.
CREATE FUNCTION "prevent_team_organization_change"() RETURNS trigger AS $$
BEGIN
    IF OLD."organizationId" <> NEW."organizationId" THEN
        RAISE EXCEPTION 'Team organization identity is immutable';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Team_immutable_organization"
BEFORE UPDATE OF "organizationId" ON "Team"
FOR EACH ROW EXECUTE FUNCTION "prevent_team_organization_change"();

-- An active sponsorship requires an active organization-course assignment and an
-- active seat for the enrolled learner in that same organization. The assignment,
-- enrollment and seat rows are locked while the sponsorship is validated so a
-- concurrent unassignment, enrollment identity change or seat closure cannot race
-- an active sponsorship into an invalid tenant state.
CREATE OR REPLACE FUNCTION "enforce_organization_sponsorship_course_scope"() RETURNS trigger AS $$
DECLARE
    assigned_course_id TEXT;
    assigned_organization_id TEXT;
    assignment_active BOOLEAN;
    organization_status "OrganizationStatus";
    enrolled_course_id TEXT;
    enrolled_user_id TEXT;
    active_seat_id TEXT;
BEGIN
    SELECT oc."courseId", oc."organizationId", oc."active", o."status"
    INTO assigned_course_id, assigned_organization_id, assignment_active, organization_status
    FROM "OrganizationCourse" oc
    JOIN "Organization" o ON o."id" = oc."organizationId"
    WHERE oc."id" = NEW."organizationCourseId"
    FOR SHARE OF oc;

    SELECT "courseId", "userId"
    INTO enrolled_course_id, enrolled_user_id
    FROM "Enrollment"
    WHERE "id" = NEW."enrollmentId"
    FOR SHARE;

    IF assigned_course_id IS NULL OR enrolled_course_id IS NULL OR assigned_course_id <> enrolled_course_id THEN
        RAISE EXCEPTION 'Organization sponsorship course scope mismatch';
    END IF;

    IF NEW."active" THEN
        IF assignment_active IS DISTINCT FROM true OR organization_status IS DISTINCT FROM 'ACTIVE' THEN
            RAISE EXCEPTION 'Active organization course assignment required for sponsorship';
        END IF;

        SELECT seat."id"
        INTO active_seat_id
        FROM "OrganizationSeat" seat
        WHERE seat."organizationId" = assigned_organization_id
          AND seat."userId" = enrolled_user_id
          AND seat."status" = 'ACTIVE'
        FOR SHARE;

        IF active_seat_id IS NULL THEN
            RAISE EXCEPTION 'Active organization seat required for sponsorship';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER "OrganizationEnrollmentSponsorship_course_scope" ON "OrganizationEnrollmentSponsorship";

CREATE TRIGGER "OrganizationEnrollmentSponsorship_course_scope"
BEFORE INSERT OR UPDATE OF "organizationCourseId", "enrollmentId", "active" ON "OrganizationEnrollmentSponsorship"
FOR EACH ROW EXECUTE FUNCTION "enforce_organization_sponsorship_course_scope"();

-- A sponsored enrollment cannot be moved to a different learner or course. End the
-- sponsorship first and create a new enrollment relationship instead of mutating
-- identity underneath historical organization records.
CREATE FUNCTION "prevent_sponsored_enrollment_identity_change"() RETURNS trigger AS $$
BEGIN
    IF (OLD."userId" <> NEW."userId" OR OLD."courseId" <> NEW."courseId")
       AND EXISTS (
           SELECT 1
           FROM "OrganizationEnrollmentSponsorship" sponsorship
           WHERE sponsorship."enrollmentId" = OLD."id"
       ) THEN
        RAISE EXCEPTION 'Sponsored enrollment identity is immutable';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "Enrollment_sponsored_identity"
BEFORE UPDATE OF "userId", "courseId" ON "Enrollment"
FOR EACH ROW EXECUTE FUNCTION "prevent_sponsored_enrollment_identity_change"();

-- An organization-course assignment cannot be deactivated while it still owns an
-- active learner sponsorship. Administration must end sponsorships first.
CREATE FUNCTION "prevent_unassigning_active_organization_sponsorships"() RETURNS trigger AS $$
BEGIN
    IF OLD."active" = true AND NEW."active" = false
       AND EXISTS (
           SELECT 1
           FROM "OrganizationEnrollmentSponsorship" sponsorship
           WHERE sponsorship."organizationCourseId" = OLD."id"
             AND sponsorship."active" = true
       ) THEN
        RAISE EXCEPTION 'End active sponsorships before unassigning organization course';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "OrganizationCourse_active_sponsorship_guard"
BEFORE UPDATE OF "active" ON "OrganizationCourse"
FOR EACH ROW EXECUTE FUNCTION "prevent_unassigning_active_organization_sponsorships"();

-- Preserve the seat lifecycle from Slice A and prevent an active seat from becoming
-- terminal while it still backs active organization-sponsored learning.
CREATE OR REPLACE FUNCTION "enforce_organization_seat_lifecycle"() RETURNS trigger AS $$
BEGIN
    IF OLD."organizationId" <> NEW."organizationId" OR OLD."userId" <> NEW."userId" THEN
        RAISE EXCEPTION 'Organization seat identity is immutable';
    END IF;

    IF OLD."status" = NEW."status" THEN
        RETURN NEW;
    END IF;

    IF OLD."status" = 'ACTIVE' AND NEW."status" IN ('COMPLETED', 'REVOKED')
       AND EXISTS (
           SELECT 1
           FROM "OrganizationEnrollmentSponsorship" sponsorship
           JOIN "OrganizationCourse" organization_course
             ON organization_course."id" = sponsorship."organizationCourseId"
           JOIN "Enrollment" enrollment
             ON enrollment."id" = sponsorship."enrollmentId"
           WHERE sponsorship."active" = true
             AND organization_course."organizationId" = OLD."organizationId"
             AND enrollment."userId" = OLD."userId"
       ) THEN
        RAISE EXCEPTION 'End active sponsorships before closing organization seat';
    END IF;

    IF OLD."status" = 'INVITED' AND NEW."status" IN ('ACTIVE', 'REVOKED') THEN
        RETURN NEW;
    END IF;

    IF OLD."status" = 'ACTIVE' AND NEW."status" IN ('COMPLETED', 'REVOKED') THEN
        RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Invalid organization seat transition: % -> %', OLD."status", NEW."status";
END;
$$ LANGUAGE plpgsql;
