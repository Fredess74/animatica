# Web3 Readiness Audit

**Status:** 🔴 NOT READY
**Last Audit:** 2026-04-26
**Auditor:** Smart Contract Reviewer (Jules)

## Executive Summary

The Animatica platform is currently **not Web3 ready**. While architectural documentation exists (`docs/SMART_CONTRACTS.md`), the actual implementation is missing from the codebase. The documented contracts contain several critical security vulnerabilities and logical flaws that must be addressed before deployment.

---

## Smart Contract Audit (from `docs/SMART_CONTRACTS.md`)

### 1. DonationPool.sol
- **Vulnerability [CRITICAL]:** Denial of Service (DoS) via `.transfer` in a loop. If any creator address is a contract that rejects ETH, all donations to that film will fail.
- **Vulnerability [HIGH]:** Gas limit risk. Large numbers of creators per film could cause the `donate` function to exceed block gas limits.
- **Recommendation:** Implement a **Pull-over-Push** pattern. Store balances in a mapping and allow creators to `withdraw()` their shares independently.

### 2. CreatorFund.sol
- **Vulnerability [CRITICAL]:** Unfair reward distribution. The `getClaimable` function relies on the current contract balance. As soon as one creator claims, the balance drops, effectively "stealing" from other creators who haven't claimed yet.
- **Recommendation:** Use a **Cumulative Rewards** model (Points-per-Weight). Track the total rewards distributed and use a global `rewardPerWeight` variable to ensure mathematical fairness regardless of withdrawal timing.

### 3. AssetMarketplace.sol
- **Vulnerability [HIGH]:** DoS via `.transfer`. Purchase fails if the asset creator's wallet rejects the transfer.
- **Recommendation:** Use `.call{value: amount}("")` with reentrancy guards, or better yet, move to a withdrawal pattern.

### 4. General Security
- **Access Control:** documented contracts use OpenZeppelin `Ownable`, which is good.
- **Reentrancy:** `nonReentrant` guards are present on key state-changing functions.

---

## Technical Integration Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Solidity Source** | ❌ Missing | No `.sol` files found in `packages/contracts/`. |
| **Contract ABIs** | ❌ Missing | No compiled artifacts or JSON ABIs found. |
| **Wallet Integration** | ❌ Missing | `apps/web` has no Wagmi, RainbowKit, or Ethers.js implementation. |
| **Deployment Scripts** | ⚠️ Documentation Only | `scripts/deploy.ts` is only in `SMART_CONTRACTS.md`. |

---

## Blockchain Roadmap Requirements

To achieve Web3 readiness, the following steps are mandatory:

1.  **Code Extraction:** Move Solidity code from `docs/SMART_CONTRACTS.md` to `packages/contracts/contracts/`.
2.  **Refactor for Security:** Fix the DoS and distribution logic flaws identified above.
3.  **Frontend Plumbing:**
    - Install `@tanstack/react-query`, `wagmi`, and `viem` in `apps/web`.
    - Implement `WalletProvider` and connection modals.
4.  **Environment Setup:** Configure RPC URLs and deployer keys for Base/Avalanche in `.env`.
5.  **Audit:** Perform a secondary audit once the code is actually implemented in the filesystem.
