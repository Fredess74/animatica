# Web3 Readiness Audit Report

**Date:** April 22, 2026
**Auditor:** Smart Contract Reviewer
**Status:** ⚠️ Partial Readiness

---

## 1. Smart Contract Audit Findings

The Solidity source code located in `docs/SMART_CONTRACTS.md` was reviewed for security vulnerabilities, logic flaws, and gas optimization.

### ⚠️ Critical & High Risks

| Contract | Issue | Description | Recommendation |
|----------|-------|-------------|----------------|
| `DonationPool.sol` | **DoS via Unbounded Loop** | The `donate` function iterates over `film.creators`. A film with too many creators will hit the gas limit, preventing all donations. | Limit the maximum number of creators per film or use a "pull" (claim) model instead of "push" (transfer). |
| `CreatorFund.sol` | **Flawed Distribution Logic** | Rewards are not time-weighted. New creators can claim a share of the *historical* balance immediately upon weight assignment. | Implement a "Reward per Share" accumulator (Synthetix-style) to ensure fair distribution over time. |
| All Contracts | **Deprecated `.transfer()`** | Use of `.transfer()` is discouraged as it has a fixed gas stipend (2300), which causes failures when sending to smart contract wallets. | Replace `.transfer(amount)` with `(bool success, ) = to.call{value: amount}(""); require(success, "Transfer failed");`. |

### 🔍 Medium & Low Risks

*   **AssetMarketplace.sol (Excess Funds):** The `purchase` function requires `msg.value >= asset.price` but does not refund excess ETH sent by the buyer.
*   **AssetMarketplace.sol (Hardcoded Fees):** The 10% platform fee is constant. Consider making it adjustable via `onlyOwner` with a maximum cap.
*   **Precision Issues:** `CreatorFund.sol` performs divisions that may result in dust being trapped in the contract over time.

---

## 2. Codebase Infrastructure Scan

### Frontend (`apps/web`, `packages/editor`)
*   **Wallet Integration:** ❌ **None.** No Wagmi, Viem, or RainbowKit configurations found.
*   **Contract Interaction:** ❌ **None.** No ABIs or contract hooks/utilities implemented.
*   **UI Components:** ❌ **None.** No `ConnectButton` or wallet state handling in the Navbar or Modals.

### Backend & Database (`supabase/`)
*   **Schema Support:** ✅ **Ready.** The `profiles` table includes `wallet_address`. `films`, `donations`, and `assets` tables have fields for tracking `_wei` and `chain_id`.
*   **Migrations:** Migration `001_initial_schema.sql` correctly indexes the `wallet_address` for fast lookups.

---

## 3. Blockchain Readiness Score: 4/10

The project has a solid data architecture for Web3 in the database layer, but the smart contracts require a significant refactor for safety and fairness, and the frontend lacks any blockchain connectivity.

### Recommended Roadmap

1.  **Refactor Contracts:** Fix `.transfer()` and implement a pull-payment or accumulator model for the `CreatorFund`.
2.  **Frontend Plumbing:** Install `wagmi` and `viem`. Configure providers for Base and Avalanche in `apps/web`.
3.  **Authentication:** Implement "Sign-in with Ethereum" (SIWE) to link Auth.users with `wallet_address`.
4.  **Deployment:** Deploy corrected contracts to Base Sepolia and verify on Etherscan.
