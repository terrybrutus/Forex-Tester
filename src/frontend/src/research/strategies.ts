import {
  atr,
  ema,
  rollingAverageVolume,
  rollingHigh,
  rollingLow,
} from "@/research/indicators";
import type {
  Candle,
  SignalEvidence,
  StrategyDefinition,
  StrategyId,
  TradeDirection,
} from "@/types";

export const STRATEGIES: Record<StrategyId, StrategyDefinition> = {
  "trend-pullback": {
    id: "trend-pullback",
    name: "Trend continuation pullback",
    version: "1.0.0",
    thesis:
      "Join an established trend after price returns toward its fast moving average.",
    parameters: defaultParameters(),
  },
  "session-breakout": {
    id: "session-breakout",
    name: "Session volatility breakout",
    version: "1.0.0",
    thesis:
      "Trade range expansion when price, volume, and session participation agree.",
    parameters: defaultParameters(),
  },
  "macro-continuation": {
    id: "macro-continuation",
    name: "Cross-market macro continuation",
    version: "1.0.0",
    thesis:
      "Require trend continuation plus externally supplied context confirmation.",
    parameters: defaultParameters(),
  },
};

function defaultParameters() {
  return {
    fastEma: 20,
    slowEma: 50,
    atrPeriod: 14,
    stopAtr: 1.25,
    targetR: 2,
    breakoutLookback: 12,
    volumeMultiplier: 1.2,
    sessionStartHourEt: 8,
    sessionEndHourEt: 12,
    maxRiskDollars: 100,
  };
}

export interface StrategySignal {
  direction: TradeDirection;
  entry: number;
  stop: number;
  target: number;
  evidence: SignalEvidence[];
}

export function evaluateStrategy(
  definition: StrategyDefinition,
  candles: Candle[],
  index: number,
  contextConfirmed = true,
): StrategySignal | null {
  const minimum = Math.max(
    definition.parameters.slowEma + 5,
    definition.parameters.breakoutLookback,
  );
  if (index < minimum || index >= candles.length) return null;

  const closes = candles.map((candle) => candle.close);
  const fast = ema(closes, definition.parameters.fastEma);
  const slow = ema(closes, definition.parameters.slowEma);
  const volatility = atr(candles, definition.parameters.atrPeriod);
  const candle = candles[index];
  const previous = candles[index - 1];
  const trendLong = fast[index] > slow[index] && fast[index] > fast[index - 3];
  const trendShort = fast[index] < slow[index] && fast[index] < fast[index - 3];
  const session = getEasternHour(candle.timestamp);
  const inSession =
    session >= definition.parameters.sessionStartHourEt &&
    session < definition.parameters.sessionEndHourEt;

  if (definition.id === "trend-pullback") {
    const longPullback =
      trendLong &&
      previous.low <= fast[index - 1] &&
      candle.close > fast[index];
    const shortPullback =
      trendShort &&
      previous.high >= fast[index - 1] &&
      candle.close < fast[index];
    if (!inSession || (!longPullback && !shortPullback)) return null;
    return buildSignal(
      longPullback ? "Long" : "Short",
      candle.close,
      volatility[index],
      definition,
      [
        evidence(
          "Price structure",
          "Trend alignment",
          true,
          "Fast EMA agrees with slow EMA.",
        ),
        evidence(
          "Price structure",
          "Pullback held",
          true,
          "Price returned to trend support.",
        ),
        evidence(
          "Participation",
          "Primary session",
          inSession,
          "Signal occurred in configured ET session.",
        ),
      ],
    );
  }

  const high = rollingHigh(
    candles,
    index,
    definition.parameters.breakoutLookback,
  );
  const low = rollingLow(
    candles,
    index,
    definition.parameters.breakoutLookback,
  );
  const averageVolume = rollingAverageVolume(
    candles,
    index,
    definition.parameters.breakoutLookback,
  );
  const volumeConfirmed =
    candle.volume >= averageVolume * definition.parameters.volumeMultiplier;
  const longBreakout = candle.close > high && trendLong;
  const shortBreakout = candle.close < low && trendShort;
  if (!inSession || !volumeConfirmed || (!longBreakout && !shortBreakout))
    return null;
  if (definition.id === "macro-continuation" && !contextConfirmed) return null;

  return buildSignal(
    longBreakout ? "Long" : "Short",
    candle.close,
    volatility[index],
    definition,
    [
      evidence(
        "Price structure",
        "Range breakout",
        true,
        "Close exceeded the prior range.",
      ),
      evidence(
        "Momentum",
        "Trend agreement",
        true,
        "Breakout follows the established trend.",
      ),
      evidence(
        "Participation",
        "Volume expansion",
        volumeConfirmed,
        "Volume exceeded its rolling baseline.",
      ),
      evidence(
        "Cross-market context",
        "Context confirmation",
        definition.id !== "macro-continuation" || contextConfirmed,
        definition.id === "macro-continuation"
          ? "Required context market agrees."
          : "Not required for this strategy.",
      ),
    ],
  );
}

function buildSignal(
  direction: TradeDirection,
  entry: number,
  currentAtr: number,
  definition: StrategyDefinition,
  evidenceItems: SignalEvidence[],
): StrategySignal {
  const stopDistance = currentAtr * definition.parameters.stopAtr;
  const stop =
    direction === "Long" ? entry - stopDistance : entry + stopDistance;
  const target =
    direction === "Long"
      ? entry + stopDistance * definition.parameters.targetR
      : entry - stopDistance * definition.parameters.targetR;
  return { direction, entry, stop, target, evidence: evidenceItems };
}

function evidence(
  family: string,
  label: string,
  supports: boolean,
  detail: string,
): SignalEvidence {
  return { family, label, supports, detail };
}

function getEasternHour(timestamp: number): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/New_York",
    }).format(new Date(timestamp)),
  );
}
