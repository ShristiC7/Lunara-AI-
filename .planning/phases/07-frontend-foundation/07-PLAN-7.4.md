---
wave: 4
depends_on: ["7.3"]
files_modified: [
  "frontend/src/pages/Logger.tsx",
  "frontend/src/pages/Analytics.tsx",
  "frontend/src/hooks/useSymptoms.ts",
  "frontend/src/components/charts/SymptomHeatmap.tsx"
]
requirements: ["UI-LOG-01", "UI-LOG-02", "UI-ANA-01"]
autonomous: true
---

# Plan 7.4: Rapid Symptom Logger & Insights

Implement the high-speed symptom logging interface and detailed analytics.

## Tasks

<task>
<action>
Build Rapid Symptom Logger.
1. Implement `frontend/src/pages/Logger.tsx`:
   - Step-based layout or clean single-scroll page.
   - Mood: Icon-based pill buttons.
   - Pain: Range slider (0-10).
   - Energy: Tap selection.
   - Use `useSymptoms` hook with optimistic updates for < 20s completion feel.
</action>
<acceptance_criteria>
- Logging takes < 20s.
- UI updates immediately on submit.
</acceptance_criteria>
</task>

<task>
<action>
Implement Analytics Charts.
1. Create `frontend/src/components/charts/SymptomHeatmap.tsx` using Recharts.
2. Implement toggle for **Severity** vs **Frequency**.
3. Add cycle length line chart to `Analytics.tsx`.
</action>
<acceptance_criteria>
- Charts are clean, using the specified palette.
- Heatmap supports both view modes.
</acceptance_criteria>
</task>

<task>
<action>
Final Polish & Performance Audit.
1. Implement skeleton loaders for all pages.
2. Verify perceived interaction delay is < 300ms.
3. Final design review for "Calm Intelligence" consistency.
</action>
<acceptance_criteria>
- No visual spinners.
- Performance meets perceived speed targets.
</acceptance_criteria>
</task>

## Verification

### Manual Verification
- Log a symptom and verify it appears in the dashboard/analytics immediately.
- Test analytics toggle (Severity vs Frequency).
