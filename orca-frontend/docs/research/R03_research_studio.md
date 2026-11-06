<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/org/[orgId]/research/investigations/[investigationId]/page.tsx
Screen ID: R03
Highest API Gate: P06
Designed Operations: GET /v1/research/investigations/{id}, GET /artifacts/{id}, POST /runs
API Contract: api design.md §3.6 & §3.7
UX Specification: dashboard design.md §5.4
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# R03 — Flagship Unified Research Studio

- **Source File:** [`src/app/org/[orgId]/research/investigations/[investigationId]/page.tsx`](../../src/app/org/[orgId]/research/investigations/[investigationId]/page.tsx)
- **Screen Registry ID:** `R03`
- **Highest Gate Referenced:** `P06`
- **Primary Contract:** [`api design.md §3.6 & §3.7`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.4`](../../dashboard%20design.md)

---

## 1. Functional Overview
ORCA 3.0 flagship three-pane workstation: Left research scope, Center Map/Chart/Table outputs with polygon overlay, Right evidence inspector, and bottom durable timeline.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/research/investigations/{id}`
- `GET /artifacts/{id}`
- `POST /runs`

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
