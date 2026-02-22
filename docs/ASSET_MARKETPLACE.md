# Asset Marketplace

## Overview

Creators can upload, sell, rent, and share custom assets. Assets are 3D models, 2D sprites, environments, props, characters, sound packs, and animation clips.

---

## Asset Types

| Category | Formats | Examples |
|----------|---------|---------|
| **Characters** | GLB, FBX, VRM | Humanoid, animal, robot, fantasy creature |
| **Props** | GLB, FBX | Furniture, weapons, vehicles, food |
| **Environments** | GLB + HDRI | City, forest, space station, medieval castle |
| **2D Sprites** | PNG, SVG, Spine | Anime characters, UI elements |
| **Animation Clips** | JSON (keyframe data) | Walk cycles, fight sequences, dances |
| **Sound Packs** | MP3, WAV, OGG | Ambient, SFX, music loops |
| **Templates** | Full project JSON | Complete scene templates (e.g., "chase scene") |

---

## Pricing Models

| Model | Description | Revenue Split |
|-------|------------|--------------|
| **Free** | Anyone can use, creator gets attribution | Free |
| **One-time Purchase** | Buy once, use forever | 90% creator / 10% platform |
| **Rental** | Pay per project, time-limited | 90% creator / 10% platform |
| **Royalty per View** | Free to use, creator earns X% of donations on videos using asset | Negotiable (1-10% of film donations) |
| **Bundle** | Pack of assets at discounted price | 90% creator / 10% platform |

### Royalty-per-View Example

Artist uploads a detailed castle environment (free to use, 3% royalty):

- Film using this castle gets 100 donations totaling $1000
- Normal split: $700 to film creators, $200 to fund, $100 to platform
- Asset royalty: $700 × 3% = $21 goes to castle creator (deducted from film creator's share)

---

## Asset Listing

### Upload Flow

1. Creator uploads asset file(s)
2. Automatic validation (file size, format, polygon count)
3. Auto-generate preview renders (turntable for 3D, thumbnail for 2D)
4. Creator sets: name, description, category, tags, pricing
5. Review queue (automated + community flagging)
6. Published to marketplace

### Listing Page

- Preview renders / turntable viewer
- Description, tags, category
- Price / pricing model
- Reviews and ratings (1-5 stars)
- Usage count ("Used in 342 films")
- Creator info + link to profile
- "Add to Project" button
- License terms

### Search & Discovery

- Full-text search with filters (category, price range, rating, polygon count)
- Trending assets (most used this week)
- Staff picks / curated collections
- "Similar assets" recommendations
- Creator storefronts (browse all assets by one creator)

---

## Technical Requirements

### 3D Assets

| Requirement | Limit |
|-------------|-------|
| Max file size | 50 MB |
| Max polygon count | 500,000 (soft limit, warning shown) |
| Required format | GLB (preferred), FBX (auto-converted) |
| Texture resolution | Up to 4K |
| Required | At least one preview image |

### 2D Assets

| Requirement | Limit |
|-------------|-------|
| Max file size | 10 MB |
| Formats | PNG, SVG, Spine JSON |
| Resolution | Up to 4K |

### Asset Smart Contract

```solidity
contract AssetMarketplace {
    struct Asset {
        uint256 id;
        address creator;
        uint256 price;          // 0 = free
        uint256 royaltyBps;     // basis points (100 = 1%)
        bool isActive;
    }

    function purchase(uint256 assetId) external payable;
    function claimRoyalties(uint256 assetId) external;
}
```

---

## Quality Control

- **Automated:** File validation, virus scan, polygon count check
- **Community:** Users can flag low-quality, broken, or stolen assets
- **Moderation:** Platform team reviews flagged assets
- **Reputation:** Creators build trust score based on ratings, sales, and community feedback
