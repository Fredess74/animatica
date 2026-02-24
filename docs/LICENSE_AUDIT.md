# License Audit

**Date:** 2026-02-24
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

| Dependency | License | Flag | Used In |
| --- | --- | --- | --- |
| @nomicfoundation/hardhat-toolbox | MIT |  | @Animatica/contracts |
| @openzeppelin/contracts | MIT |  | @Animatica/contracts |
| @react-three/drei | MIT |  | @Animatica/engine |
| @react-three/fiber | MIT |  | @Animatica/editor, @Animatica/engine, @Animatica/web |
| @tailwindcss/postcss | MIT |  | @Animatica/editor |
| @testing-library/dom | MIT |  | @Animatica/web |
| @testing-library/react | MIT |  | @Animatica/editor, @Animatica/engine, @Animatica/web |
| @types/node | MIT |  | @Animatica/engine |
| @types/react | MIT |  | @Animatica/editor, @Animatica/engine, @Animatica/platform, @Animatica/web |
| @types/react-dom | MIT |  | @Animatica/editor, @Animatica/platform, @Animatica/web |
| @types/three | MIT |  | @Animatica/engine |
| @types/uuid | MIT |  | @Animatica/engine |
| @vitejs/plugin-react | MIT |  | @Animatica/editor |
| clsx | MIT |  | @Animatica/editor |
| hardhat | MIT |  | @Animatica/contracts |
| immer | MIT |  | @Animatica/engine |
| jsdom | MIT |  | @Animatica/editor, @Animatica/engine, @Animatica/web |
| lucide-react | ISC | ⚠️ Non-MIT | @Animatica/editor, @Animatica/web |
| next | MIT |  | @Animatica/web |
| react | MIT |  | @Animatica/editor, @Animatica/engine, @Animatica/platform, @Animatica/web |
| react-dom | MIT |  | @Animatica/editor, @Animatica/engine, @Animatica/platform, @Animatica/web |
| tailwind-merge | MIT |  | @Animatica/editor |
| tailwindcss | MIT |  | @Animatica/editor |
| three | MIT |  | @Animatica/editor, @Animatica/engine, @Animatica/web |
| tone | MIT |  | @Animatica/engine |
| turbo | MIT |  | Animatica |
| typescript | Apache-2.0 | ⚠️ Non-MIT | @Animatica/contracts, @Animatica/editor, @Animatica/engine, @Animatica/platform, @Animatica/web, Animatica |
| uuid | MIT |  | @Animatica/engine |
| vite | MIT |  | @Animatica/editor, @Animatica/engine, @Animatica/platform |
| vitest | MIT |  | @Animatica/editor, @Animatica/engine, @Animatica/platform, @Animatica/web |
| zod | MIT |  | @Animatica/engine |
| zundo | MIT |  | @Animatica/engine |
| zustand | MIT |  | @Animatica/engine |


## Flagged Licenses (Non-MIT/Apache-2.0)

- **`lucide-react`**: ISC
- **`typescript`**: Apache-2.0

## Missing Licenses

- None found.
