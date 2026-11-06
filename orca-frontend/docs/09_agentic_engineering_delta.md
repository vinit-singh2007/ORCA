# ORCA Companion Update — Agentic & Orchestration Engineering Specification

**Old source:** https://teampflresearch.vercel.app/agentic-spec.html. Extends the existing bounded task-graph runtime with independent A2A providers, identity and externally visible commitments.

## 1. Existing runtime is the center

Keep: task graph/DAG, planner, tool gateway, budgets, retry/cancellation, evidence store, trace IDs, role/capability distinction and evaluator. Remote agents are **an adapter to the existing task graph**, not an excuse to create a second ungoverned planning system. One supervisor remains accountable for plan state and user response; external agents are accountable for their own signed work artifacts.

## 2. New executor types

`LocalScientificExecutor`, `AuthorizedMCPToolExecutor`, `ExternalA2AExecutor`, `ArkivPublicationExecutor`, `ENSIdentityVerificationExecutor`, `ScientificReproductionExecutor`, `ResearchExportExecutor`. Each implements `prepare → authorize → execute → observe → validate → checkpoint`, with idempotency, deadline, cancellation, logs, and no unchecked tool side effects.

## 3. Distributed consistency

| System | Source of truth | What can be stale |
|---|---|---|
| ORCA private workflow | PostgreSQL durable tasks/checkpoints | Redis task cache |
| Provider execution | Remote authenticated A2A service | ORCA's last known A2A status |
| ENS identity | Actual ENSv2 chain registry/resolver roles | Local resolution cache and profile display |
| Arkiv coordination | Confirmed Rabdi entities/transactions | Local indexer and cached query views |
| Scientific research | Versioned original inputs+methods+signed results | Natural-language summary or prior memory |

Do not assume atomic transactions across these systems. Use durable outbox, idempotency keys, explicit unknown status, timeouts and reconciliation workers. Revocations must be enforced by authority-checking service even if a previously received claim still exists on Arkiv.

## 4. Model/agent evaluation

Check role correctness, capability selection, unnecessary parallelization, cost, recovery, task decomposition, source selection, latency, malicious prompt-injection resistance and response claim support. Scientific correctness remains a separate deterministic/empirical evaluation; model agreeing with another model is not evidence sufficiency.

## 5. Network authority and least privilege

A2A Agent Card is a capability declaration, not authentication; endpoint access requires token/mTLS/signed challenge based on actual security design. MCP tools have per-tenant and per-operation scopes. Signed ENS↔Arkiv wallet binding is domain-separated and expiring; never grant generic wallet authority over official maritime advisories, dataset exports or payment actions. Public on-chain tasks are discoverable but detailed task authorization occurs off-chain.

## 6. Runtime test cases

No external data access without license, no unauthorized sibling agent control, no task side effects after cancellation, no stale accepted result after revocation, no use of unknown-chain receipts, no infinite replans, no duplicate claims masquerading as exclusive assignment, correct recovery on missing provider/indexer, no confidential context in model telemetry.
