<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/org/[orgId]/review/inbox/page.tsx
Screen ID: V01
Highest API Gate: P07
Designed Operations: GET /v1/review/queue
API Contract: api design.md §3.7
UX Specification: dashboard design.md §5.5
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# V01 — Scientific Review Inbox

- **Source File:** [`src/app/org/[orgId]/review/inbox/page.tsx`](../../src/app/org/[orgId]/review/inbox/page.tsx)
- **Screen Registry ID:** `V01`
- **Highest Gate Referenced:** `P07`
- **Primary Contract:** [`api design.md §3.7`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.5`](../../dashboard%20design.md)

---

## 1. Functional Overview
Independent peer review triage inbox categorizing investigations into Pending Review, Reproduced, Challenged, and Insufficient Evidence.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/review/queue`

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
