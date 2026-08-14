# Organization administration boundary

This route is restricted to the existing `academy:manage` permission.

It may expose organization membership identity to academy administrators and bounded organization-level counts, but it must not surface assessment answers, psychology content, enquiry messages, payment credentials, private certificate metadata, or learner-authored content.

Member identity search terms are submitted through a protected server action and kept out of query strings, browser history, and pagination URLs. Organization, team, course, membership, roster, seat, assignment, and seat-eligibility result sets are bounded; records outside the current slice remain reachable through the scoped search controls.

All mutation identifiers from forms are untrusted input. Server actions re-resolve organization scope before writes, and PostgreSQL tenant/lifecycle constraints remain the final integrity boundary.
