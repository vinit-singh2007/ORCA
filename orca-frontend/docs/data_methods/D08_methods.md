<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/org/[orgId]/science/methods/page.tsx
Screen ID: D08
Highest API Gate: P04
Designed Operations: GET /v1/science/methods, GET /v1/science/methods/{id}
API Contract: api design.md §3.5
UX Specification: dashboard design.md §5.3
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# D08 — Scientific Method Registry

- **Source File:** [`src/app/org/[orgId]/science/methods/page.tsx`](../../src/app/org/[orgId]/science/methods/page.tsx)
- **Screen Registry ID:** `D08`
- **Highest Gate Referenced:** `P04`
- **Primary Contract:** [`api design.md §3.5`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.3`](../../dashboard%20design.md)

---

## 1. Functional Overview
Peer-reviewed scientific algorithms (sst.seasonal_anomaly, upwelling.bakun_index) with mathematical definitions, formulas, and container digests.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/science/methods`
- `GET /v1/science/methods/{id}`

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
