# Web3 Readiness Audit

## Overview
This document tracks the readiness of Animatica for blockchain integration, including smart contract audits, frontend integration status, and identified risks.

## Smart Contracts Audit (2025-05-22)

### 1. DonationPool.sol
- **Status:** Extracted from docs, compiled successfully.
- **Critical Risks:**
  - **Gas DoS:** The `donate` function iterates over an unbounded `creators` array using `payable.transfer()`. A malicious creator with a failing fallback or high gas consumption can block all donations for a film.
  - **Hardcoded Splits:** Fees (70/20/10) are constant and cannot be adjusted without redeployment.
  - **Rounding Errors:** Small amounts might leave "dust" in the contract due to division before multiplication.

### 2. CreatorFund.sol
- **Status:** Extracted from docs, compiled successfully.
- **Critical Risks:**
  - **Fund Drainage (Logic Flaw):** The `claim()` function uses `address(this).balance` to calculate payouts. If a creator claims, the balance drops, and subsequent creators receive less than their fair share of the *original* pool. Conversely, if new funds arrive before all claims are processed, early claimers miss out.
  - **Pull Pattern Missing:** The `getClaimable` logic doesn't account for already claimed amounts correctly (it lacks a `rewardDebt` or similar accounting mechanism).

### 3. AnimaticaTreasury.sol
- **Status:** Simple owner-controlled vault. Ready.

### 4. AssetMarketplace.sol
- **Status:** Basic listing and purchase logic.
- **Risks:**
  - Uses `payable.transfer()` which might fail for smart contract wallets (limit of 2300 gas).
  - No way to update prices or delist assets once listed.

## Frontend Integration Status

- **Wallet Integration:** Not found. No `wagmi`, `rainbowkit`, or `viem` dependencies in `apps/web`.
- **ABIs:** Not found. Contracts have been compiled, but artifacts are not yet integrated into the frontend.
- **Contract Addresses:** Not configured in environment variables or constants.

## Recommendations
1. **Refactor CreatorFund:** Use a "Cumulative Points" or "Snapshot" pattern to ensure fair distribution regardless of when users claim.
2. **Refactor DonationPool:** Move to a "Pull Payment" pattern where creators claim their share from the pool instead of being pushed funds during `donate()`.
3. **Frontend Bootstrap:** Install `wagmi` and `viem` in `apps/web` and set up the `WagmiProvider`.
4. **Environment Config:** Define contract addresses for Base/Avalanche in `.env.local`.

## Overall Readiness: **15% (Foundational Contracts Only)**
