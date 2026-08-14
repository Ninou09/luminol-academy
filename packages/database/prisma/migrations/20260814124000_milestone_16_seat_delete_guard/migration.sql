-- An organization seat backing active sponsored learning may not be deleted directly.
-- Lifecycle closure must end the sponsorship first so seat capacity and tenant
-- accounting cannot diverge from active learner access.
CREATE FUNCTION "prevent_deleting_active_sponsored_seat"() RETURNS trigger AS $$
BEGIN
    IF EXISTS (
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
        RAISE EXCEPTION 'End active sponsorships before deleting organization seat';
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "OrganizationSeat_active_sponsorship_delete_guard"
BEFORE DELETE ON "OrganizationSeat"
FOR EACH ROW EXECUTE FUNCTION "prevent_deleting_active_sponsored_seat"();
