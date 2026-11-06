<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/lib/mock-data.ts
Screen ID: Mock Harness
Highest API Gate: P01
Designed Operations: Synthetic Fixtures
API Contract: api design.md §11.2
UX Specification: dashboard design.md §1
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# Synthetic Preview Harness & Fixture Registry

- **Source File:** [`src/lib/mock-data.ts`](../../src/lib/mock-data.ts)
- **Screen Registry ID:** `Mock Harness`
- **Highest Gate Referenced:** `P01`
- **Primary Contract:** [`api design.md §11.2`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §1`](../../dashboard%20design.md)

---

## 1. Functional Overview
Contract-valid synthetic mock records tagged with fixture: true to guarantee truth boundaries and zero unverified claims.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `Synthetic Fixtures`

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
