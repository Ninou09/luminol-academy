# Milestone 23 plan — CRM section workspaces (draft for the owner)

Objective selected by the owner on 2026-11-13: make the live admin CRM easier to work with and organized around Luminol's sections, borrowing proven ideas from the earlier ops-hub prototype and from luminol-os, without creating another system.

## Sections

| Section                  | Pipeline stages (won / lost are terminal)                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| Psychology               | New → Contacted → Qualified → Consultation booked → Consultation done → Won / Lost                  |
| Languages                | New → Contacted → Placement test → Level assigned → Registered → Won / Lost                         |
| Professional development | New → Contacted → Qualified → Registered → Payment pending → Won / Lost                             |
| Events & free sessions   | Registered → Confirmed → Attended → Followed up → Converted (won) / No-show / Not interested (lost) |

Stage sets live as code configuration in `packages/validation` (one source of truth, unit-tested), not as free-form database values.

## Slice A — Offers, opportunities and section pipelines

- `CrmOffer` catalogue per section: consultation, language course, 6-hour professional programme, 2-hour family workshop, free session/event. Optional price (empty means "not set", never invented), dates, capacity, trainer, status draft/open/full/done/cancelled.
- `CrmDeal` (opportunity) linking a lead and/or contact to a section and optional offer: stage from that section's config, optional value in DZD, owner, expected close date, lost reason required when lost; append-only `CrmDealEvent` history.
- `/crm/sections/[section]`: kanban of that section's deals (drag-and-drop + keyboard move, as in `/crm/pipeline`), its open offers with fill rates, and section KPIs.
- "Add opportunity" on lead and contact profiles; deals appear in the 360° timelines.
- Quick-add lead for walk-ins, phone calls, WhatsApp and Facebook messages (source recorded, consent captured explicitly).
- Lead score (pure function, shown as hot / warm / cold): consent, phone present, timing preference, programme chosen, recent activity, age without contact.

## Slice B — Easier daily work

- Sidebar regrouped: Today · Sections (4) · Leads · Contacts · Consultations · Payments · Tasks · Insights · Team.
- Events workspace: registrations from offers, attendance check-in, post-event follow-up list (consented only), conversion to paid offers.
- Section dashboards (volume, conversion, revenue by offer) and offer fill rates.
- Operator guide update and roadmap/status entries.

## Guardrails

Same as Milestones 21–22: scoped access, consent before outbound contact, operational notes only, append-only histories, no automatic sending/publishing/spending, no bulk export, no invented business data.
