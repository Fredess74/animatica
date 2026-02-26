# License Audit Report

**Date:** 2026-02-24
**Auditor:** Jules (License Auditor)
**Status:** PASS (with warnings for dev dependencies)

## Summary

This document lists all dependencies used in the project and their license compatibility. The project policy is to use permissive licenses (MIT, ISC, Apache-2.0, BSD) for all runtime dependencies distributed to end-users. Strong copyleft licenses (GPL, AGPL) are prohibited. Weak copyleft licenses (LGPL, MPL) are permitted only in development dependencies or if used in a way that satisfies their linking requirements.

## Findings

### Runtime Dependencies (Distributed)
All runtime dependencies in `packages/engine`, `packages/editor`, `apps/web`, and `packages/platform` use permissive licenses compatible with proprietary distribution.

| License Family | Status | Examples |
| :--- | :--- | :--- |
| **MIT** | ✅ Allowed | React, Three.js, Zustand, Next.js |
| **ISC** | ✅ Allowed | Lucide React, Yargs |
| **Apache-2.0** | ✅ Allowed | TypeScript, Rapier (via compat) |
| **BSD-2/3-Clause** | ✅ Allowed | Terser, Esprima |
| **CC0-1.0** | ✅ Allowed | MDN Data |
| **0BSD** | ✅ Allowed | Tslib |
| **BlueOak-1.0.0** | ✅ Allowed | Minimatch |
| **Python-2.0** | ✅ Allowed | Argparse |

### Development Dependencies (Internal Use Only)
The following dependencies use copyleft licenses but are **not distributed** in the production build. They are used only for testing, building, or local development.

| Dependency | License | Usage | Status |
| :--- | :--- | :--- | :--- |
| **web3-utils** | LGPL-3.0 | `packages/contracts` (Hardhat testing) | ⚠️ **Dev Only** |
| **@ethereumjs/rlp** | MPL-2.0 | `packages/contracts` (Hardhat testing) | ⚠️ **Dev Only** |
| **@ethereumjs/util** | MPL-2.0 | `packages/contracts` (Hardhat testing) | ⚠️ **Dev Only** |
| **ethereumjs-util** | MPL-2.0 | `packages/contracts` (Hardhat testing) | ⚠️ **Dev Only** |
| **rlp** | MPL-2.0 | `packages/contracts` (Hardhat testing) | ⚠️ **Dev Only** |
| **lightningcss** | MPL-2.0 | Build tool (Vite/Parcel) | ✅ **Build Tool** |
| **@img/sharp-libvips** | LGPL-3.0 | Image optimization (Server-side/Build) | ✅ **Build Tool** |

**Action Required:** Monitor `web3-utils` and `@ethereumjs/*`. Ensure they are never imported into `apps/web` client-side code.

## License Compatibility Matrix

| License | Status | Policy |
| :--- | :--- | :--- |
| MIT / ISC | ✅ Allowed | Standard permissive license. |
| Apache-2.0 | ✅ Allowed | Permissive with patent grant. |
| BSD-2/3 | ✅ Allowed | Permissive. |
| CC0 / Unlicense | ✅ Allowed | Public domain. |
| LGPL-3.0 | ⚠️ Restricted | Allowed **only** in devDependencies or server-side. Avoid in client bundles. |
| MPL-2.0 | ⚠️ Restricted | Allowed **only** in devDependencies or unmodified file-level usage. |
| GPL / AGPL | ❌ Banned | Strictly prohibited in any dependency. |

## Detailed Dependency List (Non-MIT Flagged)

The following list clarifies the license status of dependencies previously flagged as "Non-MIT". Most are permissive and safe.

| Dependency | License | Category | Status |
| :--- | :--- | :--- | :--- |
| **typescript** | Apache-2.0 | Permissive | ✅ Safe |
| **@dimforge/rapier3d-compat** | Apache-2.0 | Permissive | ✅ Safe |
| **sharp** | Apache-2.0 | Permissive | ✅ Safe |
| **esprima** | BSD-2-Clause | Permissive | ✅ Safe |
| **terser** | BSD-2-Clause | Permissive | ✅ Safe |
| **webidl-conversions** | BSD-2-Clause | Permissive | ✅ Safe |
| **diff** | BSD-3-Clause | Permissive | ✅ Safe |
| **qs** | BSD-3-Clause | Permissive | ✅ Safe |
| **source-map** | BSD-3-Clause | Permissive | ✅ Safe |
| **argparse** | Python-2.0 | Permissive | ✅ Safe |
| **caniuse-lite** | CC-BY-4.0 | Data (Attribution) | ✅ Safe |
