-- Milestone 20 Slice A: audit history is append-only.

CREATE FUNCTION "prevent_professional_submission_audit_mutation"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'Professional submission audit events are append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ProfessionalSubmissionAuditEvent_append_only"
BEFORE UPDATE OR DELETE ON "ProfessionalSubmissionAuditEvent"
FOR EACH ROW EXECUTE FUNCTION "prevent_professional_submission_audit_mutation"();
