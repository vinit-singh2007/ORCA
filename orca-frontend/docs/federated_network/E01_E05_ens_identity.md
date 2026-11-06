<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/org/[orgId]/agents/[agentId]/identity/page.tsx
Screen ID: E01–E05
Highest API Gate: P10
Designed Operations: GET /v1/identity/ens/{name}, POST /v1/identity/bindings
API Contract: api design.md §3.9 & §3.10
UX Specification: dashboard design.md §5.6
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# E01–E05 — ENS Identity & Authorization Management

- **Source File:** [`src/app/org/[orgId]/agents/[agentId]/identity/page.tsx`](../../src/app/org/[orgId]/agents/[agentId]/identity/page.tsx)
- **Screen Registry ID:** `E01–E05`
- **Highest Gate Referenced:** `P10`
- **Primary Contract:** [`api design.md §3.9 & §3.10`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.6`](../../dashboard%20design.md)

---

## 1. Functional Overview
Manages ENSv2 name bindings, Sepolia resolver text records, wallet signature challenges, multi-sig attestations, and revocation.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/identity/ens/{name}`
- `POST /v1/identity/bindings`

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
