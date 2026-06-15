import type { CandleData, TradeDirection } from "@/types";
import { calculateEMA, getEMASlope } from "./volatilityEngine";

export interface TrendAnalysis {
  direction: TradeDirection;
  score: number;
  ema50: number;
  ema200: number;
  aboveEma50: boolean;
  aboveEma200: boolean;
  emaSlope: number;
  htfBias: TradeDirection;
}

export function analyzeTrend(
  h4Candles: CandleData[],
  h1Candles: CandleData[],
  m15Candles: CandleData[]
): TrendAnalysis {
  const h4Ema50 = calculateEMA(h4Candles, 50);
  const h4Ema200 = calculateEMA(h4Candles, 200);
  const h4Close = h4Candles[h4Candles.length - 1]?.close ?? 0;
  const h4Slope = getEMASlope(h4Candles, 50);

  const h1Ema50 = calculateEMA(h1Candles, 50);
  const h1Close = h1Candles[h1Candles.length - 1]?.close ?? 0;
  const h1Slope = getEMASlope(h1Candles, 50);

  const m15Close = m15Candles[m15Candles.length - 1]?.close ?? 0;
  const m15Ema50 = calculateEMA(m15Candles, 50);

  let score = 50;
  const h4AboveEma50 = h4Close > h4Ema50;
  const h4AboveEma200 = h4Close > h4Ema200;
  const h1AboveEma50 = h1Close > h1Ema50;
  const m15AboveEma50 = m15Close > m15Ema50;

  if (h4AboveEma200) score += 15;
  else score -= 15;

  if (h4AboveEma50) score += 10;
  else score -= 10;

  if (h4Slope > 0) score += 10;
  else if (h4Slope < 0) score -= 10;

  if (h1AboveEma50) score += 8;
  else score -= 8;

  if (h1Slope > 0) score += 7;
  else if (h1Slope < 0) score -= 7;

  if (m15AboveEma50) score += 5;
  else score -= 5;

  const htfBullish = h4AboveEma200 && h4AboveEma50;
  const htfBearish = !h4AboveEma200 && !h4AboveEma50;

  const htfBias: TradeDirection = htfBullish ? "Long" : htfBearish ? "Short" : "Neutral";
  const direction: TradeDirection = score > 60 ? "Long" : score < 40 ? "Short" : "Neutral";

  return {
    direction,
    score: Math.max(0, Math.min(100, score)),
    ema50: h4Ema50,
    ema200: h4Ema200,
    aboveEma50: h4AboveEma50,
    aboveEma200: h4AboveEma200,
    emaSlope: h4Slope,
    htfBias,
  };
}

export function detectPullback(
  h1Candles: CandleData[],
  m15Candles: CandleData[],
  trend: TradeDirection
): boolean {
  if (trend === "Neutral") return false;

  const h1Ema50 = calculateEMA(h1Candles, 50);
  const m15Close = m15Candles[m15Candles.length - 1]?.close ?? 0;
  const m15Ema50 = calculateEMA(m15Candles, 50);
  const tolerance = h1Ema50 * 0.001;

  if (trend === "Long") {
    return Math.abs(m15Close - m15Ema50) < tolerance * 5 || m15Close < m15Ema50;
  }
  return Math.abs(m15Close - m15Ema50) < tolerance * 5 || m15Close > m15Ema50;
}
