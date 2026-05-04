# Web3 Readiness Audit

**Audit Date:** May 4, 2026
**Status:** PARTIAL - FOUNDATION LAID (Logic only, implementation missing)

## Executive Summary

The Animatica project has a well-defined conceptual framework for blockchain-based monetization, as documented in `docs/SMART_CONTRACTS.md` and `docs/MONETIZATION.md`. However, the actual implementation is currently missing from the codebase. The `packages/contracts` directory contains no Solidity source files, and there is no evidence of wallet integration (`wagmi`, `RainbowKit`) in the frontend or platform packages.

There is a conflict between the project roadmap (Phase 8: Crypto Monetization) and the coding standards in `docs/JULES_GUIDE.md`, which explicitly forbids blockchain topics. `docs/PROGRESS.md` also notes that Phase 8 was removed.

## Smart Contract Audit (Logic Review)

Four core contracts are described in documentation. An audit of the provided snippets reveals several critical issues:

### 1. CreatorFund.sol (CRITICAL VULNERABILITY)
- **Logic Flaw:** The `getClaimable` function calculates rewards using `address(this).balance * creatorWeight[creator] / totalWeight`. Since `claim()` uses `payable(msg.sender).transfer(amount)`, the contract balance decreases after every claim. This means creators who claim later will receive significantly less than their fair share, or nothing at all, as the balance is depleted.
- **Recommendation:** Implement a cumulative "reward per share" pattern (MasterChef-style) to track distributions independently of the current contract balance.

### 2. General: Gas Stipend Issues
- **Vulnerability:** Use of `.transfer()` for sending Ether. This function has a fixed gas stipend of 2300, which can cause transactions to fail if the recipient is a contract (e.g., a multi-sig wallet) that requires more gas for its `receive` function.
- **Recommendation:** Use `.call{value: amount}("")` followed by a requirement check, ensuring reentrancy protection is active.

### 3. AssetMarketplace.sol
- **Issue:** The contract lacks a mechanism to handle funds or metadata if an asset is deactivated or if the treasury address is changed.
- **Recommendation:** Ensure all edge cases for asset lifecycle are handled.

## Integration Audit

### Frontend (apps/web)
- **Wallet Connection:** No implementation of RainbowKit, Wagmi, or direct EIP-1193 providers found.
- **Contract Interaction:** No ABIs found in the codebase. No `ethers` or `viem` hooks detected for contract interaction.

### Backend/Platform (packages/platform)
- **Wallet Auth:** Roadmap mentions wallet auth, but `packages/platform` only contains placeholders for standard auth.

## Readiness Checklist

| Category | Status | Notes |
|----------|--------|-------|
| Smart Contract Logic | 🟡 Partial | Snippets exist in docs; Logic needs refactoring. |
| Smart Contract Source | 🔴 Missing | No `.sol` files in `packages/contracts/contracts`. |
| Contract ABIs | 🔴 Missing | No JSON ABIs found. |
| Wallet Integration | 🔴 Missing | No frontend connection logic. |
| Documentation | 🟢 Complete | Functional specs in `MONETIZATION.md` are robust. |

## Recommendations

1. **Reconcile Scope:** Clarify if Phase 8 is truly removed (as per `JULES_GUIDE.md`) or if it remains part of the long-term roadmap.
2. **Refactor Distribution:** If proceeding, rewrite `CreatorFund.sol` to use a cumulative distribution model to ensure fair payouts.
3. **Adopt Pull-Payment Pattern:** Shift from "push" (transferring on donation) to "pull" (creators claim their accrued balance) to improve security and gas efficiency.
4. **Standardize on Viem/Wagmi:** If integration begins, use `viem` and `wagmi` v2 for the most modern and type-safe developer experience.
