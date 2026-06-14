# Design Brief

## Direction

Forex Pairs Dashboard — Real-time currency pair tracking with clean data presentation.

## Tone

Dark Editorial. Professional, data-focused, minimal. High information density without visual noise.

## Differentiation

Clean hierarchical price cards with clear directional indicators (green/red), spacious vertical rhythm, minimal decoration.

## Color Palette

| Token      | OKLCH         | Role                  |
| ---------- | ------------- | --------------------- |
| background | 0.145 0.008 260 | Dark slate base       |
| foreground | 0.95 0.01 260 | Off-white text        |
| card       | 0.18 0.01 260 | Pair card surface     |
| primary    | 0.65 0.18 215 | Button, interactive   |
| accent     | 0.75 0.16 210 | Highlight accent      |
| muted      | 0.22 0.01 260 | Secondary surface     |
| destructive| 0.55 0.2 25   | Down price / delete   |

## Typography

- Display: Space Grotesk — Section headers, app title
- Body: DM Sans — Pair names, labels, metadata
- Mono: JetBrains Mono — Numerical price values
- Scale: hero `text-3xl md:text-4xl font-bold`, h2 `text-xl font-semibold`, label `text-sm font-medium`, body `text-base`

## Elevation & Depth

Subtle layering: cards raised from background with minimal shadow, header with border-bottom only, no floating/blur effects.

## Structural Zones

| Zone    | Background      | Border          | Notes                                  |
| ------- | --------------- | --------------- | -------------------------------------- |
| Header  | card (0.18)     | border-bottom   | Title + refresh button, minimal height |
| Content | background      | —               | Table/list rows, alternating bg       |
| Forms   | muted (0.22)    | border          | Add pair input, subtle surface         |

## Spacing & Rhythm

Vertically spacious (1.5rem gaps between sections), horizontally tight (0.75rem padding within cards), consistent 8px baseline grid.

## Component Patterns

- Buttons: primary blue (0.65) on dark, hover brightens to (0.7), rounded-lg
- Cards: subtle border, monospace prices, directional icon + %change label
- Badges: green (success) for up, red (destructive) for down, small rounded-full

## Motion

- Entrance: fade-in on mount (0.2s)
- Hover: card slight lift (shadow increase), button text brightens
- Refresh: spinner rotation, no easing

## Constraints

- No gradients, no decorative elements
- Monospace for all price values
- Pairs list rows alternate subtle background (muted 0.22 vs card 0.18)
- Max 80 chars per line in display text

## Signature Detail

Directional price badges (green ↑ / red ↓) with percentage change — functional indicator becomes visual pattern.
