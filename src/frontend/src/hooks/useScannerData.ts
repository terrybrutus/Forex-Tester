import { useMemo } from "react";
import { useMarketData, useNewsCalendar } from "./useMarketData";
import { analyzeTrend } from "@/engines/trendEngine";
import { classifyVolatility } from "@/engines/volatilityEngine";
import { getCurrentSession, getSessionScoreForPair } from "@/engines/sessionEngine";
import { assessNewsRisk } from "@/engines/newsFilter";
import { evaluateSetup, buildScannerRow } from "@/engines/strategyEngine";
import { calculateCurrencyStrengths } from "@/engines/currencyStrength";
import { calculateRisk, getDefaultSettings, getDefaultAccountState } from "@/engines/riskEngine";
import type { ScannerRow, CurrencyStrength } from "@/types";

export function useScannerData() {
  const { data: marketData = [], isLoading: marketLoading } = useMarketData();
  const { data: newsEvents = [], isLoading: newsLoading } = useNewsCalendar();

  const session = useMemo(() => getCurrentSession(), []);

  const currencyStrengths = useMemo((): CurrencyStrength[] => {
    if (marketData.length === 0) return [];
    const priceChanges: Record<string, number> = {};
    for (const pair of marketData) {
      priceChanges[pair.symbol] = pair.changePercent;
    }
    return calculateCurrencyStrengths(priceChanges);
  }, [marketData]);

  const scannerRows = useMemo((): ScannerRow[] => {
    if (marketData.length === 0) return [];

    const settings = getDefaultSettings();
    const account = getDefaultAccountState(settings);
    const now = Date.now();

    return marketData.map((pair) => {
      const trend = analyzeTrend(
        pair.candles.h4,
        pair.candles.h1,
        pair.candles.m15
      );

      const volatilityState = classifyVolatility(pair.candles.h1, pair.spread);
      const sessionScore = getSessionScoreForPair(pair.symbol, session);

      const [base, quote] = pair.symbol.split("/");
      const newsRisk = assessNewsRisk(newsEvents, base, quote, now);

      const baseStrength = currencyStrengths.find((c) => c.currency === base);
      const quoteStrength = currencyStrengths.find((c) => c.currency === quote);
      const currencyAlignmentScore =
        baseStrength && quoteStrength
          ? Math.abs(baseStrength.score - quoteStrength.score)
          : 50;

      const signal = evaluateSetup(
        pair.symbol,
        pair.ask,
        pair.atr14,
        trend,
        volatilityState,
        sessionScore,
        currencyAlignmentScore,
        newsRisk,
        pair.spread
      );

      const riskCalc = calculateRisk(
        settings,
        account,
        pair.symbol,
        signal.entryPrice,
        signal.stopLoss,
        signal.takeProfit
      );

      return buildScannerRow(
        pair.symbol,
        signal,
        volatilityState,
        sessionScore,
        pair.spread,
        pair.atr14,
        newsRisk,
        riskCalc.lotSize,
        currencyAlignmentScore,
        trend
      );
    }).sort((a, b) => b.score - a.score);
  }, [marketData, newsEvents, session, currencyStrengths]);

  return {
    scannerRows,
    currencyStrengths,
    session,
    isLoading: marketLoading || newsLoading,
    marketData,
    newsEvents,
  };
}
