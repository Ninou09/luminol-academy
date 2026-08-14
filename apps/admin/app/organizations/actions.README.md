# Mutation contracts

Organization administration mutations require `academy:manage`, validate form identifiers, re-resolve tenant scope server-side, use transactions for state plus audit writes, and rely on the Milestone 16 PostgreSQL constraints for concurrency and lifecycle integrity.

Membership and seat mutations emit append-only `OrganizationAuditEvent` rows. Team and organization-course changes are audited as well. Existing learner enrolments remain the source of course access; these actions do not create a parallel enrolment system.
