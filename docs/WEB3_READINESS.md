# Web3 Readiness Audit Report

**Date:** April 22, 2026
**Auditor:** Smart Contract Reviewer (Jules)
**Status:** DORMANT / REMOVED (As per Phase 8 de-prioritization)

## 1. Executive Summary

Animatica's blockchain infrastructure is currently in a "blueprinted but not built" state. While documentation exists for a 4-contract system (Donation Pool, Creator Fund, Treasury, and Marketplace), there is no actual Solidity implementation in the `packages/contracts` directory. Front-end wallet integrations (wagmi/RainbowKit) are planned in architecture docs but absent from the codebase.

## 2. Smart Contract Audit (Source: `docs/SMART_CONTRACTS.md`)

The following issues were identified in the Solidity snippets:

### 2.1 Critical/High Vulnerabilities
- **Deprecated `.transfer()` Usage:** All contracts use `payable(addr).transfer(amount)`. This is deprecated as it relies on a fixed 2300 gas limit. If a creator uses a smart contract wallet (e.g., Gnosis Safe), these transfers **will fail**.
  - *Recommendation:* Replace with `.call{value: amount}("")`.
- **Denial of Service (DOS) in `DonationPool.donate`:** The `donate` function loops through all creators and transfers funds. If a single creator's address is a contract that reverts on receipt, **the entire donation process is blocked** for that film.
  - *Recommendation:* Implement a "Pull over Push" pattern where creators claim their shares individually.

### 2.2 Design Logic Issues
- **Unfair Share Calculation in `CreatorFund`:** `getClaimable` calculates a share of the *current* balance. This does not account for the timing of donations vs. the timing of weight updates. Early claimers effectively cannibalize the pool.
  - *Recommendation:* Use a cumulative "Rewards Per Weight" accumulator (similar to Synthetix StakingRewards).
- **Gas Limits on Loops:** `registerFilm` and `donate` involve loops over arrays. Without a maximum limit on the number of creators, these transactions could eventually exceed the block gas limit.

## 3. Infrastructure Status

| Component | Status | Location |
|-----------|--------|----------|
| **Solidity Files** | ❌ Missing | No `.sol` files found in `packages/contracts` |
| **Hardhat Config** | ✅ Present | `packages/contracts/hardhat.config.ts` |
| **Unit Tests** | ⚠️ Placeholder | `packages/contracts/test/Placeholder.ts` only |
| **Deployment Scripts** | ❌ Missing | `scripts/deploy.ts` mentioned in docs is absent |

## 4. Front-end Integration Status

- **Wallet Connect:** Mentions of `wagmi` and `RainbowKit` exist in `ARCHITECTURE.md`, but no dependencies are installed in `apps/web/package.json` or used in components.
- **Environment Variables:** `NEXT_PUBLIC_CONTRACT_*` placeholders exist in `.env.example`, confirming the intent to link to Base/Avalanche L2s.
- **Supabase Schema:** The database contains `wallet_address` fields, supporting a future link between Web2 profiles and Web3 identity.

## 5. Overall Readiness Score: 1/10

The project has a clear conceptual roadmap for Web3 but requires a full implementation cycle to be "ready." The current specs in `docs/SMART_CONTRACTS.md` should be treated as a draft and rewritten to follow modern security patterns (Pull-payments, OpenZeppelin 5.0+ standards).
