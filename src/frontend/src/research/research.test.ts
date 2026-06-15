import { calculateMetrics, runBacktest } from "@/research/backtest";
import { createResearchFixture, parseCsvDataset } from "@/research/datasets";
import { dollarsForMove, ticksBetween } from "@/research/instruments";
import { STRATEGIES } from "@/research/strategies";
import { simulateTopstep } from "@/research/topstep";
import type { BacktestTrade } from "@/types";
import { describe, expect, it } from "vitest";

describe("futures mechanics", () => {
  it("calculates micro Euro ticks and dollars", () => {
    expect(ticksBetween("M6E", 1.075, 1.0742)).toBeCloseTo(8);
    expect(dollarsForMove("M6E", 1.075, 1.0742, 2)).toBeCloseTo(20);
  });
});

describe("dataset ingestion", () => {
  it("parses chronological OHLCV CSV data", () => {
    const rows = Array.from({ length: 100 }, (_, index) => {
      const timestamp = Date.UTC(2025, 0, 1, 0, index * 5);
      return `${timestamp},1,1.1,0.9,1.05,500`;
    });
    const dataset = parseCsvDataset(
      `timestamp,open,high,low,close,volume\n${rows.join("\n")}`,
      "M6E",
      "test.csv",
    );
    expect(dataset.candles).toHaveLength(100);
    expect(dataset.source).toBe("Imported CSV");
  });
});

describe("backtesting", () => {
  it("is deterministic for the same dataset and strategy", () => {
    const dataset = createResearchFixture("M6E", 600);
    const first = runBacktest(dataset, STRATEGIES["trend-pullback"]);
    const second = runBacktest(dataset, STRATEGIES["trend-pullback"]);
    expect(first.metrics).toEqual(second.metrics);
    expect(first.trades.map((trade) => trade.netPnl)).toEqual(
      second.trades.map((trade) => trade.netPnl),
    );
  });

  it("calculates metrics after costs", () => {
    const trades = [trade(100, 1), trade(-50, -0.5), trade(-25, -0.25)];
    const metrics = calculateMetrics(trades);
    expect(metrics.netPnl).toBe(25);
    expect(metrics.profitFactor).toBeCloseTo(100 / 75);
    expect(metrics.maxDrawdown).toBe(75);
  });

  it("requires a separate context dataset for macro continuation", () => {
    const dataset = createResearchFixture("M6E", 600);
    const withoutContext = runBacktest(
      dataset,
      STRATEGIES["macro-continuation"],
    );
    expect(withoutContext.trades).toHaveLength(0);
  });
});

describe("Topstep governor", () => {
  it("fails when the personal daily stop is breached", () => {
    const result = simulateTopstep([trade(-160, -1), trade(-160, -1)]);
    expect(result.failed).toBe(true);
    expect(result.failureReason).toContain("daily loss");
  });

  it("updates the trailing loss floor only after a trading day ends", () => {
    const first = trade(500, 2);
    const second = trade(-100, -0.5);
    second.exitTime = Date.UTC(2025, 0, 2, 18);
    const result = simulateTopstep([first, second]);
    expect(result.maximumLossFloor).toBe(48500);
    expect(result.failed).toBe(false);
  });
});

function trade(netPnl: number, rMultiple: number): BacktestTrade {
  return {
    id: String(Math.random()),
    strategyId: "trend-pullback",
    instrument: "M6E",
    direction: "Long",
    entryTime: Date.UTC(2025, 0, 1, 14),
    exitTime: Date.UTC(2025, 0, 1, 15),
    entry: 1,
    stop: 0.9,
    target: 1.2,
    exit: 1.1,
    contracts: 1,
    grossPnl: netPnl,
    netPnl,
    rMultiple,
    exitReason: netPnl > 0 ? "Target" : "Stop",
    evidence: [],
  };
}
