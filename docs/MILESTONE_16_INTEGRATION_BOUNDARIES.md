# Milestone 16 integration boundaries

## Verified organization identity

Milestone 11 finance and Milestone 12 notification records predate the first-class `Organization` domain and may contain opaque historical `organizationId` values. Slice E preserves those legacy values and adds separate nullable verified-organization relations. Existing rows are backfilled only when an exact first-class Organization can be proven; unmatched historical identifiers remain unverified rather than being rewritten or guessed.

New organization-scoped invoices, corporate billing records, notification events, and notifications must carry both the legacy-compatible identifier and the matching verified Organization relation. Database guards reject new unverified or mismatched organization identity while allowing unmatched historical rows to update non-identity fields.

## Corporate billing

New corporate billing is restricted to an active, non-archived first-class Organization. The requested seat count cannot exceed the Organization seat limit. The resulting invoice and corporate billing record share the same verified organization identity. Billing-contact identity remains finance data and is not exposed through the organization-manager workspace.

## Notifications

Organization-scoped notifications reuse the existing notification event, preference, delivery, retry, and dead-letter infrastructure. Before an organization-scoped event is created, the organization must be active and the recipient must have an active membership in that same organization. Organization-specific notification preferences are evaluated only inside the verified organization context, with the user's global preference as fallback.

## Certificates and enrollment

Organization sponsorship continues to point to the existing `Enrollment` record. Certificate issuance continues to verify completion from that canonical Enrollment and therefore does not create an organization-specific certificate path, duplicate credential, or alternate completion record. Organization managers receive aggregate completion totals only; private certificate metadata remains outside their reporting boundary.

## Localization and identity text

Organization administration and manager interfaces remain localized in Arabic, French, and English with RTL support. Organization names, people names, course titles, billing references, and other source identity text are preserved as stored and are never machine-translated. Dynamic identity text is rendered with direction isolation where it appears in mixed-direction interfaces.
