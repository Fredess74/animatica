# Web3 Readiness Audit

This document tracks the status of blockchain integration, smart contract audits, and wallet readiness for the Animatica platform.

## Summary

| Component | Status | Risk Level | Notes |
|-----------|--------|------------|-------|
| Smart Contracts | Audit Complete (4 Contracts) | **High** | Critical logic and security flaws identified. |
| Wallet Integration | Not Started | Low | Frontend lacks Wagmi/Ethers/RainbowKit. |
| ABI Registry | Not Started | Low | No contract ABIs found in frontend packages. |
| Database Schema | Ready | Low | `profiles` table includes `wallet_address`. |

---

## Smart Contract Audit (May 2026)

The following contracts from `docs/SMART_CONTRACTS.md` were extracted and audited in `packages/contracts/contracts/`.

### 1. DonationPool.sol
*   **Status:** Critical Risk
*   **Issues:**
    *   **Gas DoS:** The `donate` function iterates over an unbounded array of `creators`. A film with many creators will exceed block gas limits, preventing donations.
    *   **Deprecated Transfer:** Uses `payable(addr).transfer()`, which is limited to 2300 gas and will fail if the creator is a smart contract (e.g., Gnosis Safe).
    *   **Logic:** Fixed split percentages (70/20/10) are hardcoded, reducing platform flexibility.

### 2. CreatorFund.sol
*   **Status:** Critical Risk
*   **Issues:**
    *   **Accounting Flaw:** `getClaimable` uses `address(this).balance` directly. This is incorrect because it doesn't account for funds already claimed by other users, leading to a "first-come-first-served" drain rather than proportional distribution.
    *   **Rounding Errors:** Integer division before multiplication in weight calculations may lead to stuck dust.

### 3. AnimaticaTreasury.sol
*   **Status:** Low Risk
*   **Issues:**
    *   **Deprecated Transfer:** Uses `.transfer()`.

### 4. AssetMarketplace.sol
*   **Status:** Medium Risk
*   **Issues:**
    *   **Royalty Enforcement:** `listAsset` accepts a `royaltyBps` parameter, but the `purchase` function **ignores it**, failing to distribute royalties to the creator on secondary sales (if secondary sales were implemented) or even primary sales logic.

---

## Frontend & Integration Status

### Wallet Support
*   **Status:** ❌ Absent
*   **Details:** No evidence of `wagmi`, `viem`, `ethers.js`, or `web3.js` in `apps/web/package.json`.
*   **Action Required:** Install `@rainbow-me/rainbowkit` and `wagmi` to enable "Connect Wallet" functionality.

### ABI Integration
*   **Status:** ❌ Absent
*   **Details:** No contract ABIs or Typechain exports are currently utilized by the `@Animatica/web` or `@Animatica/platform` packages.

### Backend/Supabase
*   **Status:** ✅ Partial
*   **Details:** `profiles` table successfully contains a `wallet_address` field, enabling account-to-wallet mapping once the frontend is ready.

---

## Recommendations

1.  **Refactor DonationPool:** Move to a "Pull over Push" withdrawal pattern to avoid Gas DoS.
2.  **Fix CreatorFund Logic:** Implement a `totalShares` and `cumulativeProfitPerShare` accounting system (similar to Synthetix Staking rewards) to handle proportional claims correctly.
3.  **Update Transfer Method:** Replace `.transfer()` with `.call{value: amount}("")` to support modern smart contract wallets.
4.  **Enforce Royalties:** Update `AssetMarketplace.purchase` to actually pay out the specified royalty to the creator.
