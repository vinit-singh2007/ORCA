<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/org/[orgId]/science/recipes/page.tsx
Screen ID: D09
Highest API Gate: P04
Designed Operations: GET /v1/science/recipe-templates, POST /v1/science/recipes/validate
API Contract: api design.md §3.5
UX Specification: dashboard design.md §5.3
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# D09 — Recipe Templates & Validation

- **Source File:** [`src/app/org/[orgId]/science/recipes/page.tsx`](../../src/app/org/[orgId]/science/recipes/page.tsx)
- **Screen Registry ID:** `D09`
- **Highest Gate Referenced:** `P04`
- **Primary Contract:** [`api design.md §3.5`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.3`](../../dashboard%20design.md)

---

## 1. Functional Overview
Interactive JSON scientific recipe template editor with live schema validation, parameter checking, and SHA-256 plan digest computation.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/science/recipe-templates`
- `POST /v1/science/recipes/validate`

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
