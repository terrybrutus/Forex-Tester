import type { Candle } from "@/types";

export function ema(values: number[], period: number): number[] {
  if (values.length === 0) return [];
  const multiplier = 2 / (period + 1);
  const output = [values[0]];
  for (let index = 1; index < values.length; index += 1) {
    output.push(
      values[index] * multiplier + output[index - 1] * (1 - multiplier),
    );
  }
  return output;
}

export function atr(candles: Candle[], period: number): number[] {
  if (candles.length === 0) return [];
  const ranges = candles.map((candle, index) => {
    const previousClose = candles[Math.max(index - 1, 0)].close;
    return Math.max(
      candle.high - candle.low,
      Math.abs(candle.high - previousClose),
      Math.abs(candle.low - previousClose),
    );
  });
  return ema(ranges, period);
}

export function rollingHigh(
  candles: Candle[],
  endIndex: number,
  lookback: number,
): number {
  return Math.max(
    ...candles
      .slice(Math.max(0, endIndex - lookback), endIndex)
      .map((c) => c.high),
  );
}

export function rollingLow(
  candles: Candle[],
  endIndex: number,
  lookback: number,
): number {
  return Math.min(
    ...candles
      .slice(Math.max(0, endIndex - lookback), endIndex)
      .map((c) => c.low),
  );
}

export function rollingAverageVolume(
  candles: Candle[],
  endIndex: number,
  lookback: number,
): number {
  const selected = candles.slice(Math.max(0, endIndex - lookback), endIndex);
  if (selected.length === 0) return 0;
  return (
    selected.reduce((sum, candle) => sum + candle.volume, 0) / selected.length
  );
}
