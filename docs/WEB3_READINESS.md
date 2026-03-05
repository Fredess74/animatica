# Web3 Readiness Audit

**Date:** 2026-03-04
**Status:** 🔴 Deprecated / Pending Removal

## Overview

As of the current development status, blockchain and Web3 features have been officially removed from the active scope (see `docs/PROGRESS.md`). While several architectural artifacts remain in the codebase, they are considered legacy or "hallucinated" by previous agent actions and are not integrated into the core engine or editor.

## Discovered Artifacts

### 1. Smart Contracts
- **Documentation:** `docs/SMART_CONTRACTS.md` contains Solidity source code for `DonationPool`, `CreatorFund`, `AnimaticaTreasury`, and `AssetMarketplace`.
- **Package:** `packages/contracts/` contains a Hardhat environment (`hardhat.config.ts`), but **no actual Solidity (`.sol`) files** were found in the file system.

### 2. Database Schema (`supabase/migrations/001_initial_schema.sql`)
The following Web3-specific fields and types exist in the initial Supabase schema:
- **Profiles Table:** `wallet_address`, `total_earned_wei`.
- **Films Table:** `chain_film_id`, `donation_total_wei`.
- **Donations Table:** `amount_wei`, `tx_hash`, `chain`, `block_number`, `creator_amount_wei`, `fund_amount_wei`, `platform_amount_wei`.
- **Assets Table:** `revenue_total_wei`, `chain_asset_id`.
- **Enums:** `asset_pricing` includes `royalty`.

### 3. Dependency Audit
- **Frontend/Web:** `apps/web/package.json` contains **no** Web3 dependencies (no `ethers`, `wagmi`, `rainbowkit`, or `viem`).
- **Engine/Editor:** No Web3-related logic or ABIs were found in the `@Animatica/engine` or `@Animatica/editor` packages.

## Discrepancies

- **Roadmap vs. Progress:** `docs/ROADMAP.md` still lists Phase 8 (Crypto Monetization) as a future milestone (Weeks 25-28), whereas `docs/PROGRESS.md` explicitly marks it as "❌ Removed" and a "blockchain hallucination."

## Conclusion

The project is currently **not Web3 ready**. The existing artifacts in the database schema and documentation are non-functional remnants. Integrating blockchain features would require:
1. Re-implementing the Solidity contracts in `packages/contracts/`.
2. Adding `ethers.js` or `viem` to the frontend and engine.
3. Implementing wallet connection UI (e.g., RainbowKit).
4. Connecting the Supabase `donations` and `profiles` tables to on-chain events via an indexer or oracle.
