## Milestone 16 Slice C boundary

The organization administration workspace is global academy administration only. It does not grant organization-manager access and does not introduce a public organization directory.

All writes require `academy:manage`, validate untrusted form identifiers, resolve tenant ownership on the server, and write an append-only organization audit event inside the same transaction. PostgreSQL remains authoritative for cross-tenant, lifecycle, capacity, sponsorship-history, and concurrency invariants.

The dashboard exposes organization membership identity to academy administrators and bounded aggregate completion only. It deliberately excludes assessment answers/scores, psychology content, enquiry messages, personal finance/payment data, private certificate metadata, and learner-authored content.
