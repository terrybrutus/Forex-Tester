import type { ScannerRow, TradeDirection, StrategyType, VolatilityState } from "@/types";
import type { TrendAnalysis } from "./trendEngine";
import type { NewsRisk } from "./newsFilter";

export interface StrategySignal {
  strategy: StrategyType;
  direction: TradeDirection;
  score: number;
  reasons: string[];
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  invalidation: string;
}

export function evaluateSetup(
  _pair: string,
  currentPrice: number,
  atr: number,
  trend: TrendAnalysis,
  volatilityState: VolatilityState,
  sessionScore: number,
  currencyAlignmentScore: number,
  newsRisk: NewsRisk,
  spread: number
): StrategySignal {
  const reasons: string[] = [];
  let score = 0;
  let direction: TradeDirection = "Neutral";

  score += Math.round(currencyAlignmentScore * 0.2);
  if (currencyAlignmentScore > 60) reasons.push("Strong currency alignment");

  score += Math.round((trend.score / 100) * 20);
  if (trend.direction !== "Neutral") {
    direction = trend.direction;
    reasons.push(`${trend.direction} trend on 4H`);
  }

  const volScore = volatilityState === "HighQuality" ? 15 : volatilityState === "Normal" ? 10 : volatilityState === "Chaotic" ? 2 : 0;
  score += volScore;
  if (volatilityState === "HighQuality") reasons.push("High quality volatility");
  else if (volatilityState === "Normal") reasons.push("Normal volatility");

  score += Math.round((sessionScore / 100) * 15);
  if (sessionScore >= 80) reasons.push("High quality session");

  if (trend.aboveEma200 && trend.direction === "Long") {
    score += 10;
    reasons.push("Above 200 EMA");
  } else if (!trend.aboveEma200 && trend.direction === "Short") {
    score += 10;
    reasons.push("Below 200 EMA");
  }

  if (!newsRisk.isBlocked && !newsRisk.isWarning) {
    score += 5;
    reasons.push("No news risk");
  } else if (newsRisk.isWarning) {
    score = Math.round(score * 0.8);
  }

  const spreadScore = spread / atr < 0.1 ? 5 : spread / atr < 0.2 ? 3 : 0;
  score += spreadScore;

  const strategy: StrategyType = score >= 70 && direction !== "Neutral"
    ? "TrendPullback"
    : score >= 60 && direction !== "Neutral"
    ? "BreakoutContinuation"
    : "None";

  const slMultiplier = direction === "Long" ? -1.5 : 1.5;
  const tpMultiplier = direction === "Long" ? 3 : -3;
  const stopLoss = currentPrice + atr * slMultiplier;
  const takeProfit = currentPrice + atr * tpMultiplier;

  const invalidation = direction === "Long"
    ? `Price closes below ${stopLoss.toFixed(5)} or 4H trend turns bearish`
    : direction === "Short"
    ? `Price closes above ${stopLoss.toFixed(5)} or 4H trend turns bullish`
    : "No valid setup";

  return {
    strategy,
    direction,
    score: Math.max(0, Math.min(100, score)),
    reasons,
    entryPrice: currentPrice,
    stopLoss,
    takeProfit,
    invalidation,
  };
}

export function buildScannerRow(
  symbol: string,
  signal: StrategySignal,
  volatilityState: VolatilityState,
  sessionScore: number,
  spread: number,
  _atr: number,
  newsRisk: NewsRisk,
  suggestedLotSize: number,
  currencyStrengthScore: number,
  trend: TrendAnalysis
): ScannerRow {
  const stopDistance = Math.abs(signal.entryPrice - signal.stopLoss);
  const targetDistance = Math.abs(signal.takeProfit - signal.entryPrice);
  const riskReward = stopDistance > 0 ? targetDistance / stopDistance : 0;

  return {
    symbol,
    bias: signal.direction,
    score: signal.score,
    strategy: signal.strategy,
    currencyStrengthScore,
    trendScore: trend.score,
    volatilityState,
    sessionScore,
    spread,
    stopDistance,
    targetDistance,
    suggestedLotSize,
    newsStatus: newsRisk.isBlocked ? "Blocked" : newsRisk.isWarning ? "Warning" : "Clear",
    nextNewsMinutes: newsRisk.minutesUntilEvent,
    entryPrice: signal.entryPrice,
    stopLoss: signal.stopLoss,
    takeProfit: signal.takeProfit,
    riskReward: Math.round(riskReward * 100) / 100,
    reasons: signal.reasons,
    invalidation: signal.invalidation,
  };
}
