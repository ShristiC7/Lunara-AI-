---
phase: "03"
topic: "AI Service — Prediction + Insights"
updated: 2026-04-26
---

# Phase 3 Research: AI Service (Python FastAPI)

## 1. FastAPI Project Structure
The AI service (`ai/`) should follow a standard asynchronous FastAPI structure:
- `ai/app/main.py`: Entry point.
- `ai/app/api/`: Route handlers.
- `ai/app/services/`: Business logic (ML prediction, GPT analysis).
- `ai/app/schemas/`: Pydantic models for request/response validation.
- `ai/app/utils/`: Utilities (OpenAI client, custom error handlers).
- `ai/requirements.txt`: Dependencies (`fastapi`, `uvicorn`, `scikit-learn`, `openai`, `tenacity`, `pydantic`, `pandas`, `numpy`, `httpx`, `pytest`).

## 2. Cycle Prediction (Hybrid Approach)
- **Data Input**: List of historical cycles with `startDate` and `endDate`.
- **Logic**:
  - **< 3 cycles**: Fallback to a rolling average of 28 days (standardized). Return confidence `LOW`.
  - **3-5 cycles**: Use `LinearRegression` or `Ridge` from `scikit-learn` on cycle lengths. Return confidence `MEDIUM`.
  - **> 5 cycles**: Higher degree of accuracy for regression. Include ovulation window (standard: 14 days before next period). Return confidence `HIGH`.
- **Model Storage**: Models are small enough to be fitted on-the-fly or serialized via `joblib`. Since cycle data is small per user, fitting on-the-fly ensures the most recent data is always used.

## 3. Symptom Analysis (OpenAI GPT-4o)
- **Prompt Engineering**:
  - System prompt must be strictly controlled (non-user-influenced).
  - Guidelines: Provide medical-grade style insights without making definitive diagnoses (disclaimer required).
- **Structured Output**: Use Pydantic models with `AsyncOpenAI` for response parsing.
- **Resilience**: `tenacity` for exponential backoff on `RateLimitError` or temporary API failures.

## 4. Node API Integration
- **Communication**: Node.js calls FastAPI via internal Docker networking (`http://ai-service:8000`).
- **Async Handling**: AI analysis takes time (> 2s). Node.js should handle the initial trigger as an async job (Bull queue implemented in Phase 4, but the endpoint should return 202 accepted).
- **Rate Limiting**: Redis-based counter in Node.js to limit 10 AI requests/day per user.

## 5. Security & Validation
- **Sanitization**: Python side should also sanitize incoming notes (strip special characters).
- **Pydantic v2**: Strict validation for all incoming and outgoing schemas to ensure data integrity between services.

## Validation Architecture
- **API Tests**: `httpx` + `pytest` to test FastAPI endpoints.
- **Logic Tests**: Unit tests for `cycle_predictor.py` and `symptom_analyzer.py` with varied data sets.
- **Mocking**: `unittest.mock` for OpenAI calls.
- **Integration**: `supertest` in Node to verify the "Fetch Prediction" end-to-end path.

## Next Steps for Planning
- Plan 3.1: FastAPI setup + Cycle Prediction service logic.
- Plan 3.2: OpenAI integration + Symptom Analysis service logic.
- Plan 3.3: Node.js API bridge endpoints and client calls.
- Plan 3.4: Comprehensive pytest suite.
