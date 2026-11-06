<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/admin/jobs/page.tsx
Screen ID: O03
Highest API Gate: P08
Designed Operations: GET /v1/admin/jobs, POST /v1/admin/jobs/{id}/retry
API Contract: api design.md §3.14
UX Specification: dashboard design.md §5.10
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# O03 — Durable Computation Queues & Node Health

- **Source File:** [`src/app/admin/jobs/page.tsx`](../../src/app/admin/jobs/page.tsx)
- **Screen Registry ID:** `O03`
- **Highest Gate Referenced:** `P08`
- **Primary Contract:** [`api design.md §3.14`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.10`](../../dashboard%20design.md)

---

## 1. Functional Overview
Hermetic worker pool state, running NetCDF processing tasks, queued jobs, and dead-letter queue managers.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/admin/jobs`
- `POST /v1/admin/jobs/{id}/retry`

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
