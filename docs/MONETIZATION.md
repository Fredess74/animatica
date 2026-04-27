# Monetization

## Overview

Animatica uses a **transparent donation pool** model. Viewers donate to films they love. Donations are split automatically by the platform. No subscriptions, no ads, no paywall.

---

## Revenue Flow

```
Viewer donates $10 to a film
        │
        ▼
┌─────────────────────┐
│    Donation System  │
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
| Accepted currencies | USD, EUR, GBP + other major currencies |
| Payment processor | Stripe |
| Split ratio | 70% creator / 20% fund / 10% platform |
| Split execution | Automated on donation |
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

- Creators can request payouts of their share at any time
- Minimum payout: $1.00
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

## Payments

1. **Credit/Debit Card** — Automated processing via Stripe
2. **Direct Bank Transfer** — For large payouts
3. **Platform Balances** — Earned funds can be used for donations or purchases

### Viewer Experience

```
1. Click "Donate" on a film
2. Choose amount ($1, $5, $10, custom)
3. Pay with credit card or platform balance
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
- Withdrawal button → send to bank account
