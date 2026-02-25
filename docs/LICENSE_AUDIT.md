# License Audit

**Date:** 2026-02-23
**Auditor:** Jules (License Auditor)

## Summary

This document lists all dependencies used in the project and their licenses. It also flags any non-MIT/Apache-2.0 licenses and checks for the presence of the project's own LICENSE file and license headers in source code.

## Project License

- **File:** `LICENSE`
- **Status:** Present
- **License:** MIT

## Source Code Headers

- **Checked:** `packages/engine/src/index.ts`
- **Result:** No license header found.
- **Note:** Other packages (`packages/editor`, `apps/web`) have standard MIT license in root.

## Dependency Licenses

The following dependencies were audited (direct dependencies only):

| Dependency | License | Flag | Used In |
| --- | --- | --- | --- |
| @nomicfoundation/hardhat-toolbox | MIT |  | @Animatica/contracts (Dev) |
| @openzeppelin/contracts | MIT |  | @Animatica/contracts (Dev) |
| @react-three/drei | MIT |  | @Animatica/engine |
| @react-three/fiber | MIT |  | @Animatica/editor (Dev), @Animatica/engine (Peer), @Animatica/web |
| @tailwindcss/postcss | MIT |  | @Animatica/editor (Dev) |
| @testing-library/dom | MIT |  | @Animatica/web (Dev) |
| @testing-library/react | MIT |  | @Animatica/editor (Dev), @Animatica/engine (Dev), @Animatica/web (Dev) |
| @types/react | MIT |  | @Animatica/editor (Dev), @Animatica/engine (Dev), @Animatica/platform (Dev), @Animatica/web (Dev) |
| @types/react-dom | MIT |  | @Animatica/editor (Dev), @Animatica/platform (Dev), @Animatica/web (Dev) |
| @types/three | MIT |  | @Animatica/engine (Dev) |
| @types/uuid | MIT |  | @Animatica/engine (Dev) |
| @vitejs/plugin-react | MIT |  | @Animatica/editor (Dev) |
| clsx | MIT |  | @Animatica/editor |
| hardhat | MIT |  | @Animatica/contracts (Dev) |
| immer | MIT |  | @Animatica/engine |
| jsdom | MIT |  | @Animatica/editor (Dev), @Animatica/engine (Dev), @Animatica/web (Dev) |
| lucide-react | ISC | ⚠️ Non-MIT (Compatible) | @Animatica/editor, @Animatica/web |
| next | MIT |  | @Animatica/web |
| react | MIT |  | @Animatica/editor (Peer), @Animatica/engine (Peer), @Animatica/platform (Peer), @Animatica/web |
| react-dom | MIT |  | @Animatica/editor (Peer), @Animatica/engine (Peer), @Animatica/platform (Peer), @Animatica/web |
| tailwind-merge | MIT |  | @Animatica/editor |
| tailwindcss | MIT |  | @Animatica/editor (Dev) |
| three | MIT |  | @Animatica/editor (Dev), @Animatica/engine (Peer), @Animatica/web |
| tone | MIT |  | @Animatica/engine |
| turbo | MIT |  | Root (Dev) |
| typescript | Apache-2.0 | ⚠️ Non-MIT (Compatible) | Root (Dev), @Animatica/contracts (Dev), @Animatica/editor (Dev), @Animatica/engine (Dev), @Animatica/platform (Dev), @Animatica/web (Dev) |
| uuid | MIT |  | @Animatica/engine |
| vite | MIT |  | @Animatica/editor (Dev), @Animatica/engine (Dev), @Animatica/platform (Dev) |
| vitest | MIT |  | @Animatica/editor (Dev), @Animatica/engine (Dev), @Animatica/platform (Dev), @Animatica/web (Dev) |
| zod | MIT |  | @Animatica/engine |
| zundo | MIT |  | @Animatica/engine |
| zustand | MIT |  | @Animatica/engine |

## Flagged Licenses (Non-MIT/Apache-2.0)

- **`lucide-react`**: ISC. Permissive, compatible with MIT.
- **`typescript`**: Apache-2.0. Permissive, compatible with MIT.
- **`web3-utils`**: LGPL-3.0. Found as a transitive dependency of `@nomicfoundation/hardhat-toolbox`. This is a development tool for contracts and is not bundled in the client application. **Status: Safe (Dev Only)**.

## Missing Licenses

- None found.
