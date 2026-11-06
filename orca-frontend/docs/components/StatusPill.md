<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/components/ui/StatusPill.tsx
Screen ID: UI Status Indicator
Highest API Gate: P02
Designed Operations: Status Differentiation
API Contract: api design.md §0
UX Specification: dashboard design.md §2
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# Five Independent Status Indicators Component

- **Source File:** [`src/components/ui/StatusPill.tsx`](../../src/components/ui/StatusPill.tsx)
- **Screen Registry ID:** `UI Status Indicator`
- **Highest Gate Referenced:** `P02`
- **Primary Contract:** [`api design.md §0`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §2`](../../dashboard%20design.md)

---

## 1. Functional Overview
Encapsulates the five distinct trust indicators: ENS ownership, ORCA accreditation, A2A reachability, Arkiv confirmation, and scientific validity.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `Status Differentiation`

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
