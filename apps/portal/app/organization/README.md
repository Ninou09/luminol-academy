# Organization manager boundary

This portal surface is authorized exclusively from the signed-in user's active `OrganizationMembership` with role `OWNER` or `MANAGER`. It does not grant or depend on global academy-administrator permission.

Organization and team identifiers from URLs are untrusted. Every selected organization and team is re-resolved against the signed-in user's current membership before data is returned.

The workspace may show the manager's own organization roster identity, seat utilization, assigned course titles and dates, and approved aggregate sponsorship/completion totals. It must not query or display assessment answers or scores, psychology content, enquiry messages, personal finance records, payment credentials, private certificate metadata, learner-authored content, or records from another organization.

Roster, team, organization and assigned-learning collections are paginated and bounded. No public organization directory or cross-organization search is introduced.
