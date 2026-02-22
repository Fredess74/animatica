# Roadmap

## 10-Phase Development Plan

Each phase has clear deliverables and can be validated independently.

---

## Phase 1: Engine Core (Weeks 1-4)

**Goal:** Render 3D scenes with animated primitives and cameras.

| Task | Owner | Deliverable |
|------|-------|-------------|
| TypeScript interfaces | Jules | `types/index.ts` compiled |
| Zod schemas | Jules | Valid/invalid JSON test passing |
| Easing functions | Jules | Unit tests at key t-values |
| Keyframe engine | Jules | Interpolation tests passing |
| Zustand store | Jules | State mutation tests passing |
| Primitive renderer | Jules | Box/sphere visible in viewport |
| Light renderer | Jules | Scene has lighting |
| Camera renderer | Jules | Camera frustum visible |
| Scene Manager | Jules | Full scene renders from store |
| Playback controller | Jules | Play/pause/seek working |

**Milestone:** Open browser → see animated 3D scene with primitives, lights, and camera.

---

## Phase 2: Characters (Weeks 5-6)

**Goal:** Load and animate humanoid characters with expressions and clothing.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Humanoid GLB loader | Jules | ReadyPlayerMe model renders |
| Bone controller | Jules | Limb rotation from bodyPose |
| Morph targets | Jules | Facial expressions active |
| Clothing system | Jules | Procedural clothing on character |

**Milestone:** Character walks, has clothes, blinks, and smiles.

---

## Phase 3: Editor UI (Weeks 5-8)

**Goal:** Full editor interface with panels for creating animated scenes.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Editor layout (3-panel) | Jules | Dark theme, responsive panels |
| Asset Library panel | Jules | Click to add actors |
| Properties Panel | Jules | Transform, material, character controls |
| Timeline Panel | Jules | Playhead, keyframes, tracks |
| Script Console | Jules | JSON paste → validate → build |
| Export Modal | Jules | Resolution/FPS/format picker |
| AI Prompt copy button | Jules | One-click prompt copy |

**Milestone:** Non-technical user can add actors, pose them, keyframe, and play back.

---

## Phase 4: Export & Audio (Weeks 9-10)

**Goal:** Export MP4 video with spatial audio.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Video exporter (WebCodecs) | Jules | MP4 export at 1080p |
| Audio engine | Jules | Spatial sound from speakers |
| Full app assembly | Jules | Next.js app, `/create` route |

**Milestone:** Create scene → export 1080p MP4 → play in VLC.

---

## Phase 5: AI Integration (Weeks 11-14)

**Goal:** Type a description → get a complete animated scene.

| Task | Owner | Deliverable |
|------|-------|-------------|
| AI prompt template | Jules | Full schema in prompt, copy button |
| Backend API route | Jules | `POST /api/generate-scene` |
| Style presets (buttons) | Jules | Noir, comedy, anime, etc. |
| Scene editing via AI | Jules | "Move camera closer" → JSON patch |
| TTS integration | Jules/Human | Character voices via API |
| Lip-sync (basic) | Jules | Viseme-to-morph mapping |

**Milestone:** Type "A cowboy enters a saloon" → see complete animated scene.

---

## Phase 6: Platform (Weeks 15-20)

**Goal:** Social platform for publishing and discovering animated content.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Auth (email + OAuth + wallet) | Jules | Login/register working |
| Creator profiles | Jules | Avatar, bio, filmography |
| Video upload + hosting | Jules | R2 storage + Cloudflare Stream |
| Feed (discovery) | Jules | Browse latest/popular films |
| Watch page | Jules | Video player + metadata |
| Series/episodes | Jules | Ordered content structure |
| Comments (threaded) | Jules | Post/reply/delete |
| Likes | Jules | Like/unlike toggle |
| Search | Jules | Full-text + category filters |
| Content ratings | Jules | Self-rating system |
| Embed player | Jules | iframe embed code |

**Milestone:** Publish a film → share link → anyone can watch and interact.

---

## Phase 7: Asset Marketplace (Weeks 21-24)

**Goal:** Creators buy, sell, and earn royalties on custom assets.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Asset upload + validation | Jules | GLB/FBX validation, preview generation |
| Marketplace browse/search | Jules | Category filters, ratings |
| One-time purchase flow | Jules | Pay → download → use in editor |
| Rental model | Jules | Time-limited access |
| Royalty tracking | Jules | Per-view earnings for asset creators |
| Creator storefront | Jules | Profile page with listed assets |

**Milestone:** Upload a 3D model → another creator buys it → use in their film.

---

## Phase 8: Crypto Monetization (Weeks 25-28)

**Goal:** Transparent donation pool with automatic revenue splitting.

| Task | Owner | Deliverable |
|------|-------|-------------|
| DonationPool.sol | Jules | Deploy + test on testnet |
| CreatorFund.sol | Jules | Weight updates + claim |
| FredessTreasury.sol | Jules | Withdrawal by owner |
| AssetMarketplace.sol | Jules | On-chain asset purchases |
| Wallet connect (wagmi) | Jules | RainbowKit modal in app |
| Donate button | Jules | One-click donation flow |
| Fiat on-ramp (Stripe) | Human | Credit card → donation |
| Earnings dashboard | Jules | Real-time balance, claim button |

**Milestone:** Donate $1 to a film → see 70¢ in creator wallet instantly.

---

## Phase 9: Collaboration (Weeks 29-32)

**Goal:** Real-time multi-user editing with roles.

| Task | Owner | Deliverable |
|------|-------|-------------|
| Yjs integration | Jules | CRDT sync for project state |
| Multi-cursor presence | Jules | See other users' selections |
| Role-based editor modes | Jules | Director/Writer/Animator views |
| Team management | Jules | Invite, assign roles, set splits |
| Conflict resolution UI | Jules | "User A also edited this" |

**Milestone:** Two users edit same scene simultaneously without conflicts.

---

## Phase 10: 2D Mode + Polish (Weeks 33-40)

**Goal:** Full 2D animation capability and production-ready polish.

| Task | Owner | Deliverable |
|------|-------|-------------|
| PixiJS integration | Jules | 2D rendering pipeline |
| 2D character system | Jules | Spine/spritesheet characters |
| Mode switch (2D/3D) | Jules | Toggle in editor |
| Physics (Rapier) | Jules | Gravity + collisions |
| Particle effects | Jules | Fire, smoke, magic |
| Post-processing | Jules | Bloom, vignette, DOF |
| Gamification | Jules | Achievements, creation streaks |
| Onboarding tutorial | Jules | Interactive first-run guide |
| i18n | Jules | Multi-language support |
| Performance optimization | Jules | Bundle splitting, lazy loading |
| Mobile responsive | Jules | Touch-friendly on tablets |

**Milestone:** Production-ready platform — create 2D/3D films, publish, earn money.

---

## Timeline Summary

```
Weeks 1-4:   Phase 1 (Engine Core)
Weeks 5-8:   Phase 2+3 (Characters + Editor) — parallel
Weeks 9-10:  Phase 4 (Export & Audio)
Weeks 11-14: Phase 5 (AI Integration)
Weeks 15-20: Phase 6 (Platform)
Weeks 21-24: Phase 7 (Marketplace)
Weeks 25-28: Phase 8 (Crypto)
Weeks 29-32: Phase 9 (Collaboration)
Weeks 33-40: Phase 10 (2D + Polish)
```

**Total: ~40 weeks (10 months) with Jules as primary developer.**
