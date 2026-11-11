# Milestone 21 — Academy operations guide

Governing issue: #562. This guide explains who can do what in the administration app's operations workspaces and the boundaries that keep them safe. Every screen is available in Arabic, French and English.

## Roles

Roles come from the persisted role graph. The owner grants and revokes staff roles from **Team** (`/team`). Platform administration (`admin`) is never granted from the browser, and nobody can change roles on their own account. Every change is written to an append-only role history.

| Role            | Intended for          | Workspaces                                                                                                                   |
| --------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `admin`         | Owner                 | Overview, Today, Consultations (all), Clients (all), Payments (ledger and voids), Enquiries, Tasks (all) and approvals, Team |
| `consultant`    | Consultation provider | Today, own consultations, own clients, payments for own consultations, own tasks                                             |
| `enquiry-agent` | Callback follow-up    | Today, Enquiries, own tasks                                                                                                  |
| `staff`         | Trainers              | Cohort instructor eligibility in the portal, Today, own tasks                                                                |

A person must sign in to Luminol once so their account is synchronized before the owner can find them on the Team page.

## Daily workflows

**Today** (`/today`) shows only what the signed-in person may see: today's consultations, payments received today, consented enquiry follow-ups that are due, tasks due or overdue, and approval requests (to decide, or your own pending requests).

**Clients** (`/clients`): create a contact record, or start one from a recent enquiry. Converting an enquiry happens once and the contact consent can never exceed what the enquirer gave. Notes are short operational text.

**Consultations** (`/consultations`): week view in Blida time. Booking enforces 08:00–17:00, 15-minute steps, 30–120 minutes, closed on Friday, and refuses overlapping sessions for the same consultant. Status moves Requested → Confirmed → Completed or No-show, or Cancelled. Attendance can only be recorded once a session has started. Every change is recorded in the appointment history.

**Payments** (`/office-payments`): record money actually received in DZD by cash, BaridiMob, CCP or bank transfer. Electronic payments require the transfer reference. Each payment receives a sequential receipt number (`LUM-YYYY-NNNNNN`). Recorded payments cannot be edited or deleted; the owner voids a mistake with a written reason and it stays visible. Online invoices remain in **Finance**.

**Tasks** (`/tasks`): assign and complete work. **Approval requests** are for anything that publishes, posts in a WhatsApp group, schedules outreach or spends money. Approving records the owner's decision only — nothing is posted, sent or paid automatically.

## Boundaries

- No clinical or assessment content: appointment and client notes are operational only (500 characters maximum, enforced in the database).
- Consultants see only their own appointments and the clients they created or serve; enquiry agents never see consultations or payments.
- Follow-up lists include only enquiries with recorded contact consent.
- No messaging, publishing, scheduling of outreach, spending or bulk export in this milestone.
- Audit histories (roles, appointments, payments, tasks) are append-only and protected by database triggers.

## Going live

1. Merge in order: #564 (dependency audit), #563, #565, then the payments and tasks pull requests.
2. Let the production migration workflow apply the Milestone 21 migrations.
3. Ask each team member to sign in once, then grant roles from **Team**.
4. Verify the protected admin journeys for each role before treating the milestone as production-live.
