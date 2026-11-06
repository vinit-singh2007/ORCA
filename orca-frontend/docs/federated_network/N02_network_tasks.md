<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/network/tasks/page.tsx
Screen ID: N02
Highest API Gate: P11
Designed Operations: GET /v1/network/tasks
API Contract: api design.md §3.10
UX Specification: dashboard design.md §5.7
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# N02 — Public Task Marketplace (Arkiv Coordination Board)

- **Source File:** [`src/app/network/tasks/page.tsx`](../../src/app/network/tasks/page.tsx)
- **Screen Registry ID:** `N02`
- **Highest Gate Referenced:** `P11`
- **Primary Contract:** [`api design.md §3.10`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.7`](../../dashboard%20design.md)

---

## 1. Functional Overview
Public decentralized research task board displaying task claims, single-award assignments, and on-chain Sepolia confirmation statuses.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/network/tasks`

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
