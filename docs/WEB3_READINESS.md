# Web3 Readiness Audit

## Overview
This document tracks the presence of blockchain, cryptocurrency, and Web3-related artifacts within the Animatica codebase. Per `docs/JULES_GUIDE.md`, this project has "NOTHING to do with these topics," and any remaining artifacts are considered legacy or "leaked" and are slated for removal.

**Last Audit Date:** 2026-03-24
**Current Status:** Negative / Purge in Progress

---

## 1. Smart Contracts (`packages/contracts`)
The `packages/contracts` directory exists but is currently a placeholder.
- **Status:** Empty / Placeholder
- **Files:**
  - `hardhat.config.ts`: Standard Hardhat configuration.
  - `package.json`: Includes dependencies like `hardhat`, `@nomicfoundation/hardhat-toolbox`, and `@openzeppelin/contracts`.
  - `test/Placeholder.ts`: A basic test that always passes.
- **Missing:** No `.sol` (Solidity) files are present in the filesystem.

---

## 2. Leaked Documentation (`docs/`)
Several documentation files still contain references to Web3 features:
- `docs/SMART_CONTRACTS.md`: Contains full Solidity source code for `DonationPool`, `CreatorFund`, `AnimaticaTreasury`, and `AssetMarketplace`.
- `docs/MONETIZATION.md`: Describes a "transparent donation pool" model using smart contracts and mentions MoonPay/crypto wallets.
- `docs/ROADMAP.md`: Lists "Phase 8: Crypto Monetization" and "Wallet connect (wagmi)" as planned features.
- `docs/PRODUCT_VISION.md`: Mentions "Mandatory crypto wallet for viewing" (deprecated).
- `docs/ARCHITECTURE.md`: Lists `wagmi` and `RainbowKit` in the tech stack.

---

## 3. Database Schema (`supabase/`)
The initial migration (`supabase/migrations/001_initial_schema.sql`) contains several Web3-specific fields and tables:
- **`profiles` table:** `wallet_address`, `total_earned_wei`.
- **`films` table:** `donation_total_wei`, `chain_film_id`.
- **`assets` table:** `revenue_total_wei`, `chain_asset_id`.
- **`donations` table:** `amount_wei`, `tx_hash`, `chain`, `block_number`, `creator_amount_wei`, `fund_amount_wei`, `platform_amount_wei`.
- **`asset_purchases` table:** `tx_hash`.

---

## 4. Dependencies & Configuration
- **Environment Variables:** `.env.example` contains placeholders for `NEXT_PUBLIC_CONTRACT_DONATION_POOL` and `NEXT_PUBLIC_CONTRACT_CREATOR_FUND`.
- **Locks (`pnpm-lock.yaml`, `bun.lock`):** Contain transitive dependencies on `@ethersproject/*` and `web3-utils`.
- **License Audit:** `docs/LICENSE_AUDIT.md` correctly identifies these blockchain-related dependencies for legal compliance.

---

## 5. Frontend & Engine
- **`apps/web` & `packages/editor`:** No active usage of `ethers`, `wagmi`, `viem`, or `RainbowKit` was found in the source code.
- **`packages/engine`:** No blockchain-specific logic or types (e.g., `wallet_address`) found in core data models or animation logic.

---

## Conclusion
While the core animation engine and web application have been successfully shielded from Web3 logic, significant "leaks" remain in the documentation and database schema. These artifacts should be purged in accordance with the project's zero-blockchain mandate.
