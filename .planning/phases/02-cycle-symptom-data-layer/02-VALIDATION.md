---
phase: "02"
phase-slug: "cycle-symptom-data-layer"
updated: 2026-04-26
---

# Phase 02 Validation Strategy

## Overview
Validation of the Data Layer ensures CRUD boundaries, data sanitization, and schema relationship integrity holding for Cycle and Symptom entities.

## Criteria
- **CRUD Access**: Direct test simulation confirms User A cannot list or request resources tied to User B using separate JWT tokens.
- **Constraints**: Verify Zod accurately kicks back values outside bounds: `mood` 6 (fails), `flowIntensity` -1 (fails), etc.
- **Symptom Extrusion**: Ensure HTML inside `notes` field is effectively sanitized before being passed to Prisma Client.
- **Math Accuracy**: Unit tests to prove mathematical operations inside `cycle/stats` helper perfectly aggregates differences across 3 varied records to provide an accurate `cycleLength` and `regularity` score.
