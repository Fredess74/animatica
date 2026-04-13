# Web3 Readiness Audit Report

**Status:** 🔴 CRITICAL - Not Recommended for Production

This document outlines the findings of the blockchain/Web3 audit for the Animatica project.

## Executive Summary

The current Web3 implementation is in a "hallucinated" state. While documentation exists in `docs/SMART_CONTRACTS.md`, the actual source files (`.sol`) are missing from the repository. The identified Solidity code contains several critical security vulnerabilities and fundamental logic flaws that would lead to loss of funds or permanent freezing of assets.

Furthermore, per `docs/JULES_GUIDE.md` and `docs/PROGRESS.md`, blockchain features have been officially removed from the project scope.

## Critical Security Risks

### 1. Gas Denial of Service (DoS) - `DonationPool.sol`
The `donate` function iterates over an unbounded array of creators (`film.creators`). If a film has a large number of creators, the gas cost of a donation will exceed the block gas limit, rendering the donation (and fund distribution) impossible.

### 2. Deprecated Transfer Method - All Contracts
All contracts use `payable(addr).transfer(amount)`.
- **Risk:** This method has a fixed gas limit of 2,300. If the recipient is a smart contract (e.g., a multi-sig wallet like Gnosis Safe), the transaction will likely fail because modern contracts often require more gas for their `receive()` or `fallback()` functions.
- **Recommendation:** Use `(bool success, ) = addr.call{value: amount}("");` with proper reentrancy guards.

### 3. Logic Flaw in Fund Distribution - `CreatorFund.sol`
The `getClaimable` function calculates share based on `address(this).balance`.
```solidity
return (address(this).balance * creatorWeight[creator]) / totalWeight;
```
- **Issue:** As soon as one creator claims their share, the `balance` of the contract decreases, which reduces the `getClaimable` amount for every other creator. This is a fundamental accounting error.
- **Result:** Only the first person to claim gets their correct share; others receive progressively less than they are owed.

### 4. Royalty Neglect - `AssetMarketplace.sol`
The `purchase` function in `AssetMarketplace.sol` defines a `royaltyBps` in the `Asset` struct but never utilizes it during the payment split in the `purchase` function. All funds (minus platform fee) go to the creator, ignoring any potential secondary royalty logic.

## Integration Audit

### Frontend Readiness
- **Wallet Connection:** ❌ Not implemented. No `wagmi`, `RainbowKit`, or `ConnectButton` found.
- **Provider Setup:** ❌ Not implemented. No `ethers` or `viem` providers configured in `apps/web`.
- **ABI Availability:** ❌ No compiled artifacts or JSON ABIs found in the codebase.

### Package State
- **@Animatica/contracts:** Contains configuration files (Hardhat) but **zero** source files.
- **Dependencies:** `ethers` exists only as a transitive dependency for Hardhat tooling.

## Final Assessment

The project is **0% ready** for Web3 integration. The existing documentation describes a system that is both physically missing and logically broken.

**Recommendation:** Proceed with the planned deletion of `packages/contracts` and `docs/SMART_CONTRACTS.md` as noted in `PROGRESS.md`.
