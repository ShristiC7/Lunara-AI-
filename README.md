# 🌙 Lunara AI

<div align="center">

**AI-Powered Menstrual & Hormonal Wellness Companion**

*Built by LUNARA AI — where intelligence meets women's health*

[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![License](https://img.shields.io/badge/License-Proprietary-6B21A8?style=for-the-badge)](./LICENSE)

---

> *"Tracking tells you what happened. Intelligence tells you what to expect."*

[Features](#-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [AI Models](#-ai--ml-models) • [Testing](#-testing) • [Deployment](#-deployment) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Why HerCycle AI](#-why-hercycle-ai)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Setup](#environment-setup)
  - [Running the Application](#running-the-application)
- [API Reference](#-api-reference)
  - [Authentication](#authentication)
  - [Cycle Logs](#cycle-logs)
  - [Symptoms](#symptoms)
  - [Predictions](#predictions)
  - [Insights](#insights)
  - [Alerts](#alerts)
  - [Recommendations](#recommendations)
  - [Reports](#reports)
  - [User & GDPR](#user--gdpr)
  - [Health Checks](#health-checks)
- [AI / ML Models](#-ai--ml-models)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Security](#-security)
- [Privacy & Ethics](#-privacy--ethics)
- [Team](#-team)
- [Roadmap](#-roadmap)

---

## 🌸 About the Project

HerCycle AI is a next-generation wellness platform built by **LUNARA AI** that transforms menstrual health tracking from a passive calendar into an **AI-powered intelligence system**. It learns each user's unique biological rhythms and delivers personalized insights, early anomaly detection, and actionable wellness guidance.

The project was born from a deeply personal frustration — women in demanding careers routinely deprioritize their own health, yet no existing tool connects their daily experience to meaningful, individualized understanding of their body.

**HerCycle AI is the tool that finally bridges that gap.**

---

## 💡 Why HerCycle AI

| Existing Apps | HerCycle AI |
|---|---|
| Predict based on population averages | Learns your individual biological rhythm |
| Record symptoms with no analysis | Correlates symptoms to hormonal phases using ML |
| No irregularity detection | Flags anomalies early using Isolation Forest |
| Generic advice for all users | Phase-aware, symptom-adapted personalized recommendations |
| No medical utility | Generates structured, doctor-ready PDF health reports |
| Questionable data privacy | Encrypted, user-owned data — never sold or shared |

---

## ✨ Features

### 🔮 Smart Cycle Prediction
Adaptive time-series ML model (ARIMA) that learns your personal cycle pattern. Graduates from rule-based to AI prediction after just 3 logged cycles, improving in accuracy with every new data point.

- Predicted start window with confidence score
- 95% confidence interval visualization
- Phase calendar: Menstrual → Follicular → Ovulation → Luteal
- Prediction accuracy tracking vs actual dates

### 🧠 Symptom Intelligence Engine
Log mood, pain, energy, sleep, and stress daily. The AI surfaces statistically significant correlations between your symptoms and your hormonal phases.

> *"Your energy tends to be lower during your Luteal phase — this matches your logs 78% of the time."*

### ⚠️ Irregularity Detection
Passive background monitoring using Isolation Forest. Flags three types of anomalies:
- **Cycle Length Deviation** — more than 7 days from your personal average
- **Skipped Period** — more than 35 days since predicted start
- **Recurring Severe Pain** — pain ≥8 in three or more consecutive cycles

All alerts are informational risk indicators — never diagnoses.

### 💚 Personalized Wellness Recommendations
Phase-aware suggestions across five categories: Nutrition, Exercise, Rest, Hydration, and Stress. Adapts to your logged symptoms and learns from your feedback over time.

### 📄 Health Summary Reports
Exportable PDF reports built for medical consultations. Includes cycle trends, symptom distribution, prediction accuracy, and flagged irregularities — everything your doctor needs in one clean document.

### 🔒 Privacy by Design
Your health data is yours. Encrypted at rest (AES-256), encrypted in transit (TLS 1.3), never sold, never shared. Full GDPR-compliant data export and account deletion on demand.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LUNARA AI — SYSTEM                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   [React Frontend — handled by frontend team member]                │
│              │ REST + WebSocket                                      │
│              ▼                                                       │
│   ┌──────────────────────────┐                                       │
│   │  Node.js + Express API   │  ← Port 4000                         │
│   │  TypeScript + Prisma     │                                       │
│   │  Bull Queue + Socket.io  │                                       │
│   └────────────┬─────────────┘                                       │
│                │                                                     │
│    ┌───────────┼────────────┐                                        │
│    ▼           ▼            ▼                                        │
│  PostgreSQL  Redis 7    Python FastAPI                               │
│  (Primary)  (Cache +    AI Service ← Port 8000                      │
│              Queue)     ├── ARIMA Prediction                        │
│                         ├── Symptom Correlation                     │
│                         ├── Anomaly Detection                       │
│                         └── Recommendation Engine                   │
│                                                                     │
│   AWS S3 (Reports + ML Models) │ AWS Secrets Manager │ FCM          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow — Symptom Log → AI Insight

```
User logs symptoms
       │
       ▼
POST /api/v1/symptoms
       │
       ├─→ Optimistic 201 response (fast — user sees confirmation)
       │
       ├─→ Save to PostgreSQL
       │
       └─→ Dispatch Bull job ──→ AI Worker
                                      │
                              ┌───────┼────────┐
                              ▼       ▼        ▼
                          Predict  Analyze  Detect
                          Cycle    Symptoms  Anomalies
                              │       │        │
                              └───────┼────────┘
                                      │
                              Save results to DB
                                      │
                              Emit Socket.io event
                                      │
                              Frontend updates in real-time
```

---

## 🛠 Tech Stack

### Backend API (`/api`)
| Concern | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Express 4 + TypeScript 5 (strict) |
| ORM | Prisma 5 |
| Validation | Zod |
| Authentication | JWT (access: 15min) + Refresh Token (UUID, 30d, Redis) |
| Job Queue | Bull 4 (Redis-backed) |
| Real-time | Socket.io 4 |
| Logging | Winston (structured JSON) |
| PDF Generation | Puppeteer 21 + Handlebars |
| Cloud Storage | AWS S3 (presigned URLs) |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Error Tracking | Sentry |
| Security | helmet, cors, express-rate-limit, bcrypt (cost 12) |
| Metrics | prom-client (Prometheus format) |

### AI Service (`/ai-service`)
| Concern | Technology |
|---|---|
| Framework | Python 3.11 + FastAPI 0.110 |
| Cycle Prediction | statsmodels ARIMA (1,1,1) |
| Anomaly Detection | scikit-learn IsolationForest + scipy Z-score |
| Symptom Analysis | scipy Pearson correlation + pandas feature engineering |
| Recommendation | Rule engine + collaborative filtering (scikit-learn) |
| Model Persistence | joblib → local filesystem (dev) or AWS S3 (prod) |
| Validation | Pydantic v2 |

### Infrastructure
| Concern | Technology |
|---|---|
| Database | PostgreSQL 15 (AWS RDS in prod) |
| Cache / Queue | Redis 7 (AWS ElastiCache in prod) |
| Containers | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | AWS ECS Fargate + ALB + CloudFront |
| Secrets | AWS Secrets Manager |

---

## 📁 Project Structure

```
lunara-hercycle/
├── api/                              # Node.js Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── index.ts              # Zod-validated env config
│   │   │   ├── secrets.ts            # AWS Secrets Manager loader
│   │   │   └── validate-env.ts       # Startup env validation script
│   │   ├── lib/
│   │   │   ├── prisma.ts             # Prisma singleton client
│   │   │   ├── redis.ts              # ioredis singleton
│   │   │   └── socket.ts             # Socket.io server + JWT auth
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # JWT verify → req.user
│   │   │   ├── security.ts           # helmet, cors, rate-limit, hpp
│   │   │   ├── audit.ts              # Append-only audit logger
│   │   │   ├── sanitize.ts           # HTML strip from all inputs
│   │   │   ├── validate.ts           # Zod middleware factory
│   │   │   ├── request-logger.ts     # Structured request logging
│   │   │   └── error.middleware.ts   # Global error handler
│   │   ├── routes/                   # Route definitions (auth, cycles, etc.)
│   │   ├── controllers/              # Request handling layer
│   │   ├── services/                 # Business logic layer
│   │   ├── queues/
│   │   │   └── ai.queue.ts           # Bull queue + job type definitions
│   │   ├── workers/
│   │   │   ├── ai.worker.ts          # AI pipeline orchestrator
│   │   │   └── gdpr.worker.ts        # Delayed hard-delete processor
│   │   ├── schemas/                  # Zod request validation schemas
│   │   └── utils/
│   │       ├── logger.ts             # Winston structured logger
│   │       ├── errors.ts             # AppError hierarchy + asyncHandler
│   │       ├── cycle-phases.ts       # Phase computation from cycle dates
│   │       ├── encryption.ts         # AES-256-GCM email encryption
│   │       ├── report-stats.ts       # Pure stat functions for PDF
│   │       └── ai-client.ts          # Typed axios client for AI service
│   ├── prisma/
│   │   ├── schema.prisma             # Complete DB schema (7 models, 13 enums)
│   │   └── seed.ts                   # Realistic dev seed data
│   ├── templates/
│   │   └── report.hbs                # PDF report HTML template
│   ├── tests/
│   │   ├── setup.ts                  # Jest global mocks + env setup
│   │   ├── unit/                     # Pure function unit tests
│   │   ├── integration/              # Endpoint integration tests
│   │   └── e2e/                      # Full user journey test
│   ├── package.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   └── .env.example
│
├── ai-service/                       # Python FastAPI AI Service
│   ├── app/
│   │   ├── main.py                   # FastAPI app + CORS + lifespan
│   │   ├── config.py                 # Pydantic settings
│   │   ├── models/
│   │   │   ├── cycle_predictor.py    # ARIMA time-series model
│   │   │   ├── symptom_analyzer.py   # Pearson correlation engine
│   │   │   ├── anomaly_detector.py   # Isolation Forest + Z-score
│   │   │   └── recommender.py        # Rule + feedback-based ranking
│   │   ├── routers/                  # FastAPI route handlers
│   │   ├── services/
│   │   │   └── model_store.py        # joblib → local/S3 persistence
│   │   ├── content/
│   │   │   └── recommendations.json  # 60+ vetted wellness recommendations
│   │   └── utils/
│   │       ├── features.py           # pandas feature engineering
│   │       └── insights.py           # Natural language insight generation
│   ├── tests/                        # pytest test suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml                # Local development (all 4 services)
├── docker-compose.prod.yml           # Production (API + AI only)
├── .github/
│   └── workflows/
│       ├── test.yml                  # CI: test + lint + security scan
│       └── deploy.yml                # CD: staging + production ECS deploy
└── secrets/
    └── SECRETS_GUIDE.md              # How to obtain every secret
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

| Tool | Version | Check |
|---|---|---|
| Node.js | 20 LTS | `node --version` |
| npm | 9+ | `npm --version` |
| Python | 3.11 | `python3 --version` |
| Docker Desktop | Latest | `docker --version` |
| Docker Compose | V2 | `docker compose version` |
| Git | Any | `git --version` |
| AWS CLI | v2 | `aws --version` *(for deployment only)* |

> **Recommended:** Use [nvm](https://github.com/nvm-sh/nvm) for Node.js and [pyenv](https://github.com/pyenv/pyenv) for Python version management.

```bash
# Install correct Node.js version
nvm install 20
nvm use 20

# Install correct Python version
pyenv install 3.11.9
pyenv global 3.11.9
```

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/lunara-ai/hercycle-ai.git
cd hercycle-ai
```

**2. Install Node.js dependencies**

```bash
cd api
npm install
```

**3. Install Python dependencies**

```bash
cd ../ai-service
pip install -r requirements.txt
```

---

### Environment Setup

**4. Copy the example environment files**

```bash
# From the project root:
cp api/.env.example api/.env
cp ai-service/.env.example ai-service/.env
```

**5. Generate your secrets**

```bash
# Generate JWT secrets (run twice — one for each):
openssl rand -hex 64   # → JWT_SECRET
openssl rand -hex 64   # → JWT_REFRESH_SECRET

# Generate email encryption keys:
openssl rand -hex 32   # → EMAIL_ENCRYPTION_KEY
openssl rand -hex 16   # → EMAIL_ENCRYPTION_IV
```

**6. Fill in `api/.env`**

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hercycle_dev
REDIS_URL=redis://localhost:6379

JWT_SECRET=<paste your generated 64-char hex>
JWT_REFRESH_SECRET=<paste your other generated 64-char hex>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d

EMAIL_ENCRYPTION_KEY=<paste your 32-char hex>
EMAIL_ENCRYPTION_IV=<paste your 16-char hex>

AI_SERVICE_URL=http://localhost:8000

AWS_REGION=ap-south-1
AWS_S3_BUCKET_REPORTS=hercycle-reports-dev
AWS_S3_BUCKET_MODELS=hercycle-ml-models-dev

FCM_SERVER_KEY=<from Firebase Console — see secrets/SECRETS_GUIDE.md>
SENTRY_DSN=<from sentry.io — optional for dev>
```

**7. Fill in `ai-service/.env`**

```env
PYTHONENV=development
LOG_LEVEL=DEBUG
MODEL_STORE_BACKEND=local
MODEL_STORE_PATH=./model_data
AWS_REGION=ap-south-1
AWS_S3_BUCKET_MODELS=hercycle-ml-models-dev
```

> 📖 For full instructions on obtaining every secret (Firebase, AWS S3, Sentry), see [`secrets/SECRETS_GUIDE.md`](./secrets/SECRETS_GUIDE.md).

**8. Validate your environment**

```bash
cd api
npm run validate:env
```

Expected output:
```
✅  NODE_ENV          PRESENT   development
✅  PORT              PRESENT   4000
✅  DATABASE_URL      PRESENT   postgresql://...
✅  JWT_SECRET        PRESENT   [64 chars]
✅  JWT_REFRESH_SECRET PRESENT  [64 chars]
...
All environment variables validated successfully.
```

---

### Running the Application

**9. Start all services with Docker Compose**

```bash
# From project root:
docker compose up --build
```

This starts:
- `postgres` — PostgreSQL 15 on port `5432`
- `redis` — Redis 7 on port `6379`
- `api` — Node.js API on port `4000`
- `ai-service` — Python FastAPI on port `8000`

**10. Run database migrations and seed**

```bash
cd api

# Run migrations:
npx prisma migrate dev --name init

# Seed with development data:
npm run db:seed
```

**11. Verify everything is running**

```bash
# API health check:
curl http://localhost:4000/health
# → {"status":"ok","uptime":42.1,"version":"1.0.0"}

# AI service health check:
curl http://localhost:8000/health
# → {"status":"healthy","models_available":["cycle_predictor","symptom_analyzer","anomaly_detector","recommender"]}

# Deep health check (all dependencies):
curl http://localhost:4000/health/deep
# → {"status":"healthy","services":{"database":{"status":"ok","latencyMs":3},"redis":{"status":"ok","latencyMs":1},"ai_service":{"status":"ok","latencyMs":12}}}
```

**12. Open Prisma Studio** *(optional — visual DB browser)*

```bash
cd api
npx prisma studio
# Opens at http://localhost:5555
```

**13. Run in development mode** *(hot reload)*

```bash
# API (in one terminal):
cd api
npm run dev

# AI service (in another terminal):
cd ai-service
uvicorn app.main:app --reload --port 8000
```

---

## 📡 API Reference

Base URL: `http://localhost:4000/api/v1`

All protected routes require:
```
Authorization: Bearer <access_token>
```

---

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ❌ | Create new account |
| `POST` | `/auth/login` | ❌ | Login, get tokens |
| `POST` | `/auth/refresh` | ❌ | Rotate refresh token (cookie) |
| `POST` | `/auth/logout` | ✅ | Invalidate session |
| `GET` | `/auth/verify/:token` | ❌ | Verify email address |
| `POST` | `/auth/oauth` | ❌ | OAuth login (Google/Apple) |

**Register**
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya@example.com",
    "password": "SecurePass123!"
  }'
```
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "userId": "uuid-here",
    "isEmailVerified": false
  }
}
```

**Login**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "priya@example.com", "password": "SecurePass123!"}'
```

---

### Cycle Logs

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/cycles` | ✅ | List cycle logs (paginated) |
| `POST` | `/cycles` | ✅ | Log period start/end |
| `PATCH` | `/cycles/:id` | ✅ | Update cycle log |
| `DELETE` | `/cycles/:id` | ✅ | Delete cycle log |
| `GET` | `/cycles/stats` | ✅ | Cycle statistics summary |

**Log a Period**
```bash
curl -X POST http://localhost:4000/api/v1/cycles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2025-01-14",
    "endDate": "2025-01-19",
    "flowIntensity": "MODERATE",
    "notes": "Started 2 days early"
  }'
```
```json
{
  "logId": "uuid-here",
  "userId": "uuid-here",
  "startDate": "2025-01-14T00:00:00.000Z",
  "endDate": "2025-01-19T00:00:00.000Z",
  "cycleLength": 27,
  "flowIntensity": "MODERATE"
}
```

---

### Symptoms

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/symptoms` | ✅ | Log today's symptoms (upsert) |
| `GET` | `/symptoms` | ✅ | Get symptom logs (date range) |
| `GET` | `/symptoms/:date` | ✅ | Get symptom log for specific date |
| `GET` | `/symptoms/summary` | ✅ | Aggregated symptom stats |

**Log Symptoms**
```bash
curl -X POST http://localhost:4000/api/v1/symptoms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "logDate": "2025-01-20",
    "mood": "ANXIOUS",
    "painLevel": 6,
    "energyLevel": "LOW",
    "sleepQuality": "POOR",
    "sleepHours": 5.5,
    "stressLevel": 4,
    "stressTags": ["work", "deadline"],
    "notes": "Big sprint deadline today"
  }'
```

> **Note:** Logging symptoms triggers an asynchronous AI analysis job. New predictions, insights, alerts, and recommendations will appear via WebSocket events within seconds.

---

### Predictions

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/predictions/current` | ✅ | Current cycle prediction |
| `GET` | `/predictions/history` | ✅ | Past predictions with accuracy |
| `POST` | `/predictions/actual` | ✅ | Record actual start date |

**Current Prediction Response**
```json
{
  "predictionId": "uuid-here",
  "predictedStart": "2025-02-10",
  "predictedEnd": "2025-02-13",
  "windowDays": 3,
  "confidence": 0.82,
  "source": "ARIMA",
  "modelVersion": "1.0",
  "currentPhase": "LUTEAL",
  "currentPhaseDay": 8
}
```

---

### Insights

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/insights/today` | ✅ | Today's AI insight card |
| `GET` | `/insights` | ✅ | Insight history (paginated) |
| `PATCH` | `/insights/:id/dismiss` | ✅ | Dismiss an insight |
| `PATCH` | `/insights/:id/feedback` | ✅ | Mark helpful / not helpful |

**Today's Insight Response**
```json
{
  "insightId": "uuid-here",
  "insightType": "PATTERN",
  "title": "Energy Pattern Detected",
  "bodyText": "Your energy tends to be lower during your Luteal phase. This matches your logs 78% of the time over the past 3 months.",
  "evidenceData": {
    "correlation": -0.67,
    "phase": "LUTEAL",
    "evidenceCount": 34
  },
  "validDate": "2025-01-20"
}
```

---

### Alerts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/alerts` | ✅ | Active unacknowledged alerts |
| `PATCH` | `/alerts/:id/acknowledge` | ✅ | Acknowledge an alert |
| `PATCH` | `/alerts/:id/report-flag` | ✅ | Flag alert for health report |

**Alert Response**
```json
{
  "alertId": "uuid-here",
  "alertType": "CYCLE_LENGTH_DEVIATION",
  "severity": "MEDIUM",
  "magnitude": 9.0,
  "contextData": {
    "personalAvg": 27.5,
    "latestLength": 36,
    "zScore": 2.1
  },
  "recommendedAction": "This cycle was 9 days longer than your personal average. Consider discussing this pattern with your healthcare provider.",
  "acknowledged": false,
  "createdAt": "2025-01-20T08:32:00.000Z"
}
```

> ⚠️ **All alerts are informational indicators — not medical diagnoses.**

---

### Recommendations

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/recommendations` | ✅ | Today's personalized recommendations |
| `PATCH` | `/recommendations/:id` | ✅ | Mark done or not for me |

**Recommendations Response**
```json
{
  "recommendations": [
    {
      "recId": "uuid",
      "phase": "LUTEAL",
      "category": "NUTRITION",
      "text": "Reduce refined sugar intake today — it amplifies PMS symptoms by spiking cortisol.",
      "rankScore": 0.9200
    },
    {
      "recId": "uuid",
      "phase": "LUTEAL",
      "category": "STRESS",
      "text": "Try 10 minutes of box breathing: inhale 4s, hold 4s, exhale 4s, hold 4s.",
      "rankScore": 0.8800
    }
  ],
  "generatedAt": "2025-01-20T07:00:00.000Z"
}
```

---

### Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/reports/generate` | ✅ | Generate PDF health report |

**Generate Report**
```bash
curl -X POST http://localhost:4000/api/v1/reports/generate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "fromDate": "2024-07-01",
    "toDate": "2025-01-20"
  }'
```
```json
{
  "reportUrl": "https://s3.amazonaws.com/hercycle-reports/reports/uuid/1737389..pdf?X-Amz-Expires=3600...",
  "expiresAt": "2025-01-20T09:32:00.000Z"
}
```

---

### User & GDPR

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/me` | ✅ | Get current user profile |
| `PATCH` | `/users/me` | ✅ | Update preferences |
| `POST` | `/users/me/fcm-token` | ✅ | Register push notification token |
| `GET` | `/users/me/export` | ✅ | Request full data export (GDPR) |
| `DELETE` | `/users/me` | ✅ | Delete account (requires password) |

---

### Health Checks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | ❌ | Quick uptime check |
| `GET` | `/health/deep` | ❌ | All dependencies check |
| `GET` | `/metrics` | API Key | Prometheus metrics |

---

## 🤖 AI / ML Models

### Model 1 — Cycle Predictor (ARIMA)

| Attribute | Detail |
|---|---|
| Algorithm | ARIMA(1,1,1) via statsmodels |
| Cold start | Rule-based (personal mean) with < 3 cycles |
| ML active | 3+ complete cycle logs |
| Features | Cycle length history, stress averages, sleep quality |
| Output | Predicted start date, window (days), confidence (0–1) |
| Per-user | ✅ Separate model per user — not population averages |
| Update | Online update after each new cycle logged |
| Target | MAE ≤ 2 days after 5+ cycles |

### Model 2 — Symptom Analyzer (Pearson Correlation)

| Attribute | Detail |
|---|---|
| Algorithm | scipy.stats.pearsonr per (symptom, phase) pair |
| Features | mood, pain, energy, sleep, stress × 4 phases |
| Threshold | \|r\| > 0.35 AND p < 0.10 AND n ≥ 14 days |
| Output | Correlation insights with natural language text |
| Min data | 2 complete cycles with ≥60% daily logging |

### Model 3 — Anomaly Detector (Isolation Forest + Z-Score)

| Attribute | Detail |
|---|---|
| Algorithm | Z-score for cycle deviation, rule-based for pain/skip |
| Baseline | Rolling 6-cycle personal average (not population norm) |
| Gate | Only alerts when confidence > 75% |
| Checks | Cycle length deviation, skipped period, recurring severe pain |
| False positive | Confidence gate + minimum history requirement |

### Model 4 — Recommendation Engine (Hybrid)

| Attribute | Detail |
|---|---|
| Layer 1 | Rule-based: phase × symptom threshold lookup (active day 1) |
| Layer 2 | Feedback personalization: NOT_FOR_ME exclusion, DONE deprioritization |
| Content | 60+ vetted wellness recommendations across 4 phases × 5 categories |
| Output | Max 5 recommendations, max 2 per category |
| Source | Medically-reviewed content library |

---

## 🗄 Database Schema

Seven PostgreSQL tables managed by Prisma:

```
users          ← account, auth, preferences
  │
  ├── cycle_logs      ← period start/end, flow, cycle_length (computed)
  ├── symptoms        ← daily mood/pain/energy/sleep/stress (unique per day)
  ├── predictions     ← AI cycle predictions with accuracy tracking
  ├── alerts          ← irregularity flags with severity and context
  ├── insights        ← AI-generated correlation insight cards
  └── recommendations ← phase-based wellness suggestions with feedback
```

**View and explore:**
```bash
cd api && npx prisma studio
# Opens visual database browser at http://localhost:5555
```

---

## 🧪 Testing

### Run All Tests

```bash
# Node.js API tests with coverage:
cd api
npm run test:coverage

# Python AI service tests with coverage:
cd ai-service
pytest --cov=app --cov-report=term-missing --cov-fail-under=80
```

### Test Coverage Targets

| Layer | Target | Current |
|---|---|---|
| Node.js API — Lines | ≥ 80% | [![Coverage](https://img.shields.io/badge/coverage-80%25+-brightgreen)](#) |
| Node.js API — Functions | ≥ 80% | [![Coverage](https://img.shields.io/badge/coverage-80%25+-brightgreen)](#) |
| Python AI Service | ≥ 80% | [![Coverage](https://img.shields.io/badge/coverage-80%25+-brightgreen)](#) |

### Test Suite Structure

```
api/tests/
├── setup.ts                  # Global mocks (Prisma, Redis, Socket.io, Bull)
├── unit/
│   ├── cycle-phases.test.ts  # 12 tests — phase computation logic
│   ├── report-stats.test.ts  # 10 tests — pure stat functions
│   └── encryption.test.ts    # 5 tests  — AES-256 roundtrip
├── integration/
│   ├── auth.test.ts          # 12 tests — register, login, tokens, rate-limit
│   ├── cycles.test.ts        # 8 tests  — CRUD, ownership, cycle_length
│   ├── symptoms.test.ts      # 7 tests  — upsert, date validation, Bull dispatch
│   ├── predictions.test.ts   # 5 tests  — cache, DB fallback, accuracy update
│   ├── alerts.test.ts        # 5 tests  — active alerts, ack, report flag
│   ├── reports.test.ts       # 4 tests  — generate, date validation
│   └── security.test.ts      # 8 tests  — XSS, rate-limit, CORS, 403 isolation
└── e2e/
    └── full-flow.test.ts     # 10-step complete user journey

ai-service/tests/
├── test_cycle_predictor.py   # 8 tests  — ARIMA, rule-based, accuracy
├── test_symptom_analyzer.py  # 6 tests  — correlation detection, thresholds
├── test_anomaly_detector.py  # 8 tests  — all 3 alert types + edge cases
├── test_recommender.py       # 8 tests  — ranking, categories, feedback
└── test_integration.py       # 8 tests  — FastAPI endpoints, schemas, health
```

### Run Specific Test Files

```bash
# Single test file:
cd api && npx jest tests/integration/auth.test.ts --verbose

# Single Python test:
cd ai-service && pytest tests/test_cycle_predictor.py -v

# Watch mode during development:
cd api && npm run test:watch
```

---

## 🚢 Deployment

### Prerequisites
- AWS account with appropriate IAM permissions
- GitHub repository with secrets configured (see `secrets/SECRETS_GUIDE.md`)
- ECR repositories created for `hercycle-api` and `hercycle-ai-service`

### CI/CD Pipeline

Every push triggers:

```
Push to feature branch
         │
         ▼
  GitHub Actions CI
  ├── api-test       (Jest + coverage ≥80%)
  ├── ai-test        (pytest + coverage ≥80%)
  ├── lint           (ESLint + tsc --noEmit)
  └── security-scan  (npm audit + pip-audit)
         │
  Merge to main
         │
         ▼
  Deploy to Staging (automatic)
  → Build + push Docker images to ECR
  → Update ECS task definitions
  → Update ECS services (rolling deploy)
  → Smoke test /health endpoint
         │
  Manual approval gate
         │
         ▼
  Deploy to Production
  → Same process targeting prod cluster
  → Auto-rollback if health check fails
```

### Manual Deployment

```bash
# Build and push images:
./infra/scripts/deploy.sh staging

# Or production (requires approval):
./infra/scripts/deploy.sh production
```

### Environment Variables in Production

Production secrets are stored in **AWS Secrets Manager** — not in environment files:

```
hercycle/jwt         → JWT_SECRET, JWT_REFRESH_SECRET
hercycle/database    → DATABASE_URL
hercycle/fcm         → FCM_SERVER_KEY
hercycle/sentry      → SENTRY_DSN
hercycle/encryption  → EMAIL_ENCRYPTION_KEY, EMAIL_ENCRYPTION_IV
```

---

## 🔐 Security

### Implemented Controls

| Control | Implementation |
|---|---|
| **Passwords** | bcrypt with cost factor 12 |
| **Email storage** | AES-256-GCM encrypted — never stored in plaintext |
| **Data in transit** | TLS 1.3 mandatory, HSTS enforced |
| **Data at rest** | PostgreSQL TDE + S3 SSE-AES256 |
| **JWT** | Short-lived access tokens (15min) + rotating refresh tokens (30d) |
| **Rate limiting** | 10 req/15min on auth routes, 200 req/15min globally |
| **Account lockout** | 5 failed logins → 15-minute lockout (Redis counter) |
| **Input sanitization** | sanitize-html on all string inputs (zero allowed tags) |
| **Security headers** | Full helmet.js suite (CSP, HSTS, X-Frame-Options, etc.) |
| **CORS** | Configured origin allowlist — no wildcard in production |
| **SQL injection** | Prisma parameterized queries — no raw SQL |
| **OWASP Top 10** | All 10 categories addressed |

----

## 🔏 Privacy & Ethics

HerCycle AI handles intimate health data. Our commitments:

| Principle | Implementation |
|---|---|
| **User data ownership** | You own your data. We never sell or share it. |
| **Data portability** | Full JSON export on demand (`GET /users/me/export`) |
| **Right to erasure** | Account deletion within 30 days, including ML models (`DELETE /users/me`) |
| **No diagnoses** | All AI outputs are indicators — never medical diagnoses |
| **Transparency** | Every insight shows what data drove it |
| **Anonymized analytics** | Cohort analytics only — no individual tracking |
| **GDPR** | Right to erasure, data portability, explicit consent, audit trail |
| **India DPDP** | Data localization, consent management, grievance officer |

> *"Health data belongs to the user, not the platform."*

---

## 👩‍💻 Team

**LUNARA AI** — built with intelligence, designed with empathy.

| Role | Responsibility |
|---|---|
| **AI & Backend Engineer** | Node.js API, Python AI service, database, ML models, deployment |
| **Frontend Engineer** | React application, UI/UX, component library |

---

## 🗺 Roadmap

### v1.0 — Current (MVP)
- [x] Adaptive cycle prediction (ARIMA)
- [x] Symptom logging and correlation analysis
- [x] Irregularity detection and alerts
- [x] Phase-aware wellness recommendations
- [x] PDF health report generation
- [x] GDPR-compliant data management
- [x] Docker + CI/CD pipeline

### v1.1 — Planned
- [ ] LSTM model for improved prediction accuracy (12+ cycles)
- [ ] React Native mobile app (iOS + Android)
- [ ] ML-powered recommendation personalization (collaborative filtering)
- [ ] Wearable data ingestion (Apple Watch, Fitbit)
- [ ] Healthcare provider portal for report sharing

### v2.0 — Future
- [ ] Multi-language support (Hindi, Tamil, Bengali)
- [ ] Telehealth consultation booking integration
- [ ] Community features (anonymous support groups)
- [ ] Advanced hormonal biomarker correlations

---

---



---

<div align="center">

**Built with 💜 by LUNARA AI**

*Lunara AI — Because your body deserves more than averages.*

---

[![Star this repo](https://img.shields.io/github/stars/lunara-ai/hercycle-ai?style=social)](https://github.com/lunara-ai/hercycle-ai)

</div># Lunara-AI-
