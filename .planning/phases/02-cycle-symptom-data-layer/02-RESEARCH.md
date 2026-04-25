---
phase: "02"
topic: "Cycle & Symptom Data Layer"
updated: 2026-04-26
---

# Phase 2 Research

## 1. Domain Object Constraints (Prisma Constraints to Note)
- **Cycle**:
  - `startDate`: `DateTime` (required).
  - `endDate`: `DateTime?` (optional).
  - `cycleLength`: `Int?` (optional, calculated).
  - Constraints: End date cannot be before start date.
- **Symptom**:
  - Daily entry (one per user/date). Wait, the schema index is `@@index([userId, date])`, but not marked as `@unique([userId, date])`. Therefore, we *could* have multiple symptoms per date, but business logic implies aggregation or 1 entry per date per user. A typical period app has one symptom log entry per day. We should treat it as one overall symptom package per day, OR update existing if logging again on the same day.
  - Constraints: `mood` (1-5), `energy` (1-5), `flow` (0-4), `pain` (0-5).
  - Notes: Max 500 chars limit (enforced at DB level via `@db.VarChar(500)`). HTML stripping needed.

## 2. API Design & Payloads
- **POST `/api/cycles`**: Must parse `startDate` (ISO), optional `endDate`. If `endDate` present, calculate `cycleLength` (days difference).
- **PATCH `/api/cycles/:id`**: Add `endDate` when period finishes. Recalculate `cycleLength`.
- **GET `/api/cycles`**: Ordered by `startDate` DESC. Pagination (`limit` and `cursor/page`). Include aggregated `symptoms: { _count }` (achievable via Prisma `include: { _count: { select: { symptoms: true } } }`).
- **POST `/api/symptoms`**: Requires specific logic to link to the *active* cycle if `cycleId` is not explicitly provided, but Phase 2 specifies "link to cycleId if provided".

## 3. Symptom `notes` Sanitization
- Requires HTML stripping. A simple regular expression `/<[^>]*>?/gm` is sufficient for this scope, or `dompurify` / `sanitize-html`. Since we shouldn't add a ton of heavy libraries, simple targeted regex is okay, but `sanitize-html` is production-grade. Decision: install `sanitize-html` to properly sanitize inputs without Regex headaches.

## 4. Calculated Stats Strategy (`/api/cycles/stats`)
- Average cycle length: Average of `cycleLength` where it's not null.
- Average period length: Wait, period length vs cycle length? "Cycle length" = days between periods. "Period length" = days bleeding.
  - Looking at the Schema: `Cycle` has `startDate` and `endDate`. `cycleLength` represents the total cycle length (until next startDate)? Or days bleeding?
  - Domain definition: A menstrual cycle starts on the first day of the period (`startDate`). The "period length" is `endDate - startDate`. The "cycle length" is `next cycle's startDate - this cycle's startDate`.
  - The schema has: `startDate`, `endDate`, and `cycleLength`.
  - We'll assign `cycleLength` as the difference between dates or calculate dynamically based on adjacent records.
- Most common symptoms: Group by symptom metrics across recent cycles.
- Regularity score: Standard deviation of cycle length.

## 5. Testing Context
- We are actively experiencing Prisma dll extraction blocks on the local Windows OS environment.
- Therefore, we MUST continue to mock Prisma interactions aggressively in jest to ensure tests pass during CI validation phases, verifying middleware routing and Zod parameter parsing instead of deep DB integrity validations, or use an abstract mock repository pattern.

## Validation Architecture
- **Cycles CRUD**: Validate endpoints enforcing `req.userId` boundaries.
- **Symptom CRUD**: Ensure sanitization of notes over 500 chars throws 400. Ensure valid symptom categories limits.
- **Stats**: Verify stats calculation helper functions unit tests independently of Express paths.
