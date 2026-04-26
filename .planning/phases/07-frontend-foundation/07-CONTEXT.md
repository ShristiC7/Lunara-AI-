# Phase 7 Context: Frontend Foundation

## Decisions

### 1. Directory Structure
- **Root Directory**: `frontend/` (existing scaffold).
- **Architecture**: Refactoring existing components into modular React components, hooks-based logic, and service-layer for API calls.

### 2. Tech Stack
- **Framework**: React (Vite) + TypeScript.
- **Styling**: Tailwind CSS + Vanilla CSS for custom Calm Intelligence tokens.
- **State Management**: 
    - **Server State**: React Query (TanStack Query) for data fetching, caching, and synchronization.
    - **Client State**: Zustand for lightweight global state (auth, user profile).
- **Navigation**: React Router v6.
- **API Client**: Axios with interceptors for JWT access/refresh token rotation.

### 3. Integration Philosophy
- **Focus**: Connectivity and Feature Parity.
- **Visuals**: Maintain existing scaffold design (Bootstrap/Inline styles) as per user request.
- **Goal**: Ensure all backend features (Auth, Cycles, Symptoms, AI) are fully functional in the frontend.

### 4. Auth Implementation
- **Login/Register**: Add missing pages and integrate with `/api/auth`.
- **Token Management**: Axios interceptor monitors 401 errors → triggers `/api/v1/auth/refresh` → retries original request.
- **Storage**: Access token in Zustand; Refresh token in HttpOnly cookie.

## Specifics

### Key UI Requirements
- **Dashboard**: Cycle Ring, Next Period Card (Peach tint if near), single primary Insight Card.
- **Symptom Logger**: Pill-style buttons, slider for pain, tap for energy. Goal: < 20 seconds to complete.
- **Analytics**: Recharts for cycle history and symptom trends.
- **UX Optimization**:
  - **Optimistic Updates**: Immediate feedback for symptom logging before API confirmation.
  - **Loading States**: Use **Skeleton Loaders** instead of spinners for perceived speed.
  - **Interaction**: Target < 200ms perceived delay for all interactions.

### Backend Integration
- **Base URL**: `/api/v1/`
- **REST Structure**:
  - `auth`: `/api/v1/auth` (login, register, refresh, logout)
  - `cycles`: `/api/v1/cycles`
  - `symptoms`: `/api/v1/symptoms`
  - `predictions`: `/api/v1/predictions/current`
  - `insights`: `/api/v1/insights/today`
  - `alerts`: `/api/v1/alerts/active`
  - `recommendations`: `/api/v1/recommendations`
  - `reports`: `/api/v1/reports/generate` (trigger), `/api/v1/reports` (list)

## Deferred Ideas
- Mobile App (Web-first approach).
- Social features.
- Payment gateways.
