# Monetization

## Overview

Animatica uses a **transparent donation pool** model. Viewers donate to films they love. Donations are split automatically by smart contracts. No subscriptions, no ads, no paywall.

---

## Revenue Flow

```
Viewer donates $10 to a film
        │
        ▼
┌─────────────────────┐
│   DonationPool.sol  │
└─────────────────────┘
        │
        ├──── 70% ($7.00) → Film Creator(s)
        │         └── Split by role weights if multiple creators
        │
        ├──── 20% ($2.00) → Creator Fund
        │         └── Distributed to ALL active creators by weight
        │
        └──── 10% ($1.00) → Platform Treasury
                  └── Operations, hosting, development
```

---

## Donation Pool Rules

| Rule | Value |
|------|-------|
| Minimum donation | $0.01 (or equivalent) |
| Accepted currencies | ETH, USDC, USDT, DAI, AVAX + fiat (credit card) |
| Fiat on-ramp | MoonPay + Stripe |
| Split ratio | 70% creator / 20% fund / 10% platform |
| Split execution | Instant on-chain (every donation triggers split) |
| Multi-creator films | 70% is further split by role weights set at publish time |

### Multi-Creator Split Example

A film has 3 creators:

- Director (50% weight)
- Writer (30% weight)
- Animator (20% weight)

On a $10 donation:

- Director gets: $7.00 × 50% = $3.50
- Writer gets: $7.00 × 30% = $2.10
- Animator gets: $7.00 × 20% = $1.40
- Creator Fund: $2.00
- Platform: $1.00

---

## Creator Fund

The Creator Fund receives 20% of all platform donations and redistributes to **all active creators** proportionally.

### Weight Calculation

```
creatorWeight = (totalContentMinutes × 1.0)
              + (totalViews × 0.001)
              + (totalDonationsReceived × 0.01)
              + (averageRetentionRate × 10.0)
              + (monthlyActiveStatus × 5.0)
```

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Content minutes | ×1.0 | Reward prolific creators |
| Total views | ×0.001 | Reward popular creators |
| Donations received | ×0.01 | Reward quality (viewers pay for quality) |
| Avg retention rate | ×10.0 | Reward engaging content |
| Monthly activity | ×5.0 | Reward consistent creators |

### Claim Process

- Creators can `claim()` their share at any time
- Minimum claim: $1.00 equivalent
- Claims are on-chain transactions
- Dashboard shows accrued balance in real-time

---

## Asset Marketplace Monetization

Creators can sell or rent their custom assets (3D models, 2D sprites, environments, props).

| Model | How It Works |
|-------|-------------|
| **One-time purchase** | Buyer pays fixed price → seller gets 90%, platform gets 10% |
| **Rental** | Buyer pays per project → same split |
| **Royalty per view** | Asset creator gets X% of donations on videos using their asset |
| **Free (attribution)** | Free to use, creator gets credit in film metadata |

---

## Fiat On-Ramp

For users without crypto wallets:

1. **Stripe** — Credit/debit card → platform converts to on-chain donation
2. **MoonPay** — Direct crypto purchase in-app
3. **Platform holds conversion** — User pays in USD, platform batches on-chain transactions

### Viewer Experience (no crypto knowledge required)

```
1. Click "Donate" on a film
2. Choose amount ($1, $5, $10, custom)
3. Pay with credit card (Stripe) or crypto wallet
4. Receipt shows split breakdown
5. Creator receives instant notification
```

---

## Earnings Dashboard

Every creator has a real-time dashboard showing:

- Total earned (all-time / this month / this week)
- Breakdown by source:
  - Direct donations
  - Creator Fund distributions
  - Asset marketplace sales
  - Asset royalties
- Per-film analytics:
  - Views, retention, donation rate
  - Top donors (anonymous option)
- Withdrawal button → send to wallet or bank (via off-ramp)

---

## Blockchain Choice

### Primary: Base (Coinbase L2) or Avalanche C-Chain

| Feature | Base | Avalanche |
|---------|------|-----------|
| Gas cost | ~$0.001 | ~$0.01 |
| Finality | ~2 sec | ~1 sec |
| EVM compatible | ✅ | ✅ |
| USDC native | ✅ | ✅ |
| Fiat on-ramp | Coinbase | MoonPay |
| Ecosystem | Growing | Mature |

**Decision deferred:** Both are viable. Will choose based on partnership opportunities and developer tooling at implementation time.

### No Custom Token

We do NOT create a $FRED token. Rationale:

- Regulatory complexity (securities law)
- Users don't want another token
- USDC/ETH are universally understood
- Simpler smart contracts
