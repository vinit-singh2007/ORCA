# ORCA  — Oceanographic Research & Verifiable Intelligence Platform

> 🏆 Built with passion during **ETHGlobal Mumbai** 🇮🇳

## 👥 Team & Architecture Division
* **Frontend Client (This Repository)**: Built by **[Vinit Singh](https://github.com/vinit-singh2007)**
  * Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
  * Implements 47 verifiable scientific, marine, and decentralized ledger screens.
  * Complete typed API integration client (`OrcaApiClient`) covering 14 functional domains.
* **Backend Gateway & Computation Engine**: Developed concurrently by my teammate **[Shakti Singh]**
  * Implements the 14 REST endpoint contracts specified in [`docs/API_ENDPOINTS.md`](docs/API_ENDPOINTS.md).
  * Handles cryptographic state transitions, computation dispatching, and Arkiv Rabdi ledger indexing.

## 🔗 Architecture & API Contract **[Vaishali Mali]**
The frontend is decoupled from the backend and connects via standard REST APIs configured through `NEXT_PUBLIC_ORCA_API_URL`.
* **API Specification**: See complete endpoint definitions in [`docs/API_ENDPOINTS.md`](docs/API_ENDPOINTS.md).
