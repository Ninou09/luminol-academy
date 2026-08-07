# Flagship validation gate

This document records the release gate for the Arabic-first cinematic public-site redesign in PR #94.

The public experience must preserve the existing enquiry API, Sanity programme integration, certificate verification, metadata, security headers, responsive navigation, RTL behavior, reduced-motion support, and governed publishing rules while introducing the new editorial visual system.

Before merge, the final PR head must pass repository formatting, lint, TypeScript checking, unit/regression tests, production builds, database migration validation, security checks, and the public Playwright smoke suite. An independent review must also be completed without unresolved blocking findings.

Temporary Pexels photography and video are illustrative editorial assets only. They must remain credited and must not be represented as authentic Luminol students, staff, classrooms, workshops, or psychology sessions. Approved first-party Luminol media should replace them before the corresponding production claims are made.

The Vercel preview must be checked against the exact final PR head when the account build-rate window allows a new deployment.
