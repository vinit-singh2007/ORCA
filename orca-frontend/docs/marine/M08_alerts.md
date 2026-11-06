<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/marine/alerts/page.tsx
Screen ID: M08
Highest API Gate: P12
Designed Operations: GET /v1/alerts/subscriptions, POST /v1/alerts/subscriptions
API Contract: api design.md §3.12
UX Specification: dashboard design.md §5.8
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# M08 — Emergency Hazard Subscriptions & Alerts

- **Source File:** [`src/app/marine/alerts/page.tsx`](../../src/app/marine/alerts/page.tsx)
- **Screen Registry ID:** `M08`
- **Highest Gate Referenced:** `P12`
- **Primary Contract:** [`api design.md §3.12`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.8`](../../dashboard%20design.md)

---

## 1. Functional Overview
Multi-lingual emergency notification management across SMS, Voice sirens (Gujarati, Hindi, English), and Web Push.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/alerts/subscriptions`
- `POST /v1/alerts/subscriptions`

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
