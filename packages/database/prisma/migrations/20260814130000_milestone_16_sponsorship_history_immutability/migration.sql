-- Ended organization sponsorships are immutable audit history. The lifecycle
-- transition from active -> ended remains allowed, but once a row is ended no field
-- on that row may be rewritten. Start/audit timestamps are immutable even while the
-- sponsorship is active.
CREATE OR REPLACE FUNCTION "prevent_organization_sponsorship_reactivation"() RETURNS trigger AS $$
BEGIN
    IF OLD."active" = false THEN
        RAISE EXCEPTION 'Ended organization sponsorship is terminal';
    END IF;

    IF OLD."sponsoredAt" IS DISTINCT FROM NEW."sponsoredAt"
       OR OLD."createdAt" IS DISTINCT FROM NEW."createdAt" THEN
        RAISE EXCEPTION 'Organization sponsorship history timestamps are immutable';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER "OrganizationEnrollmentSponsorship_terminal_history" ON "OrganizationEnrollmentSponsorship";

CREATE TRIGGER "OrganizationEnrollmentSponsorship_terminal_history"
BEFORE UPDATE ON "OrganizationEnrollmentSponsorship"
FOR EACH ROW EXECUTE FUNCTION "prevent_organization_sponsorship_reactivation"();
