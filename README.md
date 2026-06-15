# Convergence Lab

Convergence Lab is a Caffeine AI-compatible futures research and risk-governance
application. It is designed to discover and reject trading methods before any
method is allowed to produce live instructions.

The initial account model is a Topstep `$50K` evaluation. The initial tradable
research instruments are micro currency futures (`M6E`, `M6B`, `M6J`, `M6A`).
Oil, gold, equity-index, and Treasury futures are reserved for cross-market
context.

## Safety Principles

- Fixture data is visibly labeled and can never qualify a strategy.
- No failed API request silently becomes fabricated market data.
- Backtests include contract tick values and estimated round-turn commission.
- Research results include rejected strategies and negative outcomes.
- Raw candles remain browser-side to avoid excessive canister storage and HTTP
  outcalls.
- A strategy needs imported data, positive after-cost evidence, acceptable
  drawdown, and Topstep simulation survival before qualification.

## Data Import

Export OHLCV data from Databento as CSV with these columns:

```text
timestamp,open,high,low,close,volume
```

The importer accepts ISO timestamps or Unix-millisecond timestamps. Imported
data is cached in browser IndexedDB and reused without recurring API calls.

## Quality Gates

Run from the repository root:

```text
corepack pnpm typecheck
corepack pnpm check
corepack pnpm test
corepack pnpm build
```

Backend validation requires Mops in a supported Linux or WSL environment:

```text
mops check
mops build
pnpm bindgen
```

The GitHub Actions workflow runs frontend typecheck, Biome, tests, and build on
every pull request and push to `main`.
