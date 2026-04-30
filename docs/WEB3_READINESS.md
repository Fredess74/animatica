# Web3 Readiness Audit

**Status:** 🔴 NOT READY

## Audit Summary
As of April 2026, the Animatica project is not ready for blockchain integration. While the vision and some documentation suggest Web3 features, the actual implementation is either missing or has been explicitly removed from the roadmap.

## Findings

### 1. Smart Contracts
- **Source Files:** The `packages/contracts/contracts/` directory is missing. No Solidity (`.sol`) files were found in the repository.
- **ABIs:** No contract ABIs were found in the build artifacts or source code.
- **Documentation:** `docs/SMART_CONTRACTS.md` contains reference implementations for `DonationPool`, `CreatorFund`, `AnimaticaTreasury`, and `AssetMarketplace`, but these have not been implemented in the `packages/contracts` package.
- **Infrastructure:** A Hardhat configuration (`hardhat.config.ts`) and a placeholder test exist in `packages/contracts`, indicating a shell for contract development is present but unused.

### 2. Frontend Integration
- **Libraries:** Key Web3 libraries such as `wagmi`, `viem`, `ethers`, or `RainbowKit` are missing from `apps/web/package.json`.
- **Wallet Connection:** No wallet connection logic or UI components (e.g., `ConnectButton`) were found in the `apps/web` codebase.
- **Contract Interaction:** No hooks or utilities for interacting with smart contracts are present.

### 3. Backend & Data Models
- **Database Schema:** The Supabase migration (`supabase/migrations/001_initial_schema.sql`) and TypeScript data models include `wallet_address` fields, showing that the system is architected to support wallets at the data layer.
- **Environment Variables:** `.env.example` contains placeholders for contract addresses (`NEXT_PUBLIC_CONTRACT_DONATION_POOL`, etc.).

## Recommendation
The project currently treats blockchain features as "off-scope" or "removed" according to `docs/PROGRESS.md`. If Web3 features are to be re-introduced:
1. Implement the Solidity contracts described in `docs/SMART_CONTRACTS.md`.
2. Add `wagmi` and `viem` to the `apps/web` package.
3. Implement a wallet connection flow in the user profile/onboarding.

---
**Auditor:** Smart Contract Reviewer (Jules)
**Date:** April 2026
