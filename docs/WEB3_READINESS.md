# Web3 Readiness Audit

## Overview
This document summarizes the current state of blockchain and Web3 integration within the Animatica monorepo. As of April 2026, the project contains documentation and infrastructure residues for Web3 features, but lacks active implementation in the core application and engine packages.

## Smart Contracts
### Documented Contracts
The following contracts are fully defined in `docs/SMART_CONTRACTS.md` but are **not present** as `.sol` source files in the repository:
- **DonationPool.sol**: Handles donation splitting (70% Creator, 20% Fund, 10% Platform).
- **CreatorFund.sol**: Distributes funds to creators based on activity weights.
- **AnimaticaTreasury.sol**: Platform treasury for fee collection.
- **AssetMarketplace.sol**: On-chain marketplace for buying/selling/renting assets.

### Implementation Status (`packages/contracts`)
- **Hardhat Environment**: Configured and ready for development.
- **Source Files**: Zero `.sol` files found in `contracts/`.
- **Tests**: Contains only a `Placeholder.ts` test that asserts `true === true`.
- **ABIs**: No compiled contract ABIs or generated TypeChain artifacts found.

## Wallet & Web3 Integration
### Infrastructure Residues
- **Database Schema**: The `profiles` table in Supabase (`supabase/migrations/001_initial_schema.sql`) includes a `wallet_address` field (TEXT UNIQUE) with a corresponding index `idx_profiles_wallet`.
- **Data Models**: `docs/DATA_MODELS.md` reflects the `wallet_address` field.

### Frontend Integration
- **Documentation**: `docs/ARCHITECTURE.md` mentions `wagmi 2` and `RainbowKit` for wallet UX.
- **Implementation**: No active usage of `wagmi`, `RainbowKit`, or `ConnectButton` components was found in `packages/editor`, `packages/engine`, or `apps/web`.
- **Auth**: `docs/ARCHITECTURE.md` references NextAuth.js with wallet support, but `apps/web/app/api/auth` does not currently implement web3 strategy.

## Dependencies
The following blockchain-related dependencies are present in the monorepo's lockfiles and `package.json`:
- `ethers`: ^6.16.0 (in `pnpm-lock.yaml`)
- `@ethersproject/*`: v5.8.0 (transitive/legacy dependencies)
- `@openzeppelin/contracts`: ^5.3.0 (in `packages/contracts/package.json`)
- `hardhat`: ^2.25.0 (in `packages/contracts/package.json`)

## Conclusion
The Animatica project has a well-defined **theoretical** Web3 architecture but a **dormant** implementation. The smart contract logic is preserved in documentation but missing from the source tree. Infrastructure (database fields) and dependencies are in place to support future activation of these features.
