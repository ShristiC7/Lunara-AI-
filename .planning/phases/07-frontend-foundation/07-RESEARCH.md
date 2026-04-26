# Phase 7 Research: Frontend Foundation

## Technical Summary

### 1. Project Structure
- **Root Directory**: `frontend/` (existing).
- **Base URL**: The backend currently serves from `http://localhost:3000/api/v1`. A proxy in `vite.config.ts` will be used to route `/api` to the backend.
- **Refactor**: Clean up existing `App.tsx` and `index.css` to align with "Calm Intelligence" design.

### 2. Design System: Calm Intelligence
- **Tailwind v4 (CSS-first)**: 
  - Define theme variables in `index.css` using `@theme` block.
  - Colors:
    - `--color-lavender`: `#F3E8FF`
    - `--color-soft-pink`: `#FCE7F3`
    - `--color-accent-pink`: `#EC4899`
    - `--color-peach`: `#FFE4D6`
    - `--color-bg-main`: `#FAF7FF`
  - Fonts:
    - `--font-display`: `Outfit, sans-serif`
    - `--font-sans`: `Inter, sans-serif`
- **Typography**: 
  - Outfit (Google Fonts) for display/headings.
  - Inter (Google Fonts) for body text.

### 3. Authentication Strategy
- **Backend Behavior**:
  - `POST /api/v1/auth/login`: Returns `{ success: true, data: { accessToken } }`. Sets `refreshToken` in an HttpOnly cookie.
  - `POST /api/v1/auth/refresh`: Reads `refreshToken` from cookie. Returns `{ success: true, data: { accessToken } }`. Rotates `refreshToken` in cookie.
- **Frontend Interceptors**:
  - `axiosInstance.interceptors.response`:
    - On `401` error, check if it's not the `/auth/refresh` or `/auth/login` endpoint.
    - If `401`, call `POST /api/v1/auth/refresh` (with `withCredentials: true`).
    - If refresh succeeds, update `authStore` and retry the original request.
    - If refresh fails, clear auth state and redirect to login.

### 4. State Management
- **Zustand**: Used for `useAuthStore` (accessToken, user data).
- **TanStack Query**: Used for data fetching (cycles, symptoms, insights, predictions).
  - **Optimistic Updates**: For symptom logging, update the query cache immediately and rollback on failure.
  - **Skeleton Loaders**: Use `isLoading` from React Query to show skeletons.

### 5. Routing
- `react-router-dom`:
  - `/login`, `/register`: Public routes.
  - `/dashboard`, `/log`, `/insights`, `/analytics`, `/settings`: Protected routes.
  - `/`: Redirects to `/dashboard` if authed, else `/login`.

## Dependencies to Install
- `axios`
- `zustand`
- `@tanstack/react-query`
- `@tanstack/react-query-devtools` (dev only)
- `react-router-dom`
- `lucide-react` (icons)
- `framer-motion` (subtle micro-animations)
- `clsx`, `tailwind-merge` (UI utilities)

## Validation Architecture
- **E2E**: Use Playwright or Vitest with Happy DOM for component testing.
- **Visual**: Verification of the "Calm Intelligence" tokens in the browser.
- **Auth**: Mock 401 response and verify refresh flow.
