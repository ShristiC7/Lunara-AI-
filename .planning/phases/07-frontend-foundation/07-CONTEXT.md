# Phase 7 Context: Frontend Foundation

## Decisions

### 1. Directory Structure
- **Root Directory**: `web/` (standard Vite structure).
- **Architecture**: Modular React components, hooks-based logic, and service-layer for API calls.

### 2. Tech Stack
- **Framework**: React (Vite) + TypeScript.
- **Styling**: Tailwind CSS + Vanilla CSS for custom Calm Intelligence tokens.
- **State Management**: 
    - **Server State**: React Query (TanStack Query) for data fetching, caching, and synchronization.
    - **Client State**: Zustand for lightweight global state (auth, user profile).
- **Navigation**: React Router v6.
- **API Client**: Axios with interceptors for JWT access/refresh token rotation.

### 3. Design System (Calm Intelligence)
- **Philosophy**: Minimal, clean, structured. No flashy animations, only micro-interactions.
- **Color Palette**:
    - `Background`: `#FAF7FF`
    - `Lavender (Primary)`: `#F3E8FF`
    - `Soft Pink (Secondary)`: `#FCE7F3`
    - `Accent Pink`: `#EC4899`
    - `Peach (Warm)`: `#FFE4D6`
- **Typography**: 
    - **Headings**: Outfit (Premium, soft rounded look).
    - **Body**: Inter (Clean, highly legible).

### 4. Auth Implementation
- **Login/Register**: Traditional email/password.
- **Token Management**: Axios interceptor monitors 401 errors → triggers `/api/auth/refresh` → retries original request.
- **Storage**: Access token in-memory; Refresh token in HttpOnly cookie (handled by backend/browser) or secure storage.

## Specifics

### Key UI Requirements
- **Dashboard**: Cycle Ring, Next Period Card (Peach tint if near), single primary Insight Card.
- **Symptom Logger**: Pill-style buttons, slider for pain, tap for energy. Goal: < 20 seconds to complete.
- **Analytics**: Recharts for cycle history and symptom trends.

### Backend Integration
- **Base URL**: `/api/v1/` (Note: existing API endpoints in Milestone 1 were mapped to `/api/`. I will verify if a prefix change is needed or use a proxy).

## Deferred Ideas
- Mobile App (Web-first approach).
- Social features.
- Payment gateways.
