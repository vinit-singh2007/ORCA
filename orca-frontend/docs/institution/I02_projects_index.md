<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/org/[orgId]/projects/page.tsx
Screen ID: I02
Highest API Gate: P02
Designed Operations: GET /v1/research/projects, POST /v1/research/projects
API Contract: api design.md §3.3
UX Specification: dashboard design.md §5.2
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# I02 — Research Projects Index

- **Source File:** [`src/app/org/[orgId]/projects/page.tsx`](../../src/app/org/[orgId]/projects/page.tsx)
- **Screen Registry ID:** `I02`
- **Highest Gate Referenced:** `P02`
- **Primary Contract:** [`api design.md §3.3`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.2`](../../dashboard%20design.md)

---

## 1. Functional Overview
Research project catalogue with filterable data access classifications, pinned data policy tags, and modal for creating new studies.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/research/projects`
- `POST /v1/research/projects`

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
