# ORCA Companion Update — Core Agentic Technical Architecture

**Old source:** https://teampflresearch.vercel.app/core-agentic-technical.html.

## Non-negotiable old boundary

`LLM = plans/interprets/explains` · `Scientific engines = calculate` · `Data foundation = evidence`.

## V3 technical diagram

```mermaid
flowchart TD
 User[User question] --> NLU[Intent / scope / complexity]
 NLU --> Plan[LLM Supervisor builds typed task DAG]
 Plan --> F{External independent capability required?}
 F -->|No| Local[Internal agents + approved tools]
 F -->|Yes| Trust[ENSv2 resolution + credentials + binding]
 Trust --> A2A[Authenticated A2A remote provider]
 A2A --> Arkiv[Optional Arkiv task/claim/result-ref]
 Local --> Sci[Deterministic Scientific Core]
 A2A --> Sci
 Sci --> Gate[QC + Evidence + Independent Reproduction]
 Gate --> Report[Structured science → LLM grounded explanation]
 Report --> User
```

No LLM directly issues unsafe warning, edits scientific measurements, changes ENS permissions, signs wallet transactions, bypasses authorization or judges scientific truth by agent reputation. The network makes additional expertise available; it doesn't replace scientific computation.
