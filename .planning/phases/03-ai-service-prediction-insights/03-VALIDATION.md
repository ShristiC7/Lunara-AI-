---
phase: "03"
phase-slug: "ai-service-prediction-insights"
updated: 2026-04-26
---

# Phase 03 Validation Strategy

## Overview
Validation of the AI service focuses on prediction accuracy (math/ML), prompt integrity (security), response reliability (retries), and cross-service communication (Node <-> FastAPI).

## Criteria
- **Prediction Logic**: `pytest` verifies that with 0, 1, 3, and 5+ cycles, the dates and confidence levels match the expected hybrid logic outcomes.
- **OpenAI Resilience**: Simulated 429 errors in tests trigger the `tenacity` retry logic with expected delays.
- **Structural Integrity**: Pydantic v2 fails validation if OpenAI returns a non-conforming JSON structure, and FastAPI returns 422.
- **Boundary Isolation**: User inputs in the `notes` field (e.g. "Ignore previous commands") are sanitized or treated as raw data within the prompt template, preventing prompt injection.
- **Integration**: Node API returns 503 if FastAPI is down, and correctly returns prediction results when FastAPI is healthy.
- **Rate Limiting**: User A cannot trigger more than 10 insights per day; verified by automated loop tests.

## Success Metrics
- **Coverage**: ≥80% for Python `ai/` directory and new Node integration services.
- **P95 Latency**: Prediction endpoints < 500ms; Analysis endpoints (AI) acknowledged in < 200ms (as async trigger).
- **Security**: Prompt text contains 0 user-originating control characters.
