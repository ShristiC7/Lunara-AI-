# Feature Research

**Domain:** Women's Health AI Platform (Cycle Tracking + AI Insights)
**Researched:** 2026-04-25
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Account registration & login | Every health app has accounts; data must be private | LOW | Email/password + JWT; email verification optional in v1 |
| Secure password reset | Standard security expectation | MEDIUM | Email-based token with TTL |
| Menstrual cycle logging | Core product function — start date, end date | LOW | Date-picker input; calculate cycle length automatically |
| Daily symptom logging | Clue/Flo users log daily; sets expectation | LOW | Mood, flow, pain, energy, notes per day |
| Period prediction | Primary value of a cycle tracker | MEDIUM | ML + average-based fallback; show confidence range |
| Ovulation window estimation | Fertility awareness is top user need | MEDIUM | Derived from cycle length + luteal phase constants |
| Cycle history view | Users want to see past patterns | LOW | List of logged cycles with stats |
| Data privacy | Health apps must feel private | LOW | No social sharing, clear privacy language |

### Differentiators (Competitive Advantage)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| AI symptom analysis (GPT-4o) | Personalized insights vs generic tips | HIGH | System prompt + structured user data; response cached 24h |
| ML cycle prediction (scikit-learn) | More accurate than calendar math after 3+ cycles | HIGH | Regression on historical data; uncertainty bands shown |
| Automated PDF health report | Export full health summary for doctor visits | HIGH | Puppeteer + Handlebars; covers 3-6 months of data |
| Email report delivery | Convenient access even if app deleted | MEDIUM | Nodemailer; attachment with secure link |
| Trend analysis across cycles | Identify patterns (premenstrual mood, etc.) | MEDIUM | Aggregation queries; surfaced in AI insights |
| Personalized GPT-4o recommendations | Tailored to this user's symptom patterns | HIGH | Multi-cycle data injected into prompt context |
| Async job status tracking | Users know when AI is processing | MEDIUM | Bull job ID returned immediately; polling or future WebSocket |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Social sharing / community | "Share cycle data with friends" | Catastrophic privacy risk for sensitive health data | Keep fully private; add anonymous community v3+ |
| Healthcare provider portal | "Share reports with doctor" | Requires HIPAA BAAs, legal complexity, separate auth system | User downloads PDF and shares manually |
| Real-time push notifications | "Remind me to log today" | Requires FCM/APNs service, complex; app hasn't launched | Email reminders via scheduler in v2 |
| Wearable integration | "Sync from Garmin/Apple Watch" | Each integration needs separate OAuth + data mapping | Manual logging for v1; integrations as v2 paid feature |
| Partner access | "Let my partner see my cycle" | Consent management complexity, privacy risk | Out of scope — personal use only |
| In-app chat with AI | "Chat with a health coach" | Unbounded conversation = high token costs | Structured insight cards from logged data |

## Feature Dependencies

```
User Registration
    └──requires──> Email Verification (optional v1)
    └──enables──> Cycle Logging

Cycle Logging
    └──requires──> User Account
    └──enables──> Period Prediction
    └──enables──> Symptom Logging

Symptom Logging
    └──requires──> Cycle Logging (date context)
    └──enables──> AI Symptom Analysis

AI Symptom Analysis
    └──requires──> Symptom Logging (≥1 entry)
    └──requires──> OpenAI API key configured
    └──enhances──> PDF Health Report

PDF Health Report
    └──requires──> Cycle History (≥1 complete cycle)
    └──requires──> Puppeteer + Handlebars
    └──enables──> Email Delivery

Period Prediction (ML)
    └──requires──> Cycle History (≥3 cycles for ML accuracy)
    └──fallback──> Average-based calculation (0 cycles)
```

### Dependency Notes

- **AI Analysis requires Symptom Logging:** GPT-4o needs structured symptom data to give personalized (not generic) insights
- **ML Prediction requires ≥3 cycles:** Below 3 cycles, fall back to 28-day average + user-provided cycle length
- **PDF Report requires complete cycle:** Cannot generate meaningful report from partial data; require at least 1 end-dated cycle

## MVP Definition

### Launch With (v1)

- [x] User registration, login, JWT auth, password reset — users can't use app without this
- [x] Cycle logging (start date, end date, cycle length auto-calculated) — core function
- [x] Daily symptom logging (mood, flow intensity, pain level, energy, free-text notes) — enables AI
- [x] Period prediction + ovulation window (ML with average fallback) — primary value prop
- [x] AI symptom analysis via GPT-4o (async, Bull-queued) — differentiator
- [x] Automated PDF health report generation (Puppeteer + Handlebars) — key differentiator
- [x] Email report delivery (Nodemailer) — convenience + accessibility
- [x] Cycle history view + basic stats (average length, regularity) — expected baseline

### Add After Validation (v1.x)

- [ ] Email reminders (log today, period incoming) — add when users request it
- [ ] Trend analysis dashboard (symptom patterns across cycles) — after 2+ months of data
- [ ] Personalized AI recommendations over multiple cycles — needs history for training context

### Future Consideration (v2+)

- [ ] Anonymous community insights (aggregate patterns, not personal) — needs significant user base
- [ ] Wearable data import (step count, sleep, HRV correlation) — if users request and monetize
- [ ] Fertility mode (BBT tracking, OPK integration) — separate regulated feature set
- [ ] Mobile app (React Native) — after web product-market fit

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Registration + Auth | HIGH | LOW | P1 |
| Cycle Logging | HIGH | LOW | P1 |
| Symptom Logging | HIGH | LOW | P1 |
| Period Prediction (ML) | HIGH | MEDIUM | P1 |
| AI Symptom Analysis | HIGH | HIGH | P1 |
| PDF Report | HIGH | HIGH | P1 |
| Email Delivery | HIGH | MEDIUM | P1 |
| Cycle History Stats | MEDIUM | LOW | P1 |
| Email Reminders | MEDIUM | MEDIUM | P2 |
| Trend Analysis | HIGH | MEDIUM | P2 |
| Wearable Integration | MEDIUM | HIGH | P3 |
| Mobile App | HIGH | HIGH | P3 |

## Competitor Feature Analysis

| Feature | Flo | Clue | Natural Cycles | Lunara AI |
|---------|-----|------|----------------|-----------|
| Cycle logging | ✓ | ✓ | ✓ | ✓ |
| Symptom logging | ✓ | ✓ | ✓ | ✓ |
| Period prediction | ✓ | ✓ | ✓ (temp-based) | ✓ (ML + avg) |
| AI insights | ✓ (GPT) | ✗ | ✗ | ✓ (GPT-4o) |
| PDF export | ✗ | ✓ (basic) | ✓ (medical) | ✓ (branded) |
| Email reports | ✗ | ✗ | ✓ | ✓ |
| Open source | ✗ | ✗ | ✗ | Potential |
| Social features | ✓ | ✗ | ✗ | ✗ (privacy-first) |
| Wearable sync | ✓ | ✓ | ✓ (temp) | v2 |

## Sources

- Flo, Clue, Natural Cycles feature analysis (public product pages)
- App Store reviews of leading cycle tracking apps
- Women's health UX studies (IDEO, Nielsen Norman Group)

---
*Feature research for: Lunara AI - Women's Health Platform*
*Researched: 2026-04-25*
