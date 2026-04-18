# Web3 Readiness Report

This document audits the current state of blockchain integration within the Animatica platform.

## 1. Smart Contracts Audit

The core logic for Animatica's monetization has been extracted and verified in `packages/contracts/`.

### Contracts Overview
| Contract | Purpose | Status |
|----------|---------|--------|
| `DonationPool.sol` | Splits donations between creators, fund, and treasury. | Verified |
| `CreatorFund.sol` | Distributes platform-wide funds based on creator weights. | Verified |
| `AnimaticaTreasury.sol` | Platform revenue management. | Verified |
| `AssetMarketplace.sol` | Peer-to-peer asset sales and royalties. | Verified |

### Audit Findings
- **Security**: All financial entry points use `ReentrancyGuard`. Access control is properly enforced via `Ownable`.
- **Known Issues**:
  - Use of `.transfer()`: While safe against reentrancy, it has a fixed gas stipend (2300) which may fail if the recipient is a contract (e.g., a multi-sig wallet). Recommendation: Migrate to `.call{value: amount}("")`.
  - `CreatorFund` Weight Logic: `getClaimable` calculates the share based on current balance. A better pattern would be a "pull" mechanism with `accumulatedFundsPerWeight` to ensure fair distribution as new funds enter.

### ABIs & Artifacts
Compiled ABIs are available at:
- `packages/contracts/artifacts/contracts/DonationPool.sol/DonationPool.json`
- `packages/contracts/artifacts/contracts/CreatorFund.sol/CreatorFund.json`
- `packages/contracts/artifacts/contracts/AnimaticaTreasury.sol/AnimaticaTreasury.json`
- `packages/contracts/artifacts/contracts/AssetMarketplace.sol/AssetMarketplace.json`

## 2. Infrastructure Readiness

### Database (Supabase)
The schema in `supabase/migrations/001_initial_schema.sql` is **Web3-ready**:
- `profiles` table includes `wallet_address`.
- `films` table includes `chain_film_id`.
- `donations` table includes `tx_hash`, `chain`, `block_number`, and wei-denominated amounts.
- `assets` table includes `chain_asset_id`.

### Frontend & Platform Gaps
- **Dependencies**: `apps/web` and `packages/platform` currently lack Web3 libraries (`wagmi`, `viem`, `ethers`, or `rainbowkit`).
- **UI Components**: There are no wallet connection buttons or transaction status indicators in the current `editor` or `web` packages.
- **Backend**: No oracle or listener service is currently implemented to sync on-chain events (donations, purchases) back to the Supabase database.

## 3. Compliance Note
As per `docs/JULES_GUIDE.md`, development of blockchain features is currently restricted. This audit serves to document existing infrastructure for future roadmap phases (Phase 8+).
