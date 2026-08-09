# Milestone 15 public localization validation

This note records the validation boundary for Slice C.

- Public interface locales: Arabic (`ar`), French (`fr`), English (`en`).
- Existing visual design remains unchanged apart from language controls and RTL typography support.
- Canonical public routes are locale-prefixed.
- Programme discovery keeps filter state in the URL and does not record search-query text in telemetry.
- Governed CMS programme content is rendered as authored content with automatic text direction rather than silently machine-translated.
- Certificate verification retains its existing privacy, no-index and rate-limit behavior while localizing interface copy and date formatting.
- Exact-head CI and independent review are required before merge.
