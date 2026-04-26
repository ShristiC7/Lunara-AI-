# 🌙 Lunara AI — Project Document

## 1. Executive Summary
Lunara AI is a women's health intelligence platform designed to transform menstrual cycle tracking into actionable biological understanding. Unlike generic calendar apps, Lunara AI utilizes a hybrid AI engine (Time-series ML + LLM) to deliver personalized predictions, symptom correlations, and medical-grade health reports.

## 2. Core Value Proposition
- **Individualized Intelligence**: Moves beyond population averages to learn the user's specific rhythm.
- **Symptom Correlation**: Automatically identifies patterns between hormonal phases and physical/emotional symptoms.
- **Privacy First**: End-to-end encryption and zero data sharing, ensuring intimate health data remains private.
- **Medical Utility**: Generates doctor-ready PDF reports to facilitate informed healthcare consultations.

## 3. Technology Stack

### Backend Infrastructure
- **Node.js & TypeScript**: High-performance REST API.
- **Prisma ORM**: Type-safe database interactions with PostgreSQL.
- **Bull & Redis**: Asynchronous job processing for AI inference and report generation.
- **Puppeteer**: Server-side PDF generation for health reports.

### AI Inference Service
- **Python & FastAPI**: Async-first service for machine learning tasks.
- **Scikit-learn & Statsmodels**: Powering ARIMA cycle prediction and anomaly detection.
- **OpenAI GPT-4o**: Delivering natural language insights and symptom correlations.

### Frontend Experience
- **React & Vite**: Modern, responsive user interface.
- **TanStack Query**: Efficient state management and data fetching.
- **Recharts**: Advanced data visualization for cycle regularity and symptom intensity.

## 4. Current Implementation Status (v1.0 Beta)

### Completed Features
- ✅ **Hybrid Prediction Engine**: Functioning ARIMA model with symptom-aware adjustments.
- ✅ **Real-time Insights**: Natural language pattern detection with confidence scoring.
- ✅ **Interactive Analytics**: Gradient-based charts and heatmaps for symptom tracking.
- ✅ **Agentic Logger Flow**: Context-aware daily logging with instant feedback.
- ✅ **Health Report Generation**: Automated S3-backed PDF export.

### Ongoing Development (Roadmap)
- 🔄 **Passive Anomaly Detection**: Isolation Forest model for irregularity monitoring.
- 🔄 **Collaborative Filtering**: Personalized wellness recommendations based on cohort patterns.
- 🔄 **Mobile Application**: React Native expansion for iOS and Android.

## 5. Deployment & Scalability
The platform is containerized using **Docker** and is ready for deployment on **Render**, **Railway**, or **AWS**. It utilizes **Supabase** for managed PostgreSQL and **Upstash** for serverless Redis, ensuring high availability and low operational overhead.
