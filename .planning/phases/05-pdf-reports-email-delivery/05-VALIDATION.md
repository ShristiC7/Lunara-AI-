---
phase: "05"
phase-slug: "pdf-reports-email-delivery"
updated: 2026-04-26
---

# Phase 05 Validation Strategy

## Overview
Validation of the Reporting engine focuses on document integrity (PDF quality), data privacy (private downloads), and delivery reliability (SMTP/Queue).

## Criteria
- **Template Accuracy**: Verify Handlebars correctly renders cycle tables and symptom trends from mock data.
- **PDF Integrity**:
  - Verify Puppeteer creates a non-empty PDF buffer (>5000 bytes).
  - Verify layout remains consistent (A4, print-optimized).
- **Storage & Access**:
  - Verify S3 upload path includes `userId`.
  - Verify pre-signed URLs are valid and expire after the configured duration (1h).
  - Verify cross-user download attempt returns 404 (isolation).
- **Email Delivery**:
  - Verify SMTP worker retries on failure (simulated error).
  - Verify email contains the PDF attachment.
  - Verify password reset email includes the correct tokenized link.
- **Queue Integration**: Verify `POST /api/reports/generate` triggers the background worker correctly.

## Performance
- **Report Generation Time**: < 10s (including Puppeteer launch and S3 upload).
- **Concurrent Requests**: Queue handles multiple requests sequentially without OOM.

## Success Metrics
- **Coverage**: ≥80% for PDF, S3, and Email services/workers.
- **Delivery Rate**: 100% of generated reports successfully emailed or logged as failed after retries.
- **Visual Accuracy**: PDFs contain all expected sections as per `REPORT-03` requirement.
- **Security**: 0 reports accessible without a valid user-scoped session.
