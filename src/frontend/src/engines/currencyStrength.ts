import type { CurrencyStrength } from "@/types";

const CURRENCY_PAIRS: Record<string, string[]> = {
  USD: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "USD/CAD", "AUD/USD", "NZD/USD"],
  EUR: ["EUR/USD", "EUR/GBP", "EUR/JPY", "EUR/CHF", "EUR/AUD", "EUR/CAD", "EUR/NZD"],
  GBP: ["GBP/USD", "EUR/GBP", "GBP/JPY", "GBP/CHF", "GBP/AUD", "GBP/CAD", "GBP/NZD"],
  JPY: ["USD/JPY", "EUR/JPY", "GBP/JPY", "CHF/JPY", "AUD/JPY", "CAD/JPY", "NZD/JPY"],
  CHF: ["USD/CHF", "EUR/CHF", "GBP/CHF", "CHF/JPY"],
  CAD: ["USD/CAD", "EUR/CAD", "GBP/CAD", "CAD/JPY"],
  AUD: ["AUD/USD", "EUR/AUD", "GBP/AUD", "AUD/JPY", "AUD/CAD", "AUD/NZD"],
  NZD: ["NZD/USD", "EUR/NZD", "GBP/NZD", "NZD/JPY", "AUD/NZD"],
};

export function calculateCurrencyStrengths(
  priceChanges: Record<string, number>
): CurrencyStrength[] {
  const scores: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const [currency, pairs] of Object.entries(CURRENCY_PAIRS)) {
    scores[currency] = 0;
    counts[currency] = 0;

    for (const pair of pairs) {
      if (priceChanges[pair] !== undefined) {
        const [base, quote] = pair.split("/");
        const change = priceChanges[pair];
        if (base === currency) {
          scores[currency] += change;
        } else if (quote === currency) {
          scores[currency] -= change;
        }
        counts[currency]++;
      }
    }

    if (counts[currency] > 0) {
      scores[currency] = scores[currency] / counts[currency];
    }
  }

  const values = Object.values(scores);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const strengths = Object.entries(scores).map(([currency, raw]) => ({
    currency,
    score: Math.round(((raw - min) / range) * 100),
    rank: 0,
  }));

  strengths.sort((a, b) => b.score - a.score);
  return strengths.map((s, i) => ({ ...s, rank: i + 1 }));
}

export function getBestTradePairs(
  strengths: CurrencyStrength[]
): Array<{ pair: string; biasCurrency: string; weakCurrency: string; alignmentScore: number }> {
  const results: Array<{
    pair: string;
    biasCurrency: string;
    weakCurrency: string;
    alignmentScore: number;
  }> = [];

  const top3 = strengths.slice(0, 3);
  const bottom3 = strengths.slice(-3);

  for (const strong of top3) {
    for (const weak of bottom3) {
      const pairFwd = `${strong.currency}/${weak.currency}`;
      const pairRev = `${weak.currency}/${strong.currency}`;
      const alignment = strong.score - weak.score;

      results.push({
        pair: pairFwd,
        biasCurrency: strong.currency,
        weakCurrency: weak.currency,
        alignmentScore: alignment,
      });
      results.push({
        pair: pairRev,
        biasCurrency: strong.currency,
        weakCurrency: weak.currency,
        alignmentScore: alignment,
      });
    }
  }

  return results.sort((a, b) => b.alignmentScore - a.alignmentScore);
}
