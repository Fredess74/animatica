# Web3 Readiness Audit

This document outlines the current state of blockchain integration, smart contract security, and infrastructure readiness for the Animatica platform.

## Audit Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Smart Contracts | **CRITICAL RISKS** | Multiple vulnerabilities identified in core logic. |
| Database Schema | **READY** | Supabase schema supports wallets and transaction tracking. |
| Frontend (Web) | **NOT STARTED** | No wallet connection or provider logic implemented. |
| Platform Package | **NOT STARTED** | No blockchain utility hooks or contract ABIs. |

---

## Smart Contract Audit (docs/SMART_CONTRACTS.md)

### 1. DonationPool.sol
*   **Gas DoS (Unbounded Loop):** The `donate` function iterates over the `creators` array. There is no limit on the number of creators that can be registered to a film. If the array is too large, the `donate` transaction will exceed the block gas limit, effectively freezing donations for that film.
*   **Deprecated Transfer:** Uses `.transfer()` which is capped at 2300 gas. This will fail if a creator uses a smart contract wallet (like Safe) or any contract with a `receive()` function that consumes more than 2300 gas.
*   **Precision Loss:** Divisions occur before multiplications in some edge cases if not careful, though here it mostly follows `(amount * bps) / denominator` which is standard but lacks rounding protection.

### 2. CreatorFund.sol
*   **Critical Accounting Flaw:** The `getClaimable` function calculates rewards based on the *current* `address(this).balance`.
    ```solidity
    return (address(this).balance * creatorWeight[creator]) / totalWeight;
    ```
    This is flawed. If Creator A claims their 10%, the contract balance drops. If Creator B (who also has 10% weight) claims immediately after, they receive 10% of the *remaining* 90% (i.e., 9% of the original total). The system does not track "already claimed" vs "total historical revenue."
*   **Deprecated Transfer:** Same risk as `DonationPool`.

### 3. AssetMarketplace.sol
*   **Ignored Royalty Logic:** The `listAsset` function allows setting `royaltyBps`, and this value is stored in the `Asset` struct. However, the `purchase` function completely ignores this value, only distributing the platform fee and the creator's primary sale amount.
*   **Missing Secondary Market:** There is no logic for reselling assets, which is where royalties typically apply.
*   **Deprecated Transfer:** Same risk as `DonationPool`.

---

## Infrastructure & Integration

### Database (Supabase)
*   `profiles` table includes `wallet_address`.
*   `films` table includes `chain_film_id`.
*   `assets` table includes `chain_asset_id`.
*   `donations` table includes `tx_hash`, `amount_wei`, and breakdown fields.
*   **Status:** The schema is well-prepared for indexing on-chain events.

### Frontend (Next.js / React)
*   **Library Audit:** No evidence of `wagmi`, `viem`, `ethers.js` (v6), or `rainbowkit` in `package.json` or source files.
*   **Integration:** Wallet connection buttons and contract interaction hooks are missing from the UI.

---

## Recommendations

1.  **Refactor CreatorFund:** Implement a "pull-payment" or "scaled shares" pattern (similar to OpenZeppelin's `PaymentSplitter` or Synthetix Staking) to ensure fair distribution regardless of claim timing.
2.  **Modernize Transfers:** Replace `.transfer()` with `.call{value: amount}("")` followed by a requirement check for success.
3.  **Loop Limits:** Implement a maximum number of creators per film in `registerFilm`.
4.  **Frontend Bootstrap:** Initialize `wagmi` / `viem` in `apps/web` and create a shared `@Animatica/platform` hook for wallet state.
