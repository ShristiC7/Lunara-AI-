---
wave: 1
depends_on: []
files_modified: [
  "frontend/src/services/api.ts",
  "frontend/src/pages/Login.tsx",
  "frontend/src/pages/Register.tsx",
  "frontend/src/App.tsx",
  "frontend/vite.config.ts"
]
requirements: ["UI-BASE-01", "UI-BASE-04"]
autonomous: true
---

# Plan 7.1: API Integration + Auth UI

Connect the existing frontend to the backend API and implement the missing authentication screens.

## Tasks

<task>
<read_first>
- frontend/src/services/api.ts
- frontend/vite.config.ts
</read_first>
<action>
Configure API client and Vite proxy.
1. Update `frontend/vite.config.ts` to proxy `/api` to `http://localhost:4000`.
2. Update `frontend/src/services/api.ts`:
   - Set `baseURL` to `/api`.
   - Set `withCredentials: true`.
   - Add interceptors for JWT rotation (monitoring 401s).
</action>
<acceptance_criteria>
- `frontend/vite.config.ts` has proxy configured.
- `frontend/src/services/api.ts` has `withCredentials: true` and 401 interceptor.
</acceptance_criteria>
</task>

<task>
<read_first>
- frontend/src/pages/Login.tsx
- frontend/src/pages/Register.tsx
</read_first>
<action>
Create Login and Register pages.
1. Implement `Login.tsx` with email/password form calling `POST /auth/login`.
2. Implement `Register.tsx` with email/password form calling `POST /auth/register`.
3. Ensure they update the `authStore` on success.
4. Use existing styling patterns (Bootstrap/Inline) to match the current scaffold.
</action>
<acceptance_criteria>
- `frontend/src/pages/Login.tsx` and `frontend/src/pages/Register.tsx` exist.
- Form submission calls the correct backend endpoints.
</acceptance_criteria>
</task>

<task>
<read_first>
- frontend/src/App.tsx
</read_first>
<action>
Update Routing for Auth.
1. Add `/login` and `/register` routes.
2. Implement a simple `ProtectedRoute` component.
3. Wrap `/dashboard`, `/chat`, and `/reports` in `ProtectedRoute`.
</action>
<acceptance_criteria>
- Unauthenticated users are redirected to `/login`.
- Authenticated users can access the dashboard.
</acceptance_criteria>
</task>

## Verification

### Automated Tests
- Mock a 401 response and verify the interceptor attempts a refresh.

### Manual Verification
- Register a new user and login.
- Verify the access token is stored and sent in headers.
