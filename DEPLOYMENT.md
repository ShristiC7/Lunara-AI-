# 🚀 Lunara AI - Deployment Guide

This guide outlines the steps to deploy Lunara AI to a production environment. The architecture is designed to be cloud-agnostic but is optimized for **Render**, **Railway**, or **AWS ECS**.

## 🏗 Deployment Architecture

| Component | Technology | Recommended Host |
| :--- | :--- | :--- |
| **API (Backend)** | Node.js / Express | Render (Web Service) |
| **AI Service** | Python / FastAPI | Render (Web Service) |
| **Frontend** | React / Vite | Vercel or Render (Static Site) |
| **Database** | PostgreSQL | Supabase or Render Postgres |
| **Cache / Queue** | Redis | Upstash or Render Redis |
| **Storage** | S3 | AWS S3 or Cloudflare R2 |

---

## 📋 Prerequisites

1.  **Accounts**: Render, Supabase, Upstash, and AWS.
2.  **Tools**: GitHub account, Docker (optional for local testing), and Node.js 20.
3.  **Secrets**: Gather all necessary API keys (OpenAI, AWS, SMTP).

---

## 🛠 Step 1: Database & Cache (Infra)

### 1. PostgreSQL (Supabase)
- Create a new project on [Supabase](https://supabase.com/).
- Copy the **Connection String** (Transaction mode recommended for serverless).
- Update `DATABASE_URL` in your production environment.

### 2. Redis (Upstash)
- Create a new Redis instance on [Upstash](https://upstash.com/).
- Enable **TLS/SSL**.
- Copy the `rediss://...` URL.

---

## 🚀 Step 2: AI Service Deployment (Python)

### Render Configuration
1. **New Web Service** → Connect your GitHub Repo.
2. **Root Directory**: `ai`
3. **Runtime**: `Python 3`
4. **Build Command**: `pip install -r requirements.txt`
5. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
6. **Environment Variables**:
   - `PYTHONENV=production`
   - `LOG_LEVEL=INFO`
   - `OPENAI_API_KEY=sk-...`
   - `JWT_SECRET=...` (Must match API secret)

---

## 🚀 Step 3: API Service Deployment (Node.js)

### Render Configuration
1. **New Web Service** → Connect your GitHub Repo.
2. **Root Directory**: `api`
3. **Runtime**: `Node`
4. **Build Command**: `npm install && npx prisma generate && npm run build`
5. **Start Command**: `npm run start`
6. **Environment Variables**:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `DATABASE_URL=...`
   - `REDIS_URL=...`
   - `AI_SERVICE_URL=...` (The URL from Step 2)
   - `JWT_SECRET=...`
   - `JWT_REFRESH_SECRET=...`
   - `FRONTEND_URL=...` (The URL from Step 4)
   - `AWS_ACCESS_KEY_ID=...`
   - `AWS_SECRET_ACCESS_KEY=...`

---

## 🚀 Step 4: Frontend Deployment (React)

### Vercel / Render Configuration
1. **Connect Repository** → Select `frontend` directory.
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**:
   - `VITE_API_URL=...` (The URL from Step 3)

---

## 🔒 Security Checklist

- [ ] **HTTPS**: Ensure all endpoints use SSL (Render/Vercel provide this automatically).
- [ ] **CORS**: Ensure `FRONTEND_URL` is correctly set in the API to prevent unauthorized access.
- [ ] **Secrets**: Never commit `.env` files. Use the host's secret management.
- [ ] **Rate Limiting**: Verify `express-rate-limit` is active for `/auth` routes.
- [ ] **Database Migrations**: Run `npx prisma migrate deploy` in your CI/CD pipeline.

---

## 📈 Monitoring & Maintenance

- **Logging**: Use Render's native logs or integrate **Winston** with **Sentry/Datadog**.
- **Health Checks**: Monitor `GET /health/deep` to ensure all dependencies (DB, Redis, AI) are connected.
- **Backups**: Enable automated backups in Supabase.
