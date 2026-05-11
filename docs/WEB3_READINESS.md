# Web3 Readiness Report

**Status:** Conceptual

This document tracks the integration of blockchain technology within the Animatica project.

## Summary

As of the current audit, Animatica's Web3 integration is in the **Conceptual** phase. While detailed smart contract specifications and architecture plans exist in the documentation, there are no live smart contracts in the source tree, and no frontend wallet integrations have been implemented.

## Smart Contracts Audit

The following contracts are defined in `docs/SMART_CONTRACTS.md` but are currently **missing** from the `packages/contracts/contracts/` directory:

1.  **DonationPool.sol**: Handles donation splits (70% Creators / 20% Creator Fund / 10% Treasury).
2.  **CreatorFund.sol**: Manages weighted distribution of funds to active creators.
3.  **AnimaticaTreasury.sol**: Platform-level treasury for fee collection.
4.  **AssetMarketplace.sol**: Facilitates on-chain listing and purchasing of animation assets.

**Findings:**
*   `packages/contracts/` contains Hardhat configuration but no `.sol` files.
*   Deployment scripts (`scripts/deploy.ts`) are referenced in documentation but not present in the filesystem.
*   `packages/contracts/test/` contains only a placeholder test.

## Frontend Integration Audit

**Findings:**
*   **Wallet Integration**: No traces of `wagmi`, `viem`, or `@rainbow-me/rainbowkit` were found in `apps/web/package.json` or the source code.
*   **Contract Interaction**: No contract ABIs or deployed contract addresses are present in the application state or constants.
*   **Authentication**: `ARCHITECTURE.md` mentions NextAuth.js 5 with wallet support, but this is not yet implemented in `apps/web`.

## Target Tech Stack

Per `docs/ARCHITECTURE.md`, the intended Web3 stack is:

*   **Networks**: Base (Coinbase L2) or Avalanche C-Chain.
*   **Wallet Libraries**: `wagmi` 2 + `RainbowKit`.
*   **Provider**: ethers.js 6 or viem.
*   **Fiat On-Ramp**: MoonPay integration.

## Roadmap to Readiness

1.  Implement Solidity source files in `packages/contracts/contracts/`.
2.  Develop comprehensive test suites for all contracts.
3.  Add `wagmi` and `RainbowKit` to `@Animatica/web`.
4.  Implement `useWallet` hooks and transaction flows in the Editor and Platform packages.
5.  Configure deployment pipelines for Base/Avalanche testnets.
