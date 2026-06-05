# GPOP Marketable MVP Plan

GPOP is moving from a visual prototype into a marketable MVP for GP practice operations. The app remains dummy-data/localStorage only for now, but each release should add a working operational engine rather than purely cosmetic UI.

## Completed foundations

- v1.x: design system, page shell, module toggles, localStorage persistence and service-layer structure.
- v2.0: staff leave cover checker with role-based minimum cover warnings.
- v2.1: marketable MVP spine with role-based app mode and generated operational alerts.
- v2.2: workforce and HR spine with working patterns, contract amendments, rooms and pay/budget summaries.
- v2.3: finance and dispensary profitability engine with invoice lines, reimbursement matching and loss alerts.
- v2.4: compliance and policy engine with policy creation, role targeting, questionnaire questions, acknowledgements and generated reminders.

## Current product direction

### Workforce and HR
- Working patterns by staff member.
- Holiday entitlement calculation.
- Contract amendments.
- Pay model and budget allocation.
- Room preferences and conflict detection.
- Leave cover warnings.

### Finance and dispensary
- Expected payments and finance task reminders.
- Supplier invoice line entry.
- GPP / reimbursement-style matching.
- Drug margin and loss detection.
- Dispensary action queue.

### Compliance and policy
- Controlled policy/SOP register.
- Role-targeted document assignment.
- Questionnaire questions before acknowledgement.
- Staff acknowledgement matrix.
- Policy review reminders.
- Generated dashboard/inbox alerts.

## Next v2.5 target: Training engine

Training should become more than a static table:

- Create/edit courses.
- Assign courses by role.
- Complete course records by staff member.
- Renewal intervals.
- Evidence status.
- Dashboard and Inbox alerts for overdue/due soon training.
- Role-specific staff dashboard view.

## v2.6 target: Audits engine

Audits should become a true operational workflow:

- Create/edit audit templates.
- Assign audit ownership.
- Recurring schedules.
- Submit evidence.
- Corrective action log.
- Audit failure escalation into Inbox.

## v2.7 target: Care Navigation governed prototype

Care navigation must remain prototype-only until clinically governed:

- Editable pathway builder.
- Problem/symptom search.
- Question bank per pathway.
- Red flag lockout.
- Appointment/action routing based on workforce availability.
- SystmOne copy text and longer note preview.
- Version control and clinical approval status.

## Production blockers

Before any real deployment:

- Real authentication.
- Database-backed users and permissions.
- Audit logs.
- Secure file upload and storage.
- Backups.
- Environment separation.
- Clinical safety documentation for care navigation.
- DPIA / IG review.
- Testing suite.
- Hosting and monitoring.
