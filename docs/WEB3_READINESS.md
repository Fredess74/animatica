# Web3 Readiness Audit

**Date:** 2026-05-22
**Auditor:** Jules (AI Agent)
**Status:** 🔴 CRITICAL RISKS IDENTIFIED

## Executive Summary

The Animatica Web3 layer is currently in a conceptual or "hallucinated" state. While documentation exists in `docs/SMART_CONTRACTS.md`, the actual implementation is missing from the codebase. Furthermore, the documented logic contains several critical vulnerabilities that would lead to loss of funds or permanent denial of service if deployed as-is.

## 1. Smart Contract Audit

### Source Code Status
- **Location:** `packages/contracts`
- **Finding:** No Solidity (`.sol`) files found. Only configuration files and a placeholder test exist.
- **Reference:** `docs/SMART_CONTRACTS.md` contains the only record of intended contract logic.

### Critical Vulnerabilities Identified

#### A. Gas DoS & Fund Locking (DonationPool.sol)
In the `donate` function, the contract loops through an array of creators and uses `.transfer()` to send funds:
```solidity
for (uint256 i = 0; i < film.creators.length; i++) {
    uint256 creatorAmount = (creatorTotal * film.shares[i]) / BPS_DENOMINATOR;
    payable(film.creators[i]).transfer(creatorAmount);
}
```
- **Risk:** If the `creators` array is too large, the transaction will exceed the gas limit and fail.
- **Risk:** If any creator is a contract that does not accept ETH (no `receive` or `fallback`), the `.transfer()` call will revert, locking ALL funds in the pool for that film.
- **Recommendation:** Use a "Pull over Push" pattern (Withdrawal pattern).

#### B. Flawed Distribution Logic (CreatorFund.sol)
The `getClaimable` function calculates shares based on the *current* contract balance:
```solidity
function getClaimable(address creator) public view returns (uint256) {
    if (totalWeight == 0) return 0;
    return (address(this).balance * creatorWeight[creator]) / totalWeight;
}
```
- **Risk:** This logic is mathematically incorrect for a weight-based fund. If one creator claims their share, the `address(this).balance` decreases, reducing the calculated claimable amount for everyone else. This will result in most creators being unable to claim their full fair share.
- **Recommendation:** Use a cumulative "shares per weight" accumulator pattern (similar to MasterChef or Synthetix Staking).

#### C. Use of Deprecated `.transfer()`
The contracts use `.transfer()`, which has a fixed gas limit of 2300.
- **Risk:** This will fail if creators use smart contract wallets (like Safe) that require more gas for the `receive` function.
- **Recommendation:** Use `.call{value: amount}("")`.

## 2. Frontend Integration

### Wallet Support
- **Packages Checked:** `apps/web`, `packages/platform`
- **Findings:**
    - No `wagmi`, `viem`, `ethers.js`, or `web3.js` dependencies found.
    - No RainbowKit or ConnectKit components found.
    - No wallet connection logic or provider wrappers detected.

### Contract Interaction
- **Findings:** No ABIs or generated contract types (Typechain/Wagmi) found in the source tree.

## 3. Conclusion & Recommendation

The project is currently **0% ready** for Web3 integration.

**Immediate Actions Required:**
1. **Decision on Scope:** `docs/PROGRESS.md` suggests deleting the Web3 layer entirely as it is "off-scope for a video editor."
2. **Rewrite:** If Web3 features are retained, the contracts must be rewritten from scratch using standard audited patterns (OpenZeppelin's `PaymentSplitter` or similar).
3. **Infrastructure:** Add Hardhat/Foundry toolchain properly with actual `.sol` files and comprehensive unit tests.
