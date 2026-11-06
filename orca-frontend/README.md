# ORCA — Verifiable Oceanographic Science & Agent Network

ORCA is an open, verifiable research platform for oceanographic science, decentralized autonomous agent coordination (A2A), and immutable on-chain research provenance.

---

## 👥 Team Attribution
- **Frontend Architecture & Design System:** [Vinit Singh](https://github.com/vinit-singh2007)
  - 48 production routes, Next.js 16 App Router, responsive shell, strict white-neutral UI design system, live API client integration.
- **Backend & Smart Contracts:** Backend Teammate
  - 14 REST API domains, Solidity smart contracts, Arkiv Merkle provenance indexing, A2A agent verification protocol.

---

## 🌊 Overview & Workspaces

ORCA operates across four unified scientific workspaces:

1. **🏛️ Institution Workspace (`/dashboard`, `/org/[orgId]/...`)**
   - Projects, bounded investigations, scientific methods, data products, snapshots, and peer-review workflows.
2. **🌐 Federated Network Workspace (`/network/...`)**
   - Autonomous agent discovery, task boards, cryptographic credential exchanges, and Arkiv verification explorer.
3. **🧭 Marine Companion Workspace (`/marine/...`)**
   - Real-time sea surface temperature (SST), wave heights (Hs), wind speed, IMD/INCOIS official hazard advisories, and Potential Fishing Zone (PFZ) mapping.
4. **⚙️ Platform Operations (`/admin/...`)**
   - System health, live source connectors, job queue monitoring, and Arkiv indexer controls.

---

## 🚀 Tech Stack

- **Framework:** Next.js 16.4.5 (App Router, Turbopack / Webpack)
- **Language:** TypeScript 5.x (Strict typing, 0 compile errors)
- **Styling:** Tailwind CSS v4 (Neutral monochrome tokens, zero arbitrary color overrides)
- **Icons:** Lucide React
- **API Client:** Type-safe custom REST client targeting 14 backend service specifications (`/v1/*`)
- **Blockchain / Verification:** Ethereum / EVM smart contracts & Arkiv decentralized storage

---

## 🛠️ Local Development

```bash
# Navigate to frontend package
cd orca-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- **Landing Page:** `http://localhost:3000/`
- **Application Workspace:** `http://localhost:3000/dashboard`

```bash
# Type check
npx tsc --noEmit

# Production build
npm run build
```

---

## 📑 Documentation

All system documentation and specifications are located in `/docs`:
- `API_ENDPOINTS.md` — Complete specification for all 14 backend endpoints (§3.1 – §3.14).
- `ORCA_3_0_Navigation_and_Dashboard_Redesign_Guidelines.md` — Layout, typography, and UX design guidelines.
- `OVERALL_FRONTEND_DOCUMENTATION.md` — Complete frontend codebase architecture and screen index.
