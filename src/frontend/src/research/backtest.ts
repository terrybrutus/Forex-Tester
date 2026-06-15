import { INSTRUMENTS, dollarsForMove } from "@/research/instruments";
import { evaluateStrategy } from "@/research/strategies";
import { simulateTopstep } from "@/research/topstep";
import type {
  BacktestMetrics,
  BacktestResult,
  BacktestTrade,
  Dataset,
  StrategyDefinition,
} from "@/types";

export function runBacktest(
  dataset: Dataset,
  strategy: StrategyDefinition,
  contextDataset?: Dataset,
): BacktestResult {
  const trades: BacktestTrade[] = [];
  const spec = INSTRUMENTS[dataset.instrument];
  let nextEligibleIndex = 0;

  for (let index = 0; index < dataset.candles.length - 1; index += 1) {
    if (index < nextEligibleIndex) continue;
    const signal = evaluateStrategy(strategy, dataset.candles, index);
    if (!signal) continue;
    if (
      strategy.id === "macro-continuation" &&
      contextDirection(contextDataset, dataset.candles[index].timestamp) !==
        signal.direction
    ) {
      continue;
    }

    const riskPerContract = dollarsForMove(
      dataset.instrument,
      signal.entry,
      signal.stop,
      1,
    );
    const contracts = Math.min(
      spec.maxContracts,
      Math.floor(
        strategy.parameters.maxRiskDollars / Math.max(riskPerContract, 0.01),
      ),
    );
    if (contracts < 1) continue;

    const outcome = resolveTrade(
      dataset,
      index,
      signal.direction,
      signal.stop,
      signal.target,
    );
    const grossSign =
      outcome.exitReason === "Target"
        ? 1
        : outcome.exitReason === "Stop"
          ? -1
          : 0;
    const grossPnl =
      grossSign === 0
        ? signedMovePnl(
            dataset,
            signal.direction,
            signal.entry,
            outcome.exit,
            contracts,
          )
        : dollarsForMove(
            dataset.instrument,
            signal.entry,
            outcome.exit,
            contracts,
          ) * grossSign;
    const estimatedSlippage = spec.tickValue * 2 * contracts;
    const executionCosts =
      spec.roundTurnCommission * contracts + estimatedSlippage;
    const netPnl = grossPnl - executionCosts;
    const initialRisk = riskPerContract * contracts + executionCosts;

    trades.push({
      id: `${strategy.id}-${dataset.instrument}-${dataset.candles[index].timestamp}`,
      strategyId: strategy.id,
      instrument: dataset.instrument,
      direction: signal.direction,
      entryTime: dataset.candles[index].timestamp,
      exitTime: dataset.candles[outcome.exitIndex].timestamp,
      entry: signal.entry,
      stop: signal.stop,
      target: signal.target,
      exit: outcome.exit,
      contracts,
      grossPnl,
      netPnl,
      rMultiple: initialRisk > 0 ? netPnl / initialRisk : 0,
      exitReason: outcome.exitReason,
      evidence: signal.evidence,
    });
    nextEligibleIndex = outcome.exitIndex + 1;
  }

  const metrics = calculateMetrics(trades);
  const topstep = simulateTopstep(trades);
  const qualification = qualify(metrics, topstep);
  return {
    id: `${dataset.id}-${strategy.id}-${Date.now()}`,
    createdAt: Date.now(),
    datasetId: dataset.id,
    contextDatasetId: contextDataset?.id,
    strategy,
    trades,
    metrics,
    topstep,
    qualification,
  };
}

function contextDirection(
  contextDataset: Dataset | undefined,
  timestamp: number,
): "Long" | "Short" | null {
  if (!contextDataset) return null;
  const index = contextDataset.candles.findIndex(
    (candle) => candle.timestamp >= timestamp,
  );
  if (index < 12) return null;
  const current = contextDataset.candles[index].close;
  const previous = contextDataset.candles[index - 12].close;
  if (current === previous) return null;
  return current > previous ? "Long" : "Short";
}

function resolveTrade(
  dataset: Dataset,
  entryIndex: number,
  direction: "Long" | "Short",
  stop: number,
  target: number,
) {
  const maximumHoldingCandles = Math.round((6 * 60) / dataset.timeframeMinutes);
  const end = Math.min(
    dataset.candles.length - 1,
    entryIndex + maximumHoldingCandles,
  );
  for (let index = entryIndex + 1; index <= end; index += 1) {
    const candle = dataset.candles[index];
    const stopHit =
      direction === "Long" ? candle.low <= stop : candle.high >= stop;
    const targetHit =
      direction === "Long" ? candle.high >= target : candle.low <= target;
    if (stopHit)
      return { exitIndex: index, exit: stop, exitReason: "Stop" as const };
    if (targetHit)
      return { exitIndex: index, exit: target, exitReason: "Target" as const };
  }
  return {
    exitIndex: end,
    exit: dataset.candles[end].close,
    exitReason: "Session close" as const,
  };
}

function signedMovePnl(
  dataset: Dataset,
  direction: "Long" | "Short",
  entry: number,
  exit: number,
  contracts: number,
) {
  const absolute = dollarsForMove(dataset.instrument, entry, exit, contracts);
  return direction === "Long"
    ? exit >= entry
      ? absolute
      : -absolute
    : exit <= entry
      ? absolute
      : -absolute;
}

export function calculateMetrics(trades: BacktestTrade[]): BacktestMetrics {
  let balance = 0;
  let peak = 0;
  let maxDrawdown = 0;
  let consecutiveLosses = 0;
  let maxConsecutiveLosses = 0;
  for (const trade of trades) {
    balance += trade.netPnl;
    peak = Math.max(peak, balance);
    maxDrawdown = Math.max(maxDrawdown, peak - balance);
    consecutiveLosses = trade.netPnl < 0 ? consecutiveLosses + 1 : 0;
    maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
  }
  const wins = trades.filter((trade) => trade.netPnl > 0);
  const losses = trades.filter((trade) => trade.netPnl <= 0);
  const grossWins = wins.reduce((sum, trade) => sum + trade.netPnl, 0);
  const grossLosses = Math.abs(
    losses.reduce((sum, trade) => sum + trade.netPnl, 0),
  );
  const totalR = trades.reduce((sum, trade) => sum + trade.rMultiple, 0);

  return {
    trades: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate: trades.length ? (wins.length / trades.length) * 100 : 0,
    averageR: trades.length ? totalR / trades.length : 0,
    expectancyR: trades.length ? totalR / trades.length : 0,
    profitFactor:
      grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? 99 : 0,
    netPnl: trades.reduce((sum, trade) => sum + trade.netPnl, 0),
    maxDrawdown,
    maxConsecutiveLosses,
  };
}

function qualify(
  metrics: BacktestMetrics,
  topstep: ReturnType<typeof simulateTopstep>,
) {
  const reasons: string[] = [];
  if (metrics.trades < 100)
    reasons.push("Fewer than 100 trades; evidence is preliminary.");
  if (metrics.expectancyR <= 0) reasons.push("Expectancy is not positive.");
  if (metrics.profitFactor < 1.2) reasons.push("Profit factor is below 1.20.");
  if (metrics.maxDrawdown > 1200)
    reasons.push("Drawdown exceeds the research limit.");
  if (topstep.failed)
    reasons.push(topstep.failureReason ?? "Topstep simulation failed.");
  if (!topstep.consistencyTargetMet)
    reasons.push("Topstep 50% Consistency Target was not met.");

  if (metrics.trades >= 300 && reasons.length === 0) {
    return {
      status: "Qualified" as const,
      reasons: ["Passed initial evidence thresholds."],
    };
  }
  if (metrics.trades >= 100 && (metrics.expectancyR <= 0 || topstep.failed)) {
    return { status: "Rejected" as const, reasons };
  }
  return { status: "Research only" as const, reasons };
}
