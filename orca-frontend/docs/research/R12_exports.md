<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/org/[orgId]/research/investigations/[investigationId]/exports/page.tsx
Screen ID: R12
Highest API Gate: P06
Designed Operations: POST /v1/research/investigations/{id}/exports, GET /exports/{id}
API Contract: api design.md §3.6
UX Specification: dashboard design.md §5.4
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# R12 — Reproducible Scientific Export Center

- **Source File:** [`src/app/org/[orgId]/research/investigations/[investigationId]/exports/page.tsx`](../../src/app/org/[orgId]/research/investigations/[investigationId]/exports/page.tsx)
- **Screen Registry ID:** `R12`
- **Highest Gate Referenced:** `P06`
- **Primary Contract:** [`api design.md §3.6`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.4`](../../dashboard%20design.md)

---

## 1. Functional Overview
Generates self-contained scientific bundles (tar.gz) containing input manifests, parameters, output NetCDF arrays, and offline bash verification script.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `POST /v1/research/investigations/{id}/exports`
- `GET /exports/{id}`

---

## 3. Visual & Interaction Design
- **Background Base:** Pure white (`#FFFFFF`) per `dashboard design.md` §2.
- **Borders & Dividers:** Subtle 1px neutral border (`#E5E7EB`).
- **Typography:** High-contrast neutral text (`#111827`) with secondary labels in `#4B5563`.
- **Status Representation:** Semantic monochrome badges without decorative neon colors.
- **Accessible States:** Declarative empty, loading, permission denied, and unreleased state fallbacks.

---

## 4. Truth Boundary Compliance
- When operating in test harness mode, all records are explicitly stamped with `fixture: true`.
- No unverified scientific finding or mock transaction is represented as live production proof until its underlying backend phase gate passes.
