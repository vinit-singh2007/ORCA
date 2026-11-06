<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/components/ui/Badge.tsx
Screen ID: UI Badge
Highest API Gate: P02
Designed Operations: Visual Status Encoding
API Contract: api design.md §0
UX Specification: dashboard design.md §2
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# Accessible Monochrome Badge Component

- **Source File:** [`src/components/ui/Badge.tsx`](../../src/components/ui/Badge.tsx)
- **Screen Registry ID:** `UI Badge`
- **Highest Gate Referenced:** `P02`
- **Primary Contract:** [`api design.md §0`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §2`](../../dashboard%20design.md)

---

## 1. Functional Overview
Accessible status pill providing verified, warning, neutral, outline, and muted styles using monochrome borders and text.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `Visual Status Encoding`

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
