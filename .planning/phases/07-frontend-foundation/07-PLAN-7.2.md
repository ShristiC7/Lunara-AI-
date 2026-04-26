---
wave: 2
depends_on: ["07-PLAN-7.1.md"]
files_modified: [
  "frontend/src/pages/Dashboard.tsx",
  "frontend/src/pages/Chat.tsx",
  "frontend/src/pages/Reports.tsx",
  "frontend/src/pages/LogSymptoms.tsx"
]
requirements: ["UI-BASE-05", "UI-BASE-06"]
autonomous: true
---

# Plan 7.2: Feature Integration

Connect the existing dashboard, chat, and reports pages to their respective backend endpoints.

## Tasks

<task>
<read_first>
- frontend/src/pages/Dashboard.tsx
- api/src/routes/cycle.routes.ts
</read_first>
<action>
Fix Dashboard data fetching.
1. Update `Dashboard.tsx` to call `/cycles/stats` instead of `/stats`.
2. Map the response data to the existing cards.
3. Add a "Log Symptom" trigger (if applicable to existing UI).
</action>
<acceptance_criteria>
- Dashboard displays live data from the backend `/cycles/stats`.
</acceptance_criteria>
</task>

<task>
<read_first>
- frontend/src/pages/Chat.tsx
- api/src/routes/ai.routes.ts
</read_first>
<action>
Integrate AI Insights/Chat.
1. Connect `Chat.tsx` to the AI insights endpoints.
2. Ensure messages are sent to the backend for analysis (if the chat feature is implemented as such).
3. If the chat is a mock, update it to use real data from `/api/insights`.
</action>
<acceptance_criteria>
- Chat interface interacts with the AI service via the backend.
</acceptance_criteria>
</task>

<task>
<read_first>
- frontend/src/pages/LogSymptoms.tsx
- api/src/routes/symptom.routes.ts
</read_first>
<action>
Implement Symptom Logging.
1. Create `LogSymptoms.tsx` with a form for logging symptoms (pain, energy, flow, mood).
2. Connect to `POST /api/symptoms`.
3. Use simple, fast UI (pill buttons/sliders) to meet the < 20s goal.
</action>
<acceptance_criteria>
- Users can log symptoms and see them reflected in the system.
</acceptance_criteria>
</task>

## Verification

### Manual Verification
- Verify Dashboard stats update after logging a cycle in the backend.
- Verify a report can be triggered and downloaded.
