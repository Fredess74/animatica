# License Audit Report

**Date:** 2026-02-23
**Auditor:** license-auditor

## Summary

All production dependencies in `@Animatica` packages (`engine`, `editor`, `web`, `platform`) are licensed under **MIT**, **ISC**, **BSD**, or **Apache-2.0**, which are fully compatible with the project's licensing strategy.

No restricted copy-left licenses (GPL, AGPL) were found in the production bundle.

## Findings

| Package | License | Usage | Status |
| :--- | :--- | :--- | :--- |
| `web3-utils` | LGPL-3.0 | Dev Dependency (`@Animatica/contracts`) | ✅ **Compatible** (Not bundled in production) |
| `@img/sharp-libvips` | LGPL-3.0 | Server Dependency (`next` optimization) | ✅ **Compatible** (Server-side/Dev only) |
| `caniuse-lite` | CC-BY-4.0 | Build Dependency (`browserslist`) | ✅ **Compatible** (Data/Build tool) |

## Policy

- **Allowed:** MIT, ISC, BSD-2-Clause, BSD-3-Clause, Apache-2.0, CC0.
- **Restricted:** LGPL (Allowed for libraries if dynamically linked or dev-only).
- **Forbidden:** GPL, AGPL (Strictly forbidden in production bundles).

## Next Audit

Scheduled for next major release or new dependency addition.
