# 🎬 Animatica — The Animation Platform for Everyone

> **Create. Animate. Earn.** — A web-based platform where anyone can turn ideas into animated films and get paid globally via crypto.

[![CI](https://github.com/YOUR_ORG/Animatica/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_ORG/Animatica/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## What is Animatica?

Animatica is an open-source platform that democratizes animation. People write fanfiction even though they don't read books — the same revolution is coming to video. Animatica gives everyone the power to:

1. **Create** — Turn text into 2D/3D animated scenes using AI and an intuitive editor
2. **Collaborate** — Work together in real-time with roles: Director, Writer, Animator, Producer
3. **Publish** — Upload films, series, shorts to a built-in social platform
4. **Earn** — Get paid through a transparent donation pool powered by smart contracts

## Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Core** | [Turbo](https://turbo.build/) | High-performance monorepo build system |
| | [pnpm](https://pnpm.io/) | Fast, disk-efficient package manager |
| **Frontend** | [Next.js 15](https://nextjs.org/) | React framework with App Router |
| | [React 19](https://react.dev/) | UI library with Concurrent Mode |
| | [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| **Engine** | [Three.js](https://threejs.org/) | 3D library (via [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)) |
| | [Zustand](https://github.com/pmndrs/zustand) | State management with [Immer](https://github.com/immerjs/immer) |
| | [Zundo](https://github.com/charkour/zundo) | Undo/Redo middleware |
| **Validation** | [Zod](https://zod.dev/) | TypeScript-first schema validation |
| **Testing** | [Vitest](https://vitest.dev/) | Blazing fast unit test framework |
| | [Playwright](https://playwright.dev/) | End-to-end testing |

## Key Features

### Core Engine (In Progress)
- 🎮 **3D Animation Engine**: Browser-based engine built on Three.js and React Three Fiber.
- 🎭 **Character System**: Humanoid characters with skeletal animation and IK.
- 📹 **Camera & Timeline**: Professional keyframe animation with easing curves.
- 🌍 **Environment Builder**: Dynamic environments with lighting and weather controls.
- 📜 **Script Importer**: JSON-based scene description format.

### Platform (Roadmap)
- 🤖 **AI Scene Generation**: Text-to-scene generation pipeline.
- 🤝 **Real-time Collaboration**: Multi-user editing with role-based permissions.
- 💰 **Crypto Monetization**: Smart contracts for creator payouts and royalties.
- 🏪 **Asset Marketplace**: Buy, sell, and rent digital assets.

## Architecture

```
Animatica/
├── packages/
│   ├── engine/       # 🎮 Core animation engine (Three.js + R3F + Zustand)
│   ├── editor/       # 🖥️ Editor UI components (React)
│   ├── platform/     # 🌐 Shared platform types and utilities
│   └── contracts/    # 💰 Smart contracts (Solidity)
├── apps/
│   └── web/          # 🌍 Next.js app (combines engine + editor + platform)
└── docs/             # 📄 Full documentation
```

> See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the complete technical specification.

## Quick Start

Prerequisites: Node.js 20+ and [pnpm](https://pnpm.io/).

```bash
# Clone
git clone https://github.com/YOUR_ORG/Animatica.git
cd Animatica

# Install dependencies (frozen lockfile)
pnpm install

# Run development server (starts all apps)
pnpm run dev

# Run tests
pnpm run test

# Typecheck
pnpm run typecheck
```

## Documentation

| Document | Description |
|----------|------------|
| [Product Vision](docs/PRODUCT_VISION.md) | Philosophy, target audience, Kano analysis |
| [Architecture](docs/ARCHITECTURE.md) | Monorepo structure, module interfaces, data models |
| [AI Pipeline](docs/AI_PIPELINE.md) | Text-to-animation workflow (Phase A & B) |
| [Roles & Collaboration](docs/ROLES_AND_COLLABORATION.md) | Creator roles, editor modes, real-time sync |
| [Asset Marketplace](docs/ASSET_MARKETPLACE.md) | Buy/sell/rent assets, royalty model |
| [Monetization](docs/MONETIZATION.md) | Donation pool, creator fund, fiat on-ramp |
| [Smart Contracts](docs/SMART_CONTRACTS.md) | Solidity contracts specification |
| [Data Models](docs/DATA_MODELS.md) | TypeScript interfaces, DB schema |
| [Branding](docs/BRANDING.md) | Brand identity, naming, visual identity |
| [Roadmap](docs/ROADMAP.md) | 10-phase development plan |
| [Jules Guide](docs/JULES_GUIDE.md) | AI agent instructions, PR rules, task sequence |

## For Jules (AI Coding Agent)

> **Start here:** [docs/JULES_GUIDE.md](docs/JULES_GUIDE.md)

This project is designed for [Jules](https://github.com/features/jules) (Google's AI coding agent). Every module is a self-contained task with clear interfaces, no cross-package dependencies, and strict coding rules.

**Rules:**

1. One package per PR — never edit `engine` and `editor` in the same PR
2. Types first — write interfaces before implementation
3. Tests required — every PR must include tests
4. Max 200 LOC per file — split if longer
5. Named exports only — no `export default`

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — See [LICENSE](LICENSE) for details.
