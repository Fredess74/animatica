# Web3 Readiness & Policy

**Status:** Blockchain Functionality Deprecated/Forbidden
**Date:** March 2026

## Overview

Animatica is a pure animation platform focused on creative tools and community sharing. Following a strategic pivot, all blockchain, cryptocurrency, Web3, NFT, and smart contract functionality has been formally deprecated and is now strictly forbidden in the codebase.

## Policy

1.  **No Crypto Features**: No new features related to wallets, tokens, or on-chain assets shall be implemented.
2.  **No Blockchain Dependencies**: Do not add packages related to Web3 (e.g., `ethers`, `web3.js`, `wagmi`, `viem`) to the project.
3.  **Removal of Legacy Code**: Any remaining smart contracts, migration scripts for crypto fields, or Web3-related UI components are to be treated as technical debt and scheduled for removal.
4.  **Documentation Audit**: All documentation must be regularly audited to ensure no references to "crypto-payouts", "NFT assets", or "smart contract revenue splits" persist in user-facing or developer-facing guides.

## Rationale

The project mission is to democratize animation through AI and intuitive interfaces. The inclusion of blockchain technology introduced unnecessary complexity, regulatory risk, and friction for our primary user base of creators and fans.

## Removal Progress

- [x] Phase 8 (Crypto Monetization) removed from [docs/ROADMAP.md](ROADMAP.md).
- [x] Web3 marketing copy removed from [README.md](../README.md).
- [ ] Delete `packages/contracts` directory.
- [ ] Delete `docs/SMART_CONTRACTS.md`.
- [ ] Clean up legacy database fields in Supabase migrations.

---

*This document serves as the definitive source for the project's stance on Web3 technologies.*
