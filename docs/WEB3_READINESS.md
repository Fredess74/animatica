# Web3 Readiness Audit

This document tracks the current state of blockchain integration, smart contracts, and wallet support for the Animatica platform.

## Infrastructure Status

| Component | Status | Location | Notes |
|-----------|--------|----------|-------|
| **Hardhat Config** | Ready | `packages/contracts/` | Solidity 0.8.24, Toolbox included. |
| **Database Schema** | Ready | `supabase/migrations/` | Fields for wallets, wei amounts, and tx hashes exist. |
| **Smart Contracts** | **Incomplete** | `docs/SMART_CONTRACTS.md` | Logic documented but no `.sol` files in `contracts/`. |
| **Wallet Integration** | **Missing** | `apps/web`, `packages/editor` | No `wagmi` or `RainbowKit` provider found. |

---

## Database Readiness (v001)

The following tables in `supabase/migrations/001_initial_schema.sql` include Web3-specific fields:

- **`profiles`**: `wallet_address`, `total_earned_wei`, `creator_weight`.
- **`films`**: `donation_total_wei`, `chain_film_id`.
- **`donations`**: `amount_wei`, `tx_hash`, `chain`, `block_number`, `creator_amount_wei`, `fund_amount_wei`, `platform_amount_wei`.
- **`assets`**: `revenue_total_wei`, `chain_asset_id`.
- **`asset_purchases`**: `tx_hash`.

---

## Smart Contract Audit Summary

The logic documented in `docs/SMART_CONTRACTS.md` was reviewed for security and logic.

### Identified Risks & Issues

1. **Deprecated Transfer**: `DonationPool.sol` and `CreatorFund.sol` use `.transfer()`, which is deprecated and can fail if gas costs change or if the recipient is a contract. Recommendation: use `.call{value: amount}("")`.
2. **Proportional Distribution Bug**: In `CreatorFund.sol`, `getClaimable()` uses `address(this).balance * weight / totalWeight`. This is incorrect for claimable funds as it doesn't account for already claimed amounts. A "shares" or "cumulative rewards" pattern should be used.
3. **Centralization**: `DonationPool.registerFilm` is `onlyOwner`. This requires an oracle or backend service to register every film on-chain, creating a bottleneck and centralization risk.
4. **Reentrancy**: While `ReentrancyGuard` is used, the use of `.transfer()` before state updates in some snippets (if any were found) could be risky; however, the provided snippets generally follow Checks-Effects-Interactions.

---

## Frontend Integration Status

- **Provider**: No `WagmiConfig` or `RainbowKitProvider` detected in root layouts.
- **Hooks**: No active use of `useAccount`, `useConnect`, or contract interaction hooks.
- **Dependencies**: `ethers` and `@nomicfoundation` packages are present in `pnpm-lock.yaml`, but primarily as dev dependencies for Hardhat.

---

## Recommendations for Phase 6+

1. Implement `.sol` files in `packages/contracts/contracts/` based on refined versions of the documented logic.
2. Fix the `CreatorFund` distribution logic to support periodic claims.
3. Integrate `wagmi` and `RainbowKit` in `apps/web/app/layout.tsx`.
4. Create a `useBlockchain` hook in `packages/platform` to wrap contract interactions.
