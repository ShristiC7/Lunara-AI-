# Phase 7 Research: Frontend Foundation

## Technical Summary

### 1. Vite + React (TS)
- **Scaffold**: `npm create vite@latest web -- --template react-ts`.
- **Base URL**: The backend currently serves from `http://localhost:3000/api`. The Vite dev server will likely run on `5173`. A proxy in `vite.config.ts` will be used to route `/api` to the backend.

### 2. Design System: Calm Intelligence
- **Tailwind Config**:
  - `extend.colors`:
    - `bg-main`: `#FAF7FF`
    - `lavender`: `#F3E8FF`
    - `soft-pink`: `#FCE7F3`
    - `accent-pink`: `#EC4899`
    - `peach`: `#FFE4D6`
  - `fontFamily`:
    - `sans`: `['Inter', 'sans-serif']`
    - `display`: `['Outfit', 'sans-serif']`
- **Typography**: 
  - Outfit (Google Fonts) for display/headings.
  - Inter (Google Fonts) for body text.

### 3. Authentication Strategy
- **Backend Behavior**:
  - `POST /api/auth/login`: Returns `{ success: true, data: { accessToken } }`. Sets `refreshToken` in an HttpOnly cookie.
  - `POST /api/auth/refresh`: Reads `refreshToken` from cookie. Returns `{ success: true, data: { accessToken } }`. Rotates `refreshToken` in cookie.
- **Frontend Interceptors**:
  - `axiosInstance.interceptors.response`:
    - On `401` error, check if it's not the `/auth/refresh` or `/auth/login` endpoint.
    - If `401`, call `POST /api/auth/refresh` (with `withCredentials: true`).
    - If refresh succeeds, retry the original request with the new `accessToken`.
    - If refresh fails, clear auth state and redirect to login.

### 4. State Management
- **Zustand**: Used for `useAuthStore` (accessToken, user data).
- **TanStack Query**: Used for data fetching (cycles, symptoms, insights).
- **Persistence**: Persist `accessToken` in memory. Let the browser handle the `refreshToken` cookie.

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
