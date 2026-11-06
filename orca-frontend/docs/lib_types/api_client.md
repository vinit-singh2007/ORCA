<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/lib/api-client.ts
Screen ID: API Client Layer
Highest API Gate: P02
Designed Operations: Core Network Layer
API Contract: api design.md §2 & §11
UX Specification: dashboard design.md §9
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# Typed RFC 9457 REST API Client

- **Source File:** [`src/lib/api-client.ts`](../../src/lib/api-client.ts)
- **Screen Registry ID:** `API Client Layer`
- **Highest Gate Referenced:** `P02`
- **Primary Contract:** [`api design.md §2 & §11`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §9`](../../dashboard%20design.md)

---

## 1. Functional Overview
Typed HTTP fetch wrapper injecting Bearer tokens, X-Request-ID, Idempotency-Key on mutations, and parsing RFC 9457 ProblemDetail errors.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `Core Network Layer`

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
