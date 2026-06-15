import type { CandleData, VolatilityState } from "@/types";

export function calculateATR(candles: CandleData[], period = 14): number {
  if (candles.length < period + 1) return 0;

  const trueRanges: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    trueRanges.push(tr);
  }

  const recent = trueRanges.slice(-period);
  return recent.reduce((sum, tr) => sum + tr, 0) / period;
}

export function calculateEMA(candles: CandleData[], period: number): number {
  if (candles.length < period) return candles[candles.length - 1]?.close ?? 0;

  const k = 2 / (period + 1);
  let ema = candles.slice(0, period).reduce((s, c) => s + c.close, 0) / period;

  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
  }
  return ema;
}

export function getEMASlope(candles: CandleData[], period: number): number {
  if (candles.length < period + 5) return 0;
  const recent = calculateEMAAtIndex(candles, period, candles.length - 1);
  const older = calculateEMAAtIndex(candles, period, candles.length - 6);
  return recent - older;
}

function calculateEMAAtIndex(
  candles: CandleData[],
  period: number,
  endIndex: number
): number {
  const slice = candles.slice(0, endIndex + 1);
  return calculateEMA(slice, period);
}

export function classifyVolatility(
  candles: CandleData[],
  spread: number
): VolatilityState {
  const atr = calculateATR(candles);
  if (atr === 0) return "Dead";

  const spreadRatio = spread / atr;
  const avgCandleSize =
    candles.slice(-20).reduce((s, c) => s + (c.high - c.low), 0) / 20;

  if (avgCandleSize < atr * 0.3) return "Dead";
  if (spreadRatio > 0.5) return "Dead";
  if (avgCandleSize > atr * 3) return "Chaotic";
  if (avgCandleSize > atr * 1.5) return "HighQuality";
  return "Normal";
}

export function getVolatilityScore(state: VolatilityState): number {
  switch (state) {
    case "HighQuality":
      return 100;
    case "Normal":
      return 70;
    case "Chaotic":
      return 20;
    case "Dead":
      return 0;
  }
}
