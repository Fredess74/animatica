# Web3 Readiness Audit

## Official Project Stance

According to `docs/JULES_GUIDE.md`, the Animatica project has **absolutely nothing** to do with blockchain, Web3, NFTs, smart contracts, or cryptocurrency. Writing any code or documentation related to these topics is **STRICTLY FORBIDDEN**.

Current "Web3 Readiness" is **NEGATIVE**. The project is in the process of purging all legacy blockchain artifacts to align with the core mission of being a web-based animation platform.

---

## Audit of Legacy Artifacts

The following artifacts have been identified as legacy/off-scope and are slated for removal:

### 1. Source Code & Configuration
- `packages/contracts/`: Contains legacy Hardhat configuration and a placeholder test. No active Solidity contracts were found in the source tree, though the directory itself should be deleted.
- `docs/SMART_CONTRACTS.md`: Contains deprecated documentation and Solidity snippets for `DonationPool`, `CreatorFund`, `AnimaticaTreasury`, and `AssetMarketplace`.

### 2. Database & Data Models
- `supabase/migrations/001_initial_schema.sql`: Contains a `wallet_address` field in the `profiles` table.
- `docs/DATA_MODELS.md`: References `wallet_address` as part of the user profile schema.
- `docs/SUPABASE_SCHEMA.md`: References `wallet_address` and associated indexes.

### 3. Dependencies
The following blockchain-related dependencies are present in `packages/contracts/package.json` and/or `pnpm-lock.yaml`:
- `hardhat`
- `ethers`
- `@nomicfoundation/hardhat-toolbox`
- `@openzeppelin/contracts`

---

## Purge Checklist (Blockchain Removal)

To achieve "zero-blockchain" status as mandated by project rules, the following actions must be taken (by authorized roles):

- [ ] Delete `packages/contracts/` directory.
- [ ] Delete `docs/SMART_CONTRACTS.md`.
- [ ] Remove `wallet_address` column from `profiles` table in Supabase schema.
- [ ] Update `docs/DATA_MODELS.md` to remove blockchain-related fields.
- [ ] Remove blockchain-specific keywords from `README.md` (e.g., "Earn — Get paid through a transparent donation pool powered by smart contracts").
- [ ] Clean up `pnpm-lock.yaml` by removing unused blockchain dependencies after package deletion.
