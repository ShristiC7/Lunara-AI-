---
wave: 1
depends_on: []
files_modified: [
  "frontend/tailwind.config.js",
  "frontend/src/index.css",
  "frontend/src/services/api.ts",
  "frontend/src/pages/Login.tsx",
  "frontend/src/pages/Register.tsx",
  "frontend/src/components/ui/Button.tsx",
  "frontend/src/components/ui/Input.tsx"
]
requirements: ["UI-BASE-01", "UI-BASE-02", "UI-AUTH-01"]
autonomous: true
---

# Plan 7.1: Premium Design System & Auth Refactor

Initialize the "Calm Intelligence" design system and implement a production-grade authentication flow.

## Tasks

<task>
<action>
Configure Tailwind with the "Calm Intelligence" palette.
1. Update `frontend/tailwind.config.js` with the specified colors:
   - `lavender`: #F3E8FF
   - `soft-pink`: #FCE7F3
   - `accent-pink`: #EC4899
   - `peach`: #FFE4D6
   - `background`: #FAF7FF
   - `surface`: #FFFFFF
2. Add border-radius tokens (14-16px).
3. Set Inter as the primary font in `index.css`.
</action>
<acceptance_criteria>
- Tailwind config contains all specified colors.
- `index.css` imports Inter and sets it as default.
</acceptance_criteria>
</task>

<task>
<action>
Create Reusable UI Components.
1. Create `frontend/src/components/ui/Button.tsx` (Pill-shaped, soft-pink/accent-pink variants).
2. Create `frontend/src/components/ui/Card.tsx` (Surface color, 16px radius, subtle shadow).
3. Create `frontend/src/components/ui/Input.tsx` (Minimal, soft border).
</action>
<acceptance_criteria>
- Components follow the design system strictly.
</acceptance_criteria>
</task>

<task>
<action>
Implement Secure API Client.
1. Update `frontend/src/services/api.ts`:
   - Axios instance with `baseURL: "/api/v1"`.
   - Interceptor to inject Bearer token from Zustand store.
   - Interceptor to handle 401: call `/auth/refresh` -> retry original request.
</action>
<acceptance_criteria>
- API calls automatically handle token injection and rotation.
</acceptance_criteria>
</task>

<task>
<action>
Build Premium Auth Pages.
1. Refactor `Login.tsx` and `Register.tsx` to use the new design system.
2. Ensure high-quality layout (centered, clean, "Calm Intelligence" feel).
3. Add "Your data is encrypted and private" trust hint.
</action>
<acceptance_criteria>
- Login/Register pages match the new palette and typography.
- Integration with backend auth endpoints works.
</acceptance_criteria>
</task>

## Verification

### Automated Tests
- `npm run test` (if exists) should pass.
- Mock 401 response and verify interceptor logic.

### Manual Verification
- Verify colors and fonts against the design spec.
- Verify successful login redirects to dashboard.
