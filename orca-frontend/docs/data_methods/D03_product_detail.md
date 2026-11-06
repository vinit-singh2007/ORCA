<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/org/[orgId]/data/products/[productId]/page.tsx
Screen ID: D03
Highest API Gate: P03
Designed Operations: GET /v1/catalog/products/{id}, POST /v1/catalog/products/{id}/fitness-checks
API Contract: api design.md §3.4
UX Specification: dashboard design.md §5.3
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# D03 — Product Detail & Scientific Suitability

- **Source File:** [`src/app/org/[orgId]/data/products/[productId]/page.tsx`](../../src/app/org/[orgId]/data/products/[productId]/page.tsx)
- **Screen Registry ID:** `D03`
- **Highest Gate Referenced:** `P03`
- **Primary Contract:** [`api design.md §3.4`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.3`](../../dashboard%20design.md)

---

## 1. Functional Overview
Detailed product metadata with pinned immutable versions and interactive spatial/temporal fitness checker executing POST /fitness-checks.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/catalog/products/{id}`
- `POST /v1/catalog/products/{id}/fitness-checks`

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
