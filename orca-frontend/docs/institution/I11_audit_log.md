<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/org/[orgId]/settings/audit/page.tsx
Screen ID: I11
Highest API Gate: P08
Designed Operations: GET /v1/audit-events, GET /v1/audit-events/{id}
API Contract: api design.md §3.8
UX Specification: dashboard design.md §5.2
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# I11 — Tamper-Evident Security & Access Audit

- **Source File:** [`src/app/org/[orgId]/settings/audit/page.tsx`](../../src/app/org/[orgId]/settings/audit/page.tsx)
- **Screen Registry ID:** `I11`
- **Highest Gate Referenced:** `P08`
- **Primary Contract:** [`api design.md §3.8`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.2`](../../dashboard%20design.md)

---

## 1. Functional Overview
Append-only audit trail logging principal authentication, resource downloads, and cryptographic access decisions with RFC 9457 error summaries.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/audit-events`
- `GET /v1/audit-events/{id}`

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
