<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/types/api.ts
Screen ID: API Types
Highest API Gate: P00–P14
Designed Operations: 220 Contract Schemas
API Contract: api design.md §1 & §4–§11
UX Specification: dashboard design.md §8
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# Complete REST Contract TypeScript Definitions

- **Source File:** [`src/types/api.ts`](../../src/types/api.ts)
- **Screen Registry ID:** `API Types`
- **Highest Gate Referenced:** `P00–P14`
- **Primary Contract:** [`api design.md §1 & §4–§11`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §8`](../../dashboard%20design.md)

---

## 1. Functional Overview
TypeScript interfaces for organizations, projects, investigations, GeoJSON polygons, scientific artifacts, providers, and agents.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `220 Contract Schemas`

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
