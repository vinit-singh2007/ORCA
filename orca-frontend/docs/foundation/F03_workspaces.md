<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/workspaces/page.tsx
Screen ID: F03
Highest API Gate: P02
Designed Operations: GET /v1/organizations, GET /v1/me
API Contract: api design.md §3.2
UX Specification: dashboard design.md §5.1
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# F03 — Workspace Selector & Organization Directory

- **Source File:** [`src/app/workspaces/page.tsx`](../../src/app/workspaces/page.tsx)
- **Screen Registry ID:** `F03`
- **Highest Gate Referenced:** `P02`
- **Primary Contract:** [`api design.md §3.2`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.1`](../../dashboard%20design.md)

---

## 1. Functional Overview
Organization directory enabling multi-institutional switching, displaying data retention days, tenant isolation, and row-level security boundaries.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/organizations`
- `GET /v1/me`

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
