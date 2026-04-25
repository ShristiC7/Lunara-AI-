---
phase: "05"
topic: "PDF Reports + Email Delivery"
updated: 2026-04-26
---

# Phase 5 Research: Reports (PDF) & Email (SMTP)

## 1. PDF Generation (Puppeteer + Handlebars)
- **Handlebars**: Ideal for dynamic HTML templating. Allows for injection of cycle tables and AI insight summaries.
- **Puppeteer**: Uses headless Chrome to render HTML/CSS into a high-quality PDF.
  - **Memory Management**: Chromium is heavy. Concurrency must be low (Plan 4.1 set it to 1).
  - **Sandboxing**: Required flags for Docker/Linux often include `--no-sandbox`.
  - **Print CSS**: Use `@media print` for page breaks and PDF-specific styling (A4 size).

## 2. Storage (S3 / Local Mock)
- Reports should be stored in S3-compatible storage (AWS, DigitalOcean Spaces, etc.) rather than on disk to allow for horizontal scaling.
- Structure: `reports/{userId}/{reportId}_{timestamp}.pdf`.
- Access: Use pre-signed URLs (e.g., 1-hour expiry) so the reports remain private but accessible for download.

## 3. Email Delivery (Nodemailer + Bull)
- **SMTP Reliability**: SMTP is prone to temporary failures. Email delivery must be queue-backed using the infrastructure from Phase 4.
- **Template Branding**: Use a separate Handlebars template for emails to ensure a premium, branded look.
- **Attachments**: Reports should be attached directly to the email for user convenience.

## 4. Resilience & Cleanup
- **Job Events**: AI completion can trigger report availability (future enhancement). Currently, reports are requested on-demand.
- **Cleanup**: PDF buffers are handled in-memory and uploaded. Local disk should not persist PDFs permanently.

## 5. Security
- **Access Control**: Every report request and download must verify `userId` ownership.
- **Data Privacy**: Reports contain sensitive health data. Pre-signed URLs and S3 isolation are critical.

## Next Steps for Planning
- Plan 5.1: Handlebars Template setup and PDF generation logic.
- Plan 5.2: Storage (S3) integration and Report Worker implementation.
- Plan 5.3: Email Service integration (Report & Password Reset).
- Plan 5.4: End-to-End verification of the report generation and delivery lifecycle.
