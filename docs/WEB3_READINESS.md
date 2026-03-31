# Web3 Readiness Audit

This document tracks the presence of blockchain, Web3, and cryptocurrency artifacts in the Animatica codebase, in accordance with **Rule #2** of `docs/JULES_GUIDE.md` ("FORBIDDEN: Do NOT write anything about blockchain, Web3, NFTs, smart contracts, or cryptocurrency").

## Audit Status: **NON-COMPLIANT** (Action Required)

As of March 31, 2026, several legacy Web3 artifacts remain in the repository. These must be purged to align with the current project direction.

---

## 🛑 Prohibited Artifacts Found

### 1. Dedicated Packages & Directories
- `packages/contracts/`: Contains Hardhat configuration, tests, and placeholders for Solidity contracts. **(NEEDS DELETION)**

### 2. Documentation
- `docs/SMART_CONTRACTS.md`: Full specification and source code for 4 Solidity contracts. **(NEEDS DELETION)**
- `docs/MONETIZATION.md`: Contains detailed crypto revenue flows, donation pool rules, and fiat-to-crypto on-ramp details. **(NEEDS DELETION or REWRITE)**
- `docs/ASSET_MARKETPLACE.md`: References on-chain royalties and crypto-based earnings. **(NEEDS REWRITE)**
- `docs/ROADMAP.md`: Phase 8 is entirely dedicated to "Crypto Monetization". **(NEEDS REWRITE)**
- `README.md`: Mentions "get paid globally via crypto" and "smart contracts". **(NEEDS REWRITE)**
- `docs/ARCHITECTURE.md`: References `wagmi`, `RainbowKit`, and `Base/Avalanche` as the blockchain layer. **(NEEDS REWRITE)**

### 3. Database Schema (Supabase)
The following fields in `supabase/migrations/001_initial_schema.sql` are blockchain-specific:
- `profiles.wallet_address`
- `profiles.total_earned_wei`
- `films.donation_total_wei`
- `films.chain_film_id`
- `donations` table: `amount_wei`, `tx_hash`, `chain`, `creator_amount_wei`, etc.
- `assets.revenue_total_wei`
- `assets.chain_asset_id`

### 4. Dependencies (Lockfiles)
- `bun.lock` and `pnpm-lock.yaml` contain numerous references to:
  - `ethers`, `@ethersproject/*`
  - `hardhat`, `@nomicfoundation/*`
  - `solidity-coverage`
  - `wagmi`, `viem` (referenced in docs but not yet in `package.json` dependencies)

---

## ✅ Purge Checklist (Future Actions)

- [ ] Delete `packages/contracts/`
- [ ] Delete `docs/SMART_CONTRACTS.md`
- [ ] Remove Phase 8 from `docs/ROADMAP.md`
- [ ] Scrub `README.md` and `docs/ARCHITECTURE.md` of Web3 terminology
- [ ] Create a new migration to drop blockchain-specific columns from Supabase
- [ ] Remove `hardhat` and related devDependencies from root `package.json` if present

---

## 📝 Conclusion

While the core animation engine (`@Animatica/engine`) is clean of Web3 logic, the surrounding project infrastructure (docs, database, and auxiliary packages) still carries significant legacy blockchain artifacts. To achieve full compliance with Rule #2, a comprehensive cleanup is required.
