# ORCA Companion Update — Consolidated Master Architecture Mapping

**Original:** https://teampflresearch.vercel.app/master-arch.html. **New master source of truth:** [`../design.md`](../design.md).

## System delta table

| Old master module | V3 decision | New specification |
|---|---|---|
| React/Next-style UI, original four surfaces | Preserve and augment | Doc 1 |
| API gateway, sessions and language/intent | Preserve and add institutional tenant scope | Docs 1, 2, 6 |
| Supervisor/task graph/agents | Preserve and add external A2A task executor | Doc 2 |
| Tool gateway, permissions, caches/circuit breakers | Preserve, add remote MCP scope and sandbox | Doc 2, Agentic Delta |
| INCOIS/IMD/Copernicus/ERDDAP connectors | Preserve, add data rights and as-of archives | Doc 3, Data Acquisition Delta |
| Seven scientific engines | Preserve with method registry, independent reproduction and science claim gate | Doc 7 |
| GeoFlow, spatial constraints, Marine State/versioning | Preserve and use in institutional projects | Docs 3, 4, 7 |
| Evidence records and 44+ planned tables | Preserve, add 35 new institution/federation/research/chain/audit tables | Doc 4 + SQL |
| Seven memory planes | Preserve and add cross-org isolation and remote evidence refs | Doc 6 |
| Alerts/official hazard data | Preserve authority, no chain dependency | Docs 1, 5, 7 |
| Logging, rate limiting, observability | Preserve and expand chain/identity/RPC traces | Docs 2, 4, 5 |
| Old demo flows | Preserve; add one live federated research demonstration | Docs 1, 5 |

## Integration boundary summary

ENS = discover agent names and delegate limited record updates. ORCA Trust = verify the claimed identity is authorized by its real institution and bind ENS, Arkiv and A2A keys. A2A = work requests and outputs. MCP = scientific tools and data. Arkiv = independent public task/claim/result/review metadata. Existing scientific engine = actual numerical computation. Existing evidence store = permanent/authorized scientific record. Same scientific foundation serves all original user types.

## Non-regression conditions

No migration removes original tool domains or UI surfaces; no public chain leaks user's location or research secrets; no federation dependency delays official warning information; no model-generated scientific numbers; no claim of scientific reproduction without actual method rerun; no organization is described as independent when controlled by a single demo operator. The original detailed master document remains a research reference and the new `design.md` governs integration changes.
