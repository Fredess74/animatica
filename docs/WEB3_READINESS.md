# Web3 Readiness Report

## Executive Summary
This document provides a comprehensive audit of the Animatica Web3 layer as of May 2026. While the project documentation in `docs/SMART_CONTRACTS.md` outlines a robust system for donations and asset trading, the current implementation is in a **PRE-ALPHA** state with critical security vulnerabilities and missing integration components.

---

## 1. Smart Contract Audit Findings

### General Observations
- **Deprecated Methods:** All contracts utilize the deprecated `.transfer()` method for sending Ether. This method has a hardcoded gas limit of 2,300, which will cause transactions to fail when interacting with modern smart contract wallets or Gnosis Safes. **Recommendation:** Switch to `(bool success, ) = to.call{value: amount}("");`.
- **Source Code Status:** No `.sol` files are currently present in `packages/contracts/`. The audit is based on the source code documented in `docs/SMART_CONTRACTS.md`.

### DonationPool.sol
- **CRITICAL: Gas Denial of Service (DoS):** The `donate` function iterates through the `film.creators` array. If a film is registered with a large number of creators, the `donate` transaction will exceed the block gas limit, effectively bricking the donation feature for that film.
- **Logic:** The split logic (70/20/10) is hardcoded. While secure, it lacks flexibility for future platform adjustments.

### CreatorFund.sol
- **CRITICAL: Distribution Logic Flaw:** The `getClaimable` function calculates the share based on the *current* contract balance: `(address(this).balance * weight) / totalWeight`. This is mathematically incorrect for a pull-payment system. When one creator claims their share, the contract balance drops, which unfairly reduces the claimable amount for all other creators who haven't claimed yet.
- **Recommendation:** Implement a "Reward per Weight" accumulator (similar to Synthetix Staking or MasterChef) to track historical accruals accurately.

### AssetMarketplace.sol
- **HIGH: Ignored Royalty Logic:** The `listAsset` function allows setting `royaltyBps`, and this value is stored in the `Asset` struct. However, the `purchase` function **completely ignores** this value, sending the entire non-fee amount to the creator and skipping any secondary market royalty logic.
- **Validation:** There is no check to ensure the `assetId` being purchased exists or is active beyond the `require(asset.isActive)` check (which passes for zero-initialized structs if not careful).

---

## 2. Integration Status

### Frontend Readiness (`apps/web`)
- **Wallet Integration:** **MISSING.** No traces of `wagmi`, `viem`, `ethers.js`, or `RainbowKit` were found in `package.json` or source files.
- **ABIs:** **MISSING.** No JSON ABIs or TypeScript contract definitions are present.
- **Contract Interaction:** No hooks or services exist for interacting with the DonationPool or Marketplace.

### Platform Package (`packages/platform`)
- **Core Logic:** The platform layer currently handles no Web3 state or transaction management.

---

## 3. Roadmap for Web3 Readiness

1.  **Contract Refactoring:**
    *   Fix the `CreatorFund` distribution logic using an accumulator pattern.
    *   Implement royalties in `AssetMarketplace.purchase`.
    *   Replace `.transfer()` with `.call()`.
2.  **Infrastructure Setup:**
    *   Populate `packages/contracts/contracts/` with the refactored Solidity files.
    *   Implement Hardhat/Foundry deployment scripts for Base/Avalanche.
3.  **Frontend Integration:**
    *   Add `@wagmi/core` and `viem` to `packages/platform`.
    *   Integrate ConnectButton and Wallet providers into `apps/web`.
    *   Generate TypeChain/Wagmi hooks from contract ABIs.
