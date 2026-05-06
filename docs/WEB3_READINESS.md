# Web3 Readiness Audit

**Status:** Conceptual / Foundational
**Date:** 2026-05-06
**Auditor:** Jules (Smart Contract Reviewer)

## Executive Summary
The Animatica project currently lacks active blockchain integration at the runtime level. While the architectural foundation is laid out in documentation and a dedicated package exists for contracts, no wallet connectors, provider configurations, or compiled artifacts (ABIs) are present in the functional application code.

## Audit Findings

### 1. Contract Implementations
- **Source Files:** Zero `.sol` files were found in the `packages/contracts/contracts/` directory.
- **Documentation:** Four core contracts (`DonationPool`, `CreatorFund`, `AnimaticaTreasury`, `AssetMarketplace`) are documented as code blocks within `docs/SMART_CONTRACTS.md`.
- **Tooling:** `packages/contracts` is configured with Hardhat, TypeScript, and OpenZeppelin dependencies, but no compilation or deployment has been executed.

### 2. Wallet & Frontend Integration
- **Libraries:** No traces of `wagmi`, `viem`, `RainbowKit`, or `web3.js` were found in `apps/` or `packages/editor`.
- **UI Components:** There are no "Connect Wallet" buttons or transaction handling components in the current editor or platform layouts.

### 3. Contract ABIs
- **Search Results:** A repository-wide search for `abi` in JSON files returned zero results. The frontend has no knowledge of how to interact with the proposed smart contracts.

## Technical & Security Risks

### Vulnerable Fund Transfer Pattern
The contracts in `docs/SMART_CONTRACTS.md` utilize the `.transfer()` method for sending ETH/Base:
```solidity
payable(film.creators[i]).transfer(creatorAmount);
```
**Risk:** This pattern is discouraged as it relies on a fixed gas stipend (2300 gas), which can fail if the recipient is a contract or if EVM gas costs change.
**Recommendation:** Transition to the "Pull-Payment" pattern or use the low-level `.call{value: amount}("")` with a reentrancy guard.

### CreatorFund Distribution Logic
The `getClaimable` function calculates shares based on the current balance:
```solidity
return (address(this).balance * creatorWeight[creator]) / totalWeight;
```
**Risk:** This logic is flawed if funds are added to the contract after some users have already claimed. It doesn't track historical distributions.
**Recommendation:** Implement a `rewardPerWeight` accumulator (MasterChef style) to ensure fair distribution over time.

## Roadmap to Readiness
1. **Source Migration:** Move contracts from `docs/SMART_CONTRACTS.md` to `packages/contracts/contracts/`.
2. **Security Hardening:** Refactor transfers to use safer patterns and fix distribution logic.
3. **Provider Setup:** Integrate `wagmi` and `viem` in `apps/web` and `packages/platform`.
4. **Build Pipeline:** Configure Hardhat to export ABIs directly to the frontend packages upon compilation.
