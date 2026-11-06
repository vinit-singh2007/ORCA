<!--
================================================================================
ORCA 3.0 FRONTEND SPECIFICATION & COMPLIANCE RECORD
File Target: src/app/org/[orgId]/research/artifacts/[artifactId]/page.tsx
Screen ID: R10
Highest API Gate: P06
Designed Operations: GET /v1/research/artifacts/{id}, GET /artifacts/{id}/lineage, GET /artifacts/{id}/manifest
API Contract: api design.md §3.7
UX Specification: dashboard design.md §5.4
Truth Boundary: Strict verification; synthetic mocks tagged fixture: true
Visual Tokens: Strict white #FFFFFF, monochrome neutrals #111827 / #E5E7EB
================================================================================
-->

# R10 — Artifact Inspector & Provenance DAG

- **Source File:** [`src/app/org/[orgId]/research/artifacts/[artifactId]/page.tsx`](../../src/app/org/[orgId]/research/artifacts/[artifactId]/page.tsx)
- **Screen Registry ID:** `R10`
- **Highest Gate Referenced:** `P06`
- **Primary Contract:** [`api design.md §3.7`](../../api%20design.md)
- **UX Reference:** [`dashboard design.md §5.4`](../../dashboard%20design.md)

---

## 1. Functional Overview
Deep cryptographic provenance inspector displaying the complete Merkle lineage graph, input snapshot digests, container image hashes, and digital signatures.

---

## 2. Referenced Contract Endpoints
The following REST operations are bound to this interface:
- `GET /v1/research/artifacts/{id}`
- `GET /artifacts/{id}/lineage`
- `GET /artifacts/{id}/manifest`

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
