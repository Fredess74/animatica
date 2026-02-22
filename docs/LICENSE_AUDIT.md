# License Audit

**Date:** 2025-05-18
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
- **Note:** Other packages (`packages/editor`, `apps/web`) appear to have minimal source files at this stage.

## Dependency Licenses

The following dependencies were audited:

| Package | License |
| :--- | :--- |
| `turbo` | MPL-2.0 |
| `typescript` | Apache-2.0 |
| `@nomicfoundation/hardhat-toolbox` | MIT |
| `@openzeppelin/contracts` | MIT |
| `hardhat` | MIT |
| `react` | MIT |
| `react-dom` | MIT |
| `@types/react` | MIT |
| `@types/react-dom` | MIT |
| `vite` | MIT |
| `vitest` | MIT |
| `@react-three/drei` | MIT |
| `@react-three/fiber` | MIT |
| `immer` | MIT |
| `three` | MIT |
| `tone` | MIT |
| `uuid` | MIT |
| `zod` | MIT |
| `zustand` | MIT |
| `@types/three` | MIT |
| `@types/uuid` | MIT |
| `lucide-react` | ISC |
| `clsx` | MIT |
| `tailwind-merge` | MIT |
| `@tailwindcss/postcss` | MIT |
| `@vitejs/plugin-react` | MIT |
| `tailwindcss` | MIT |
| `next` | MIT |

## Flagged Licenses (Non-MIT/Apache-2.0)

- **`turbo`**: MPL-2.0 (Mozilla Public License 2.0).
- **`lucide-react`**: ISC (Generally compatible with MIT/Apache, but flagged for review as requested).

## Missing Licenses

- None found.
