# Web3 Readiness Audit

This document tracks the "Web3 Readiness" of the Animatica project, identifying the gap between the architectural designs and the current implementation state as of April 2026.

## Executive Summary

The project is currently in a **"Infrastructure Ready, Implementation Missing"** state. While the documentation and database schema are prepared for Web3 integration (donations, marketplace, revenue sharing), the actual blockchain code (smart contracts) and frontend wallet integrations are absent.

## 1. Smart Contracts (`packages/contracts`)

- **Status:** Skeleton Only.
- **Findings:**
    - The `packages/contracts` directory contains a Hardhat configuration and `package.json` with dependencies like `@openzeppelin/contracts`.
    - **NO Solidity (`.sol`) files** exist in the repository, despite `docs/SMART_CONTRACTS.md` containing detailed code for `DonationPool.sol`, `CreatorFund.sol`, `AnimaticaTreasury.sol`, and `AssetMarketplace.sol`.
    - There are no compiled artifacts or ABIs present.
    - No deployment scripts exist.

## 2. Database Schema (`supabase/migrations/001_initial_schema.sql`)

- **Status:** **Production Ready.**
- **Findings:**
    - The schema includes all necessary fields for blockchain integration:
        - `profiles.wallet_address` (Unique index)
        - `profiles.total_earned_wei`
        - `films.donation_total_wei`
        - `films.chain_film_id`
        - `donations` table (Tracks `tx_hash`, `amount_wei`, `chain`, etc.)
        - `assets.revenue_total_wei`, `assets.chain_asset_id`
        - `asset_purchases.tx_hash`
    - The schema is fully prepared to index on-chain events via an external listener or oracle.

## 3. Frontend & Engine (`apps/web`, `packages/engine`)

- **Status:** **Not Ready.**
- **Findings:**
    - **Wallet Integration:** No evidence of `wagmi`, `viem`, `ethers`, or `RainbowKit` in `apps/web/package.json`.
    - **UI:** The `Navbar` and `Signup` flows do not include "Connect Wallet" functionality.
    - **Engine:** No logic exists to interact with smart contracts or verify on-chain asset ownership.

## 4. Discrepancies & Recommendations

| Component | Design (Docs) | Implementation (Code) | Gap |
|-----------|---------------|-----------------------|-----|
| Smart Contracts | 4 core contracts designed | 0 contracts implemented | **Critical** |
| Database | Full Web3 schema defined | Schema deployed in migrations | **None** |
| Wallet | `wagmi` / `RainbowKit` planned | Standard email/password auth only | **High** |
| Marketplace | On-chain purchases designed | Off-chain asset management only | **High** |

### Recommendations:
1. **Implement designed contracts:** Port the Solidity code from `docs/SMART_CONTRACTS.md` into `packages/contracts/contracts/`.
2. **Add Wallet SDK:** Integrate `wagmi` and `RainbowKit` into `apps/web`.
3. **Develop Indexer:** Create an Edge Function or external service to sync the Supabase `donations` and `asset_purchases` tables with on-chain events.
