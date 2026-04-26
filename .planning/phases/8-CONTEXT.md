# Phase 8 Context: Community & AI Chatbot Expansion

## 🎯 Phase Goal
Extend Lunara AI from a private tracking tool into a community-supported intelligence platform. This phase introduces an anonymous peer support board and a context-aware AI health assistant.

## 🤝 Community (Anonymous Peer Support)

### 1. Identity & Anonymity
- **Handle System**: Users can choose a one-time `communityHandle` upon first joining the community.
- **Privacy**: The real name/email of the user must NEVER be exposed in the community database queries or frontend.
- **Persistence**: Handles are tied to the account but displayed as the sole identifier on the board.

### 2. Discussion Board Structure
- **Mechanism**: Message-board style (REST-based Posts & Comments). Real-time Socket.io is NOT required for the initial community rollout.
- **Post Sharing**: Users can create posts describing problems. 
- **Symptom Snapshots**: When "sharing a report," the app will generate a text-based summary of the user's recent symptoms (e.g., "Last 7 days: High fatigue, Moderate cramps") and attach it as structured metadata to the post for context.

### 3. Data Model (Proposed)
- `CommunityProfile`: `id`, `userId`, `handle`, `createdAt`.
- `Post`: `id`, `authorHandle`, `content`, `symptomSummary` (JSON), `createdAt`.
- `Comment`: `id`, `postId`, `authorHandle`, `content`, `createdAt`.

## 🤖 AI Chatbot (Context-Aware Assistant)

### 1. Intelligence & Knowledge
- **Model**: OpenAI GPT-4o.
- **Full Context**: The bot must have access to:
  - Complete cycle history (past cycles, lengths).
  - All logged symptoms (moods, intensity, notes).
  - Previous 10-20 messages in the current session for continuity.
- **RAG/Context Injection**: Before sending the user prompt to OpenAI, the system must fetch the user's latest health data and inject it into the system prompt.

### 2. Safety & Compliance
- **Strict Disclaimers**: 
  - System prompt must explicitly state: "You are an AI health assistant, not a doctor. Do not provide medical diagnoses."
  - Every UI response must include a small, non-obtrusive medical disclaimer footer.
- **Guardrails**: Bot should decline to answer questions about specific medication dosages or surgical advice.

## 🛠 Technical Implementation Notes

### Backend (Node.js/API)
- New endpoints for `/api/community/posts` and `/api/community/comments`.
- New endpoint `/api/chat/message` (POST) to handle the AI conversation.
- Use `bull` queues if response generation takes >5 seconds (though direct streaming is preferred if possible).

### AI Service (Python/FastAPI)
- New endpoint `POST /chat/completions` that accepts user prompt + health context + history.
- Logic to truncate/summarize health data if it exceeds context window limits.

### Frontend (React)
- **Community Page**: Feed of posts with "Comment" and "Share My Insight" actions.
- **Chat Widget**: Floating or dedicated "Ask Lunara" page with message bubbles.
