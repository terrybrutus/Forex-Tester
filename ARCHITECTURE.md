# Architecture

## Boundary

The browser performs high-volume research work:

- CSV ingestion
- IndexedDB candle caching
- Indicator calculation
- Strategy evaluation
- Backtesting
- Topstep account simulation

The Caffeine canister stores compact durable records:

- Versioned strategy and experiment summaries
- Journal records
- Qualification decisions
- Rule-profile snapshots

Raw historical candles and continuous market polling do not belong in the
canister. This avoids unnecessary cycles, storage growth, and HTTP outcall
pressure.

## Research Integrity

The backtester uses only the current and previous candles to create a signal.
Trade exits begin on the next candle. When stop and target are both touched in
one candle, the stop is resolved first. This conservative rule avoids optimistic
same-bar assumptions. Results include estimated round-turn commissions and two
ticks of round-turn slippage per contract.

Qualification currently requires:

- Imported non-fixture data
- At least 300 completed trades
- Positive expectancy after costs
- Profit factor of at least `1.20`
- Maximum drawdown at or below `$1,200`
- No simulated Topstep rule failure

Qualification is an initial evidence gate, not proof of future profitability.

## Data Provider

Databento is the recommended historical CME data source because it supports CME
Globex data, continuous-contract mappings, and reusable CSV exports. The app
does not embed API credentials or make recurring Databento calls.

## Topstep Profile

The initial simulator uses a `$50K` account, a `$3,000` profit target, a
`$2,000` Maximum Loss Limit that trails at the end of each Topstep trading day,
the 50% Consistency Target, and a stricter personal daily stop of `$300`.
Current purchased-account rules must be verified before live use. Candle
backtests do not observe tick-by-tick unrealized P/L, so final qualification
requires replay or forward testing before live use.
