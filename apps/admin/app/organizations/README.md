# Organization administration boundary

This route is restricted to the existing `academy:manage` permission.

It may expose organization membership identity to academy administrators and bounded organization-level counts, but it must not surface assessment answers, psychology content, enquiry messages, payment credentials, private certificate metadata, or learner-authored content.

All mutation identifiers from forms are untrusted input. Server actions re-resolve organization scope before writes, and PostgreSQL tenant/lifecycle constraints remain the final integrity boundary.
