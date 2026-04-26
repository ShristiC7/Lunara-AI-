---
wave: 3
depends_on: ["7.2"]
files_modified: [
  "frontend/src/components/dashboard/CycleRing.tsx",
  "frontend/src/components/dashboard/PeriodCard.tsx",
  "frontend/src/components/dashboard/InsightCard.tsx",
  "frontend/src/hooks/usePredictions.ts",
  "frontend/src/hooks/useInsights.ts"
]
requirements: ["UI-DASH-02", "UI-DASH-03", "UI-DASH-04"]
autonomous: true
---

# Plan 7.3: Intelligent Dashboard Components

Connect the dashboard to the AI-driven backend data.

## Tasks

<task>
<action>
Implement Data Fetching Hooks.
1. Create `frontend/src/hooks/usePredictions.ts` using TanStack Query to fetch `/predictions/current`.
2. Create `frontend/src/hooks/useInsights.ts` to fetch `/insights/today`.
</action>
<acceptance_criteria>
- Hooks correctly fetch and cache backend AI data.
</acceptance_criteria>
</task>

<task>
<action>
Build Cycle Ring Component.
1. Implement `frontend/src/components/dashboard/CycleRing.tsx`:
   - Circular progress indicator.
   - Shows "Cycle Day X" and current phase (e.g., Follicular).
   - Use #F3E8FF (Lavender) for progress background.
</action>
<acceptance_criteria>
- Ring correctly displays phase data from the API.
</acceptance_criteria>
</task>

<task>
<action>
Build Next Period & Insight Cards.
1. Implement `frontend/src/components/dashboard/PeriodCard.tsx`:
   - Shows predicted window and confidence score.
   - Applies peach tint (#FFE4D6) if period is within 3 days.
2. Implement `frontend/src/components/dashboard/InsightCard.tsx`:
   - Displays only the most recent primary insight.
</action>
<acceptance_criteria>
- Cards match the design system and data from hooks.
</acceptance_criteria>
</task>

## Verification

### Manual Verification
- Verify the Cycle Ring phase matches the API response.
- Verify the peach tint triggers correctly for upcoming periods.
