import type { CandleData } from "@/types";

const BASE_URL = "https://api.twelvedata.com";
const API_KEY = import.meta.env.VITE_TWELVE_DATA_KEY ?? "demo";

export type Interval = "5min" | "15min" | "1h" | "4h" | "1day";

interface TwelveCandle {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume?: string;
}

interface TwelveResponse {
  values?: TwelveCandle[];
  status?: string;
  message?: string;
}

interface TwelvePriceResponse {
  price?: string;
  symbol?: string;
  status?: string;
}

export async function fetchCandles(
  symbol: string,
  interval: Interval,
  outputsize = 200
): Promise<CandleData[]> {
  const url = `${BASE_URL}/time_series?symbol=${encodeURIComponent(symbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TwelveData HTTP ${res.status}`);

  const data: TwelveResponse = await res.json();
  if (!data.values) return getMockCandles(symbol, outputsize);

  return data.values
    .map((c) => ({
      time: new Date(c.datetime).getTime(),
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: c.volume ? parseFloat(c.volume) : undefined,
    }))
    .reverse();
}

export async function fetchPrice(symbol: string): Promise<number> {
  const url = `${BASE_URL}/price?symbol=${encodeURIComponent(symbol)}&apikey=${API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) return getMockPrice(symbol);

  const data: TwelvePriceResponse = await res.json();
  return data.price ? parseFloat(data.price) : getMockPrice(symbol);
}

function getMockPrice(symbol: string): number {
  const prices: Record<string, number> = {
    "EUR/USD": 1.085,
    "GBP/USD": 1.265,
    "USD/JPY": 149.5,
    "USD/CHF": 0.895,
    "USD/CAD": 1.365,
    "AUD/USD": 0.645,
    "NZD/USD": 0.595,
    "EUR/JPY": 162.2,
    "GBP/JPY": 189.1,
    "EUR/GBP": 0.858,
    "AUD/JPY": 96.5,
    "CAD/JPY": 109.5,
  };
  return prices[symbol] ?? 1.0;
}

function getMockCandles(symbol: string, count: number): CandleData[] {
  const basePrice = getMockPrice(symbol);
  const candles: CandleData[] = [];
  let price = basePrice;
  const now = Date.now();

  for (let i = count; i >= 0; i--) {
    const change = (Math.random() - 0.5) * 0.002;
    const open = price;
    price += change;
    const high = Math.max(open, price) + Math.random() * 0.001;
    const low = Math.min(open, price) - Math.random() * 0.001;
    candles.push({
      time: now - i * 60000 * 60,
      open,
      high,
      low,
      close: price,
    });
  }
  return candles;
}
