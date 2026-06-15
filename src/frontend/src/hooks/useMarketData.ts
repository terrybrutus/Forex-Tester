import { useQuery } from "@tanstack/react-query";
import { fetchCandles, fetchPrice } from "@/services/twelveData";
import type { PairMarketData } from "@/types";
import { calculateATR, calculateEMA } from "@/engines/volatilityEngine";

const TRACKED_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "USD/CAD",
  "AUD/USD", "NZD/USD", "EUR/JPY", "GBP/JPY", "EUR/GBP",
  "AUD/JPY", "CAD/JPY",
];

export function useMarketData() {
  return useQuery<PairMarketData[]>({
    queryKey: ["marketData"],
    queryFn: async () => {
      const results = await Promise.allSettled(
        TRACKED_PAIRS.map(async (symbol) => {
          const [h4Candles, h1Candles, m15Candles, m5Candles, d1Candles, price] =
            await Promise.all([
              fetchCandles(symbol, "4h", 210),
              fetchCandles(symbol, "1h", 100),
              fetchCandles(symbol, "15min", 100),
              fetchCandles(symbol, "5min", 100),
              fetchCandles(symbol, "1day", 30),
              fetchPrice(symbol),
            ]);

          const atr14 = calculateATR(h4Candles);
          const ema50 = calculateEMA(h4Candles, 50);
          const ema200 = calculateEMA(h4Candles, 200);
          const spread = symbol.includes("JPY") ? 0.03 : 0.0003;

          const changePercent =
            d1Candles.length >= 2
              ? ((d1Candles[d1Candles.length - 1].close - d1Candles[d1Candles.length - 2].close) /
                  d1Candles[d1Candles.length - 2].close) *
                100
              : 0;

          const data: PairMarketData = {
            symbol,
            bid: price - spread / 2,
            ask: price + spread / 2,
            changePercent: Math.round(changePercent * 100) / 100,
            isUp: changePercent >= 0,
            candles: {
              h4: h4Candles,
              h1: h1Candles,
              m15: m15Candles,
              m5: m5Candles,
              d1: d1Candles,
            },
            spread,
            atr14,
            ema50,
            ema200,
          };
          return data;
        })
      );

      return results
        .filter((r): r is PromiseFulfilledResult<PairMarketData> => r.status === "fulfilled")
        .map((r) => r.value);
    },
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

export function useNewsCalendar() {
  return useQuery({
    queryKey: ["newsCalendar"],
    queryFn: async () => {
      const { fetchEconomicCalendar, getTodayRange } = await import("@/services/fmpCalendar");
      const { from, to } = getTodayRange();
      return fetchEconomicCalendar(from, to);
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 4 * 60 * 1000,
  });
}
