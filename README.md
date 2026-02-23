# 🎬 Animatica — The Animation Platform for Everyone

> **Create. Animate. Earn.** — A web-based platform where anyone can turn ideas into animated films and get paid globally via crypto.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Node](https://img.shields.io/badge/Node-20%2B-green.svg)](package.json)
[![pnpm](https://img.shields.io/badge/pnpm-10.28.0-orange.svg)](package.json)

---

## What is Animatica?

Animatica is an open-source platform that democratizes animation. People write fanfiction even though they don't read books — the same revolution is coming to video. Animatica gives everyone the power to:

1. **Create** — Turn text into 2D/3D animated scenes using AI and an intuitive editor
2. **Collaborate** — Work together in real-time with roles: Director, Writer, Animator, Producer
3. **Publish** — Upload films, series, shorts to a built-in social platform
4. **Earn** — Get paid through a transparent donation pool powered by smart contracts

## Key Features

| Feature | Description |
|---------|------------|
| 🎮 **3D/2D Animation Engine** | Browser-based engine with Three.js (3D) and PixiJS (2D) — PBR, cel-shading, pixel art |
| 🤖 **AI Scene Generation** | Describe your scene in text → AI generates complete animated scenes using JSON-based prompts |
| 🎭 **Character System** | Humanoid characters with skeletal animation, facial expressions, clothing, IK |
| 📹 **Camera & Timeline** | Professional keyframe animation, multi-camera system, easing curves |
| 🌍 **Environment Builder** | Create any environment — cities, forests, space, interiors |
| 🛠️ **Visual Editor** | Comprehensive editor with Asset Library, Properties Panel, and Timeline |
| ⚡ **State Management** | High-performance state syncing using Zustand and Immer |
| 🎵 **Audio** | TTS voice acting, AI music, spatial SFX, lip-sync |
| 🤝 **Real-time Collaboration** | Google Docs-style sync with role-based permissions |
| 🏪 **Asset Marketplace** | Buy, sell, or rent 3D/2D assets — earn royalties per view |
| 💰 **Crypto Monetization** | Donation pool → 70% creator, 20% creator fund, 10% platform |
| 🌐 **Global Payments** | Any currency (crypto + fiat), anyone, anywhere |

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | [Next.js 15](https://nextjs.org/), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/) |
| **3D Engine** | [Three.js](https://threejs.org/), [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/), [Drei](https://github.com/pmndrs/drei) |
| **State** | [Zustand](https://github.com/pmndrs/zustand), [Immer](https://immerjs.github.io/immer/), [Zod](https://zod.dev/) |
| **Build** | [Vite](https://vitejs.dev/), [Turbo](https://turbo.build/), [pnpm](https://pnpm.io/) |
| **Backend** | [Supabase](https://supabase.com/) (PostgreSQL), [Node.js](https://nodejs.org/) |

## Architecture

```
Animatica/
├── packages/
│   ├── engine/       # 🎮 Core animation engine (Three.js + PixiJS)
│   ├── editor/       # 🖥️ Editor UI (React)
│   ├── platform/     # 🌐 Social platform (feeds, profiles, streaming)
│   └── contracts/    # 💰 Smart contracts (Solidity)
├── apps/
│   └── web/          # Next.js app (combines everything)
└── docs/             # 📄 Full documentation
```

> See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the complete technical specification.

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_ORG/Animatica.git
cd Animatica

# Install (using pnpm)
pnpm install

# Run editor (isolated workspace)
pnpm --filter @Animatica/editor dev

# Run full app
pnpm dev
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
