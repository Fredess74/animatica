# Blockchain Readiness Audit

## Overview
This document summarizes the results of a comprehensive audit of blockchain, Web3, and smart contract artifacts in the Animatica repository as of March 2026. The audit was conducted to assess the repository's compliance with the "zero-blockchain" mandate specified in `docs/JULES_GUIDE.md`.

## Status: Legacy Artifacts Remain
Despite the strict prohibition of blockchain-related logic in new feature development, several legacy artifacts and documentation files remain in the repository.

---

## Identified Blockchain Artifacts

### 1. Source Code & Configuration
| File Path | Description |
|-----------|-------------|
| `packages/contracts/package.json` | Hardhat project dependencies including `@openzeppelin/contracts` and `hardhat`. |
| `packages/contracts/hardhat.config.ts` | Configuration for Solidity 0.8.24. |
| `packages/contracts/tsconfig.json` | TypeScript configuration for the contract package. |
| `packages/contracts/test/Placeholder.ts` | Placeholder test file for smart contracts. |
| `pnpm-lock.yaml` | Contains numerous blockchain-related dependencies (ethers, web3, solidity-parser, etc.). |

### 2. Database Schema (`supabase/migrations/001_initial_schema.sql`)
The Supabase schema includes several blockchain-specific fields:
- `profiles.wallet_address`: Unique text field for user wallets.
- `profiles.total_earned_wei`: Track creator earnings in Wei.
- `films.chain_film_id`: Reference to on-chain film IDs.
- `donations.amount_wei`: Donation amounts stored in Wei.
- `donations.tx_hash`: Transaction hash for on-chain verification.
- `donations.currency`: Defaults to 'ETH'.
- `assets.chain_asset_id`: Reference to on-chain asset IDs.

### 3. Documentation
| Document | Blockchain Mentions |
|----------|---------------------|
| `README.md` | Mentions "get paid globally via crypto," "smart contracts for creator payouts," and the `packages/contracts/` directory. |
| `docs/ARCHITECTURE.md` | Lists Base/Avalanche as the blockchain choice and wagmi/RainbowKit for wallets. |
| `docs/ROADMAP.md` | Phase 8 is dedicated to "Crypto Monetization," including `DonationPool.sol` and wallet integration. |
| `docs/SMART_CONTRACTS.md` | Contains full Solidity code for `DonationPool.sol`, `CreatorFund.sol`, `AnimaticaTreasury.sol`, and `AssetMarketplace.sol`. |
| `docs/MONETIZATION.md` | Details the revenue flow through smart contracts and the Creator Fund logic. |
| `docs/SUPABASE_SCHEMA.md` | Documents the blockchain-specific fields in the database. |

---

## Mandate Discrepancies
The following findings directly conflict with the **CRITICAL RULES** in `docs/JULES_GUIDE.md`:

1. **Rule 2: FORBIDDEN: Do NOT write anything about blockchain...**
   - **Discrepancy:** Documentation files (`SMART_CONTRACTS.md`, `MONETIZATION.md`) contain extensive Solidity code and crypto-monetization logic.
   - **Discrepancy:** The `packages/contracts` directory exists and is referenced in the root `package.json` and `tsconfig.json`.

2. **Rule: This project has NOTHING to do with these topics.**
   - **Discrepancy:** The `README.md` and `docs/ROADMAP.md` present blockchain monetization as a core feature of the platform.

## Recommendations
To fully comply with the "zero-blockchain" mandate, the following actions are recommended for future cleanup:
1. Delete `packages/contracts/` and remove references from the workspace root.
2. Remove blockchain-specific fields from the Supabase schema (`wallet_address`, `amount_wei`, etc.).
3. Redact all mentions of crypto, NFTs, and smart contracts from documentation files.
4. Purge blockchain-related dependencies from `pnpm-lock.yaml` once the packages are removed.
