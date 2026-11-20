# Milestone 23 — CRM sections operator guide

Governing issue: #572. This guide explains the section workspaces, offers, opportunities, events and the daily dashboard in the administration app. Every screen is available in Arabic, French and English. It extends `docs/MILESTONE_21_OPERATIONS.md`; roles and boundaries from Milestone 21 still apply.

## Sidebar

Today · Leads · Contacts · Consultations · Sections (Psychology, Languages, Professional development, Events & free sessions) · Payments · Editorial calendar · Approvals · Tasks · Activity log, then the enquiry desk, CRM insights, Team and the academy overview for the owner. Each person sees only the entries their role allows. Badges show new leads waiting for first contact and approval requests waiting for a decision. The footer shows the Blida date and the currency (DA).

## Today

Four headline numbers — new leads to contact, consultations in the next 7 days, decisions waiting, and money received this month (with today's amount) — followed by today's consultations, consented follow-ups that are due, upcoming dated programmes and events with their fill, approval requests with Approve / Refuse, tasks due in the next 7 days, and the standing rules.

## Sections and opportunities

Each section has a fixed pipeline:

| Section                  | Stages (won / lost are final)                                                                       |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| Psychology               | New → Contacted → Qualified → Consultation booked → Consultation done → Won / Lost                  |
| Languages                | New → Contacted → Placement test → Level assigned → Registered → Won / Lost                         |
| Professional development | New → Contacted → Qualified → Registered → Payment pending → Won / Lost                             |
| Events & free sessions   | Registered → Confirmed → Attended → Followed up → Converted (won) / No-show / Not interested (lost) |

- Open an opportunity from a lead or contact profile (**Add opportunity**). A person can have one open opportunity per section.
- Move cards on the section board by dragging or with the move control. Closing as **Lost** or **Not interested** asks for a short reason.
- The section page shows open opportunities, open value, wins in the last 30 days, the 90-day win rate, and a by-offer table (opportunities, wins, conversion, won value). Values are only what staff entered.

## Offers (owner)

Only the owner (`offer:manage`) creates offers and changes their status: Draft → Open → Full → Done, or Cancelled. Leave the price empty until it is confirmed — it shows as "not set", never as free. Capacity drives the fill rate.

## Events and free sessions

Open an event from the Events section (**Roster**) or from Today. On the roster:

1. **Register someone** — name, phone or email, source and an explicit consent answer. Registration stops when the event is full.
2. On the day, mark each person **Attended** or **No-show**.
3. **Follow up** only with attendees who agreed to be contacted; others are marked "do not contact".
4. **Convert** an attendee into an opportunity in Psychology, Languages or Professional development (optionally on a specific offer). The event opportunity closes as Converted.

## Quick-add lead

**Leads → Quick-add** records walk-ins, phone calls, WhatsApp and Facebook messages. The lead is assigned to you and the ownership change is audited. Nothing is sent to the person.

## Lead priority

Hot / warm / cold, shown on lead profiles (with the reasons) and pipeline cards. It weighs contact consent, a phone number, how soon the person wants to start, a chosen programme, recent activity and time waiting for first contact. A lead without contact consent is never above cold.

## Approvals and activity log

- **Approvals** lists open requests (decide them if you are the owner), the request form and recent decisions. Approving records the decision only — nothing is posted, sent or paid automatically.
- **Activity log** (owner) is a read-only feed of what was recorded: lead stage changes and CRM activities, opportunity moves, consultations, payments, tasks and approvals, editorial calendar changes and role changes. Filter by period (today, 7 or 30 days) and area.

## Boundaries

- Outbound contact only for people with recorded consent; notes stay operational, never clinical.
- Opportunity and audit histories are append-only and protected by database triggers.
- No automatic messages, publishing, scheduling, spending or bulk export.
- Prices, values and dates are entered by staff; nothing is seeded as business data.
