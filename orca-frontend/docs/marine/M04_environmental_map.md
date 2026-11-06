<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/marine/map/page.tsx
Screen ID: M04
Highest API Gate: P12
Designed Operations: GET /v1/marine/layers, GET /v1/marine/probes
API Contract: api design.md §3.11
UX Specification: dashboard design.md §5.8
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# M04 — Oceanographic Conditions Map

- **Source File:** [`src/app/marine/map/page.tsx`](../../src/app/marine/map/page.tsx)
- **Screen Registry ID:** `M04`
- **Highest Gate Referenced:** `P12`
- **Primary Contract:** [`api design.md §3.11`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.8`](../../dashboard%20design.md)

---

## 1. Functional Overview
Full GIS spatial layer viewer (SST, Waves, Chlorophyll-a, Cyclone Tracks) with interactive coordinate probe and accessible tabular fallback.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/marine/layers`
- `GET /v1/marine/probes`

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
