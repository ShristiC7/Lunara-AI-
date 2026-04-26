---
wave: 2
depends_on: ["7.1"]
files_modified: [
  "frontend/src/components/layout/Sidebar.tsx",
  "frontend/src/components/layout/AppShell.tsx",
  "frontend/src/pages/Dashboard.tsx"
]
requirements: ["UI-DASH-01", "UI-NAV-01"]
autonomous: true
---

# Plan 7.2: Responsive Sidebar & Dashboard Shell

Implement the persistent navigation structure and the core dashboard layout.

## Tasks

<task>
<action>
Create Persistent Sidebar Component.
1. Implement `frontend/src/components/layout/Sidebar.tsx`:
   - Desktop: Fixed sidebar on the left.
   - Mobile: Transitions to a sleek bottom navigation bar.
   - Use Lucide React icons (Dashboard, Logger, Insights, Analytics, Settings).
   - Premium feel: Clean lines, #E9D5FF borders.
</action>
<acceptance_criteria>
- Sidebar is persistent and responsive.
- Bottom nav appears on mobile viewports.
</acceptance_criteria>
</task>

<task>
<action>
Create AppShell Layout.
1. Implement `frontend/src/components/layout/AppShell.tsx`:
   - Wraps all protected routes.
   - Provides consistent background (#FAF7FF) and padding.
</action>
<acceptance_criteria>
- Layout is consistent across all pages.
</acceptance_criteria>
</task>

<task>
<action>
Build Dashboard Skeleton.
1. Implement `frontend/src/pages/Dashboard.tsx`:
   - Grid layout for components.
   - Top section: Cycle Ring placeholder.
   - Right/Bottom: Next Period Card and Primary Insight Card.
</action>
<acceptance_criteria>
- Dashboard layout matches the spec.
</acceptance_criteria>
</task>

## Verification

### Manual Verification
- Resize browser to test sidebar-to-bottom-nav transition.
- Click through nav items to verify routing.
