# Architecture

## Overview

Animatica is a **Turborepo monorepo** with 4 packages and 1 app. Each package has strict boundaries and communicates through published interfaces only.

```
Animatica/
├── package.json              # Root workspace config
├── turbo.json                # Build pipeline
├── tsconfig.base.json        # Shared TS config
│
├── packages/
│   ├── engine/               # 🎮 Animation engine (Three.js + future PixiJS)
│   ├── editor/               # 🖥️ Editor UI (React components)
│   ├── platform/             # 🌐 Social platform (feeds, profiles, video)
│   └── contracts/            # 💰 Solidity smart contracts
│
├── apps/
│   └── web/                  # Next.js app (combines all packages)
│
└── docs/                     # Documentation
```

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Runtime** | Node.js 20+ | LTS, stable |
| **Framework** | Next.js 15 (App Router) | SSR, API routes, edge functions |
| **UI** | React 19 + TypeScript 5.9 | Strict mode, concurrent features |
| **3D Engine** | Three.js 0.182 + React Three Fiber 9 | Mature, huge ecosystem |
| **2D Engine** | PixiJS 8 (Phase 3) | Best browser 2D renderer |
| **State** | Zustand 5 + Immer | Immutable, sliced, testable |
| **Validation** | Zod 4 | Runtime type safety for JSON |
| **Styling** | Tailwind CSS v4 | Utility-first, consistent |
| **Build** | Vite 7 + Turborepo | Fast builds, monorepo caching |
| **Testing** | Vitest 4 | Fast, Vite-native |
| **Collab** | Yjs + y-websocket | CRDT-based real-time sync |
| **Auth** | NextAuth.js 5 | Email + OAuth + wallet |
| **Database** | PostgreSQL (Supabase) | Managed, real-time subscriptions |
| **Storage** | Cloudflare R2 | S3-compatible, no egress fees |
| **CDN/Video** | Cloudflare Stream or Mux | Adaptive bitrate, global CDN |
| **Hosting** | Vercel | Next.js-native, edge functions |
| **CI/CD** | GitHub Actions | PR checks, deploy previews |
| **Blockchain** | Base (Coinbase L2) or Avalanche C-Chain | Low gas, EVM-compatible |
| **Wallet** | wagmi 2 + RainbowKit | Best-in-class wallet UX |
| **Fiat** | Stripe + MoonPay | Cards + crypto on-ramp |

---

## Package Details

### `@Animatica/engine`

The core animation engine. **No UI components** — only 3D/2D rendering, animation logic, and data structures.

```
packages/engine/src/
├── index.ts                    # Public API (re-exports)
├── types/
│   └── index.ts                # All TypeScript interfaces
├── store/
│   ├── useEngineStore.ts       # Main Zustand store
│   ├── types.ts                # Store state shape
│   └── slices/
│       ├── actorsSlice.ts      # Actor CRUD
│       ├── timelineSlice.ts    # Keyframes, tracks
│       ├── environmentSlice.ts # Weather, fog, lighting
│       └── playbackSlice.ts    # Play/pause/seek
├── scene/
│   ├── SceneManager.tsx        # Root scene graph
│   ├── SceneObject.tsx         # Actor → renderer dispatcher
│   └── renderers/
│       ├── PrimitiveRenderer.tsx
│       ├── CharacterRenderer.tsx
│       ├── LightRenderer.tsx
│       └── CameraRenderer.tsx
├── animation/
│   ├── PlaybackController.tsx  # requestAnimationFrame loop
│   ├── KeyframeEngine.ts       # Interpolation logic
│   └── EasingFunctions.ts      # easeIn/Out/InOut/step
├── characters/
│   ├── Humanoid.tsx            # GLB-based character
│   ├── BoneController.ts       # Per-bone rotation
│   ├── MorphTargets.ts         # Facial expressions
│   └── ClothingSystem.ts       # Procedural clothing
├── physics/
│   └── PhysicsEngine.ts        # Basic gravity + collisions (Rapier)
├── effects/
│   ├── WeatherEffects.tsx      # Rain, snow, dust
│   ├── ParticleSystem.tsx      # Fire, smoke, magic
│   └── PostProcessing.tsx      # Bloom, vignette, DOF
├── audio/
│   └── AudioEngine.tsx         # Tone.js spatial audio
├── export/
│   └── VideoExporter.tsx       # WebCodecs → MP4
├── importer/
│   ├── scriptImporter.ts       # JSON → project state
│   ├── aiPromptTemplate.ts     # Static prompt for LLM
│   └── schemas/
│       ├── project.ts
│       ├── actor.ts
│       ├── character.ts
│       ├── timeline.ts
│       ├── environment.ts
│       └── common.ts
└── assets/
    └── assetLoader.ts          # GLB/FBX/image loader
```

**Public API:**

```typescript
// Components (for R3F Canvas)
export { SceneManager } from './scene/SceneManager'
export { PlaybackController } from './animation/PlaybackController'
export { AudioEngine } from './audio/AudioEngine'
export { VideoExporter } from './export/VideoExporter'

// Store
export { useEngineStore } from './store/useEngineStore'

// Utils
export { importScript, validateScript } from './importer/scriptImporter'
export { getAiPrompt } from './importer/aiPromptTemplate'
export { ProjectSchema } from './importer/schemas/project'

// Types
export type * from './types'
```

### `@Animatica/editor`

UI panels and modals. **Only imports from `@Animatica/engine` public API.** No direct Three.js usage.

```
packages/editor/src/
├── index.ts
├── layouts/
│   └── EditorLayout.tsx          # 3-panel layout shell
├── panels/
│   ├── AssetLibrary.tsx          # Left: add actors/props
│   ├── PropertiesPanel.tsx       # Right: transform, materials
│   ├── TimelinePanel.tsx         # Bottom: keyframes + tracks
│   ├── ViewportPanel.tsx         # Center: Canvas wrapper
│   └── CollaboratorsPanel.tsx    # Floating: who's editing
├── modals/
│   ├── ScriptConsole.tsx         # JSON import + AI prompt
│   ├── ExportModal.tsx           # Export settings
│   └── AssetBrowser.tsx          # Browse marketplace assets
├── toolbar/
│   ├── ModeSelector.tsx          # Director/Writer/Animator mode
│   ├── ViewToggle.tsx            # Editor/Camera/Preview view
│   └── Header.tsx                # Top bar
├── shared/
│   ├── Button.tsx
│   ├── Slider.tsx
│   ├── ColorPicker.tsx
│   ├── Tooltip.tsx
│   └── ErrorBoundary.tsx
└── hooks/
    ├── useKeyboardShortcuts.ts
    └── useCollaboration.ts       # Yjs integration
```

### `@Animatica/platform`

Social platform — **standalone package** with its own API layer. Does NOT import engine.

```
packages/platform/src/
├── pages/
│   ├── Feed.tsx                  # Discovery feed
│   ├── Profile.tsx               # Creator profile
│   ├── Watch.tsx                 # Video player page
│   ├── Series.tsx                # Series/episode viewer
│   └── Marketplace.tsx           # Asset marketplace
├── components/
│   ├── VideoCard.tsx
│   ├── DonateButton.tsx
│   ├── CreatorBadge.tsx
│   ├── CommentThread.tsx
│   ├── AssetCard.tsx
│   └── EarningsDashboard.tsx
└── api/
    ├── videos.ts                 # Video CRUD
    ├── users.ts                  # User/profile API
    ├── donations.ts              # Donation API
    ├── marketplace.ts            # Asset marketplace API
    └── analytics.ts              # Views, retention, etc.
```

### `@Animatica/contracts`

Solidity smart contracts with Hardhat.

```
packages/contracts/
├── contracts/
│   ├── DonationPool.sol          # 70/20/10 split
│   ├── CreatorFund.sol           # Weight-based distribution
│   ├── AnimaticaTreasury.sol       # Platform treasury
│   ├── AssetMarketplace.sol      # Buy/sell/rent assets
│   └── FilmRegistry.sol          # On-chain film metadata
├── test/
│   ├── DonationPool.test.ts
│   ├── CreatorFund.test.ts
│   └── AssetMarketplace.test.ts
├── scripts/
│   └── deploy.ts
└── hardhat.config.ts
```

---

## Dependency Graph

```
@Animatica/contracts  (standalone — no JS dependencies)
        ↑
        │ (ABI imports only)
        │
@Animatica/engine  ←── @Animatica/editor
        ↑                    ↑
        │                    │
        └────── apps/web ────┘
                    ↑
                    │
            @Animatica/platform
```

**Rules:**

- `engine` imports NOTHING from other packages
- `editor` imports ONLY from `engine`
- `platform` imports NOTHING from engine/editor (communicates via API)
- `apps/web` imports from all packages to compose the full app
- `contracts` is standalone (Solidity + Hardhat)

---

## Configuration

### TypeScript (strict)

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### ESLint Rules

- `no-explicit-any`: error
- `no-unused-vars`: error
- `react-hooks/exhaustive-deps`: warn
- `@typescript-eslint/strict-boolean-expressions`: error
- Max file length: 200 LOC (warning at 150)
- Named exports only (no `export default`)
