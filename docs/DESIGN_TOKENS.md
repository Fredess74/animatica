# Design Tokens — Animatica

> **Philosophy:** "Retro Futurism 71" — 1970s parallel-stripe aesthetics in a modern dark interface. Only **green**, **white**, and **black**.

---

## 🎨 Color System

### Core Palette

```
BLACK SPECTRUM (Backgrounds)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#0A0A0A  ████  bg-deep         (pure dark)
#111111  ████  bg-base         (main surface)
#1A1A1A  ████  bg-surface      (cards, panels)
#222222  ████  bg-elevated     (hover, modals)
#2A2A2A  ████  bg-overlay      (dropdowns)

GREEN SPECTRUM (Retro 71 Palette — from dark to light)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#052E1A  ████  green-950       (deepest forest)
#0A5C36  ████  green-900       (dark forest)
#0D7A48  ████  green-800       (forest)
#15803D  ████  green-700       (primary dark)
#16A34A  ████  green-600       (primary — MAIN)
#22C55E  ████  green-500       (bright)
#4ADE80  ████  green-400       (lime)
#86EFAC  ████  green-300       (light, glow)
#BBF7D0  ████  green-200       (pale)

WHITE SPECTRUM (Text & Light)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
#FFFFFF  ████  white           (pure white)
#F5F5F0  ████  cream           (warm white — primary text)
#A3A3A3  ████  text-secondary  (muted text)
#737373  ████  text-muted      (disabled)
#404040  ████  border-subtle   (borders)
#1C2B1F  ████  border-green    (green-tinted dark border)
```

### Semantic Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#16A34A` | Main actions, selected states |
| `--color-primary-hover` | `#22C55E` | Hover on primary elements |
| `--color-primary-muted` | `#0A5C36` | Subtle backgrounds, badges |
| `--color-success` | `#4ADE80` | Confirmed, completed |
| `--color-error` | `#EF4444` | Errors only (the one exception) |
| `--color-warning` | `#86EFAC` | Warnings use pale green |
| `--color-bg` | `#0A0A0A` | Root background |
| `--color-surface` | `#1A1A1A` | Panel backgrounds |
| `--color-text` | `#F5F5F0` | Primary text |
| `--color-text-muted` | `#737373` | Secondary text |

---

## ✏️ Typography

| Role | Font | Weight | Size |
|------|------|--------|------|
| Display | Space Grotesk | 700 | 48px |
| H1 | Space Grotesk | 600 | 32px |
| H2 | Space Grotesk | 600 | 24px |
| H3 | Space Grotesk | 500 | 20px |
| Body | Inter | 400 | 16px |
| Body Small | Inter | 400 | 14px |
| Caption | Inter | 500 | 12px |
| Mono | JetBrains Mono | 400 | 14px |

---

## 🌀 Retro 71 Stripe System

The 70s parallel stripe is our signature visual motif. Inspired by the 1971 reference poster.

### Stripe Colors (left to right or top to bottom)

```
Stripe 1: #4ADE80  (lime)
Stripe 2: #22C55E  (bright green)
Stripe 3: #16A34A  (primary green)
Stripe 4: #0D7A48  (forest)
Stripe 5: #0A5C36  (dark forest)
```

### Usage Rules

1. **Dividers**: Thin (4px) horizontal retro stripe between major sections
2. **Progress/Loading**: Animated stripe as loading indicator
3. **Active tab/item accent**: 3px left-border stripe on active sidebar items
4. **Empty states**: Large diagonal stripe decoration
5. **NEVER** use stripe as background fill — always decorative accent

---

## 📐 Spacing & Radius

| Token | Value |
|-------|-------|
| `--radius-sm` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `24px` |
| `--radius-full` | `9999px` |
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `32px` |
| `--space-2xl` | `48px` |

---

## 🌟 Effects

### Glow

```css
/* Primary glow (buttons, active elements) */
box-shadow: 0 0 20px rgba(22, 163, 74, 0.25);

/* Intense glow (focused inputs, play button) */
box-shadow: 0 0 30px rgba(74, 222, 128, 0.3);
```

### Glass

```css
/* Glass panel (modals, floating UI) */
background: rgba(10, 10, 10, 0.85);
backdrop-filter: blur(16px);
border: 1px solid rgba(22, 163, 74, 0.1);
```

### Transitions

```css
/* Standard */
transition: all 200ms ease-out;

/* Emphasis (hover effects) */
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
```
