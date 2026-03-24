# Blockchain Readiness Audit Report

**Date:** March 20, 2026
**Auditor:** Jules (Smart Contract Reviewer)
**Status:** Inconsistent (Legacy Artifacts vs. Zero-Blockchain Mandate)

---

## 1. Executive Summary

The Animatica codebase currently contains significant blockchain-related infrastructure, documentation, and dependencies. However, the project's core directive (as stated in `docs/JULES_GUIDE.md`) explicitly mandates a **"zero-blockchain"** policy. This creates a critical discrepancy between the repository's historical/planned features and its current development rules.

---

## 2. Discovered Artifacts

### 2.1. Smart Contracts
- **Location:** `packages/contracts/`
- **Content:**
  - `hardhat.config.ts`: Configured for Solidity `0.8.24`.
  - `package.json`: Includes `@nomicfoundation/hardhat-toolbox`, `@openzeppelin/contracts`, and `hardhat`.
  - `test/Placeholder.ts`: A basic test file.
- **Missing:** The actual `.sol` contract files mentioned in documentation (`DonationPool.sol`, `CreatorFund.sol`, etc.) are not present in the filesystem, although their source code is documented in `docs/SMART_CONTRACTS.md`.

### 2.2. Documentation
- **`README.md`**: References "Crypto Monetization," "Smart Contracts," and getting paid via crypto.
- **`docs/SMART_CONTRACTS.md`**: Contains full source code for four Solidity contracts (`DonationPool`, `CreatorFund`, `AnimaticaTreasury`, `AssetMarketplace`).
- **`docs/MONETIZATION.md`**: Details the revenue flow through `DonationPool.sol` and supports currencies like ETH, USDC, AVAX.
- **`docs/ROADMAP.md`**: Phase 8 is dedicated to "Crypto Monetization" (Weeks 25-28), including contract deployment and wallet integration.

### 2.3. Dependencies
- **`pnpm-lock.yaml`**: Contains numerous Web3 packages including `ethers`, `web3-utils`, `ethereum-cryptography`, and various `@ethersproject` modules. These appear to be transitive dependencies from `@nomicfoundation/hardhat-toolbox`.

### 2.4. Database Schema
- **File:** `supabase/migrations/001_initial_schema.sql`
- **Fields discovered:**
  - `profiles.wallet_address` (TEXT UNIQUE)
  - `profiles.total_earned_wei` (TEXT)
  - `films.donation_total_wei` (TEXT)
  - `films.chain_film_id` (BIGINT)
  - `donations.amount_wei`, `tx_hash`, `chain`, `block_number`
  - `assets.revenue_total_wei`, `chain_asset_id`
  - `asset_purchases.tx_hash`

---

## 3. Discrepancy Analysis

| Source | Stance | Action |
|--------|--------|--------|
| `docs/JULES_GUIDE.md` | **Strict Negative** | "FORBIDDEN: Do NOT write anything about blockchain... This project has NOTHING to do with these topics." |
| `README.md` / `ROADMAP.md` | **Strong Positive** | Defines crypto monetization as a key feature and Phase 8 milestone. |
| `packages/contracts` | **Active** | Contains a Hardhat environment and Web3 dependencies. |
| `supabase/` | **Active** | Database schema is pre-configured for on-chain tracking (Wei amounts, Tx hashes). |

---

## 4. Recommendations

1. **Clarify Mandate:** Resolve the conflict between `JULES_GUIDE.md` and the existing roadmap. If the project is truly "zero-blockchain," all legacy artifacts (docs, `packages/contracts`, database fields) should be purged.
2. **Remove Transitive Dependencies:** If Web3 is not required, remove `@Animatica/contracts` from the workspace and prune `pnpm-lock.yaml`.
3. **Update Documentation:** Sync `README.md` and `ROADMAP.md` with the current directive to avoid confusing new contributors or AI agents.
4. **Wallet Integration:** No active wallet integrations (`wagmi`, `rainbowkit`) were found in `apps/web` or `packages/editor`, confirming Phase 8 has not yet begun or has been suppressed.
