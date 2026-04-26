# Phase 7 Context: Premium Frontend UI/UX

## Core Decisions

### 1. Design Aesthetic: "Calm Intelligence"
- **Style**: Minimalist, clean, structured. Strictly avoiding glassmorphism, neon gradients, or dashboard clutter.
- **Color Palette (Strict)**:
  - Lavender (Base): `#F3E8FF`
  - Soft Pink (Interaction): `#FCE7F3`
  - Accent Pink (CTA): `#EC4899`
  - Peach (Alerts/Highlights): `#FFE4D6`
  - Background: `#FAF7FF` | Surface: `#FFFFFF`
- **Typography**: Inter (Primary). h1: 26-28px, h2: 20-22px, body: 14-15px.
- **UI Style**: 14-16px border radius, subtle shadows, generous spacing.
- **Icons**: Lucide React (outline-based).

### 2. Navigation & Structure
- **Persistent Sidebar**: Desktop-first sidebar for stability, likely collapsing to a bottom bar for mobile.
- **Core Pages**: Dashboard, Symptom Logger, Insights, Analytics, Settings, Auth (Login/Register).

### 3. Dashboard Logic
- **Authority**: The frontend **must** rely on the `/predictions/current` API response for the current phase (Follicular, Luteal, etc.) to ensure sync with AI models.
- **Cycle Ring**: Main visual focus showing current cycle day and phase.
- **Insight Card**: Show ONLY ONE primary insight at a time for clarity.

### 4. Technical Architecture
- **Tech Stack**: React (Vite), Tailwind CSS, React Query, Axios, React Router, Recharts.
- **Authentication**: 
  - Access Token: In-memory (Zustand).
  - Refresh Token: HttpOnly Cookie flow.
  - Interceptors: Automated 401 handling with `/api/v1/auth/refresh`.
- **Data Fetching**: Hooks (`usePredictions`, `useInsights`, etc.) with Skeleton Loaders. No spinners.

### 5. Interaction & Performance
- **Logging Speed**: Target < 20 seconds for full symptom log. No typing required for core inputs (buttons/sliders only).
- **Perception**: < 300ms perceived delay. Optimistic updates for logging.
- **Heatmaps**: Analytics must show both **Severity** and **Frequency** of symptoms.

## Integration Details
- **Base URL**: `/api/v1/`
- **Encryption**: Include small "Your data is encrypted and private" trust hints throughout the UX.

## Out of Scope (Deferred)
- Generic AI UI templates.
- Heavy animations or non-functional transitions.
- Social features or external integrations.
