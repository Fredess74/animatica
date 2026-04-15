# Web3 Readiness Audit

**Status:** Preliminary Audit - May 22, 2026
**Commit:** `audit(web3): contract review`

## Executive Summary
The Animatica project currently maintains smart contract definitions in documentation but lacks integrated blockchain infrastructure in the active codebase. Critical security risks and logic flaws were identified in the proposed contracts. Frontend wallet integration is non-existent beyond database schema placeholders.

---

## Smart Contract Audit (Source: `docs/SMART_CONTRACTS.md`)

### 1. DonationPool.sol
- **Risk: Gas Denial of Service (DoS)**
  The `donate` function iterates over an unbounded array of creators (`film.creators`). If a film is registered with a large number of creators, the transaction will exceed the block gas limit and fail, permanently locking donations for that film.
- **Risk: Usage of `.transfer()`**
  Uses the deprecated `.transfer()` method which has a fixed gas stipend of 2300. This will fail if a creator is a smart contract (e.g., a multi-sig or vault) that requires more than 2300 gas to receive funds. Use `.call{value: amount}("")` instead.
- **Optimization:** Re-entrancy guard is present, which is good, but the split logic should follow the "Withdrawal Pattern" instead of "Push Pattern" to mitigate the Gas DoS.

### 2. CreatorFund.sol
- **Critical Logic Flaw: Accounting Error**
  `getClaimable` calculates shares based on `address(this).balance`. This is incorrect because it doesn't account for funds already claimed by others. A late claimer would be calculating their percentage of a diminished balance.
  *Fix:* Track a `cumulativeRewardPerWeight` variable and individual `rewardDebt`.
- **Risk: Usage of `.transfer()`**
  Same issue as `DonationPool`. Will fail for contract-based creators.

### 3. AssetMarketplace.sol
- **Critical Logic Flaw: Ignored Royalties**
  `purchase` function takes `royaltyBps` during listing but never uses it during the sale. 100% of the non-fee amount goes to the current seller, even if they aren't the original creator.
- **Logic Flaw: Fee Calculation**
  Hardcoded `1000` denominator for fee calculation (`10000` is used elsewhere for BPS). This results in a 100% fee if calculated against standard BPS expectations.

---

## Infrastructure & Frontend Readiness

### Wallet Integration
- **Status:** **Not Implemented**
- **Findings:**
  - No `wagmi`, `viem`, or `ethers` provider setup in `apps/web`.
  - `Navbar` component does not contain a "Connect Wallet" button.
  - No wallet connection hooks found in `packages/platform`.
  - **Database Placeholder:** `supabase/migrations/001_initial_schema.sql` contains `wallet_address TEXT UNIQUE`, indicating readiness for off-chain mapping.

### Contract ABIs
- **Status:** **Missing**
- **Findings:**
  - `packages/contracts` contains no generated artifacts or manually defined ABIs.
  - Hardhat is configured but no contracts are present in `packages/contracts/contracts/`.

---

## Recommendations

1.  **Refactor Contracts:** Implement the "Pull over Push" payment pattern. Fix the `CreatorFund` accounting logic using a global index.
2.  **Modernize Transfers:** Replace `.transfer()` with `.call{value: ...}("")` and appropriate re-entrancy checks.
3.  **Bootstrap Web3:** Add `@rainbow-me/rainbowkit`, `wagmi`, and `viem` to `apps/web`.
4.  **Sync Docs:** Move Solidity code from `docs/SMART_CONTRACTS.md` into `packages/contracts/contracts/` to enable automated testing and CI.
