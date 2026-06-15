import type { Candle, Dataset, InstrumentCode } from "@/types";

export function createResearchFixture(
  instrument: InstrumentCode = "M6E",
  count = 1800,
): Dataset {
  const candles: Candle[] = [];
  let price = fixtureStartPrice(instrument);
  const start = Date.UTC(2025, 0, 6, 12, 0, 0);
  for (let index = 0; index < count; index += 1) {
    const cycle = Math.sin(index / 35) * 0.00008;
    const regime = Math.floor(index / 300) % 2 === 0 ? 0.000035 : -0.000025;
    const deterministicNoise = Math.sin(index * 12.9898) * 0.00006;
    const open = price;
    const close = open + regime + cycle + deterministicNoise;
    const range = 0.00018 + Math.abs(Math.cos(index / 11)) * 0.00012;
    candles.push({
      timestamp: start + index * 5 * 60 * 1000,
      open,
      high: Math.max(open, close) + range,
      low: Math.min(open, close) - range,
      close,
      volume: Math.round(500 + Math.abs(Math.sin(index / 9)) * 900),
    });
    price = close;
  }
  return {
    id: `fixture-${instrument}`,
    name: `${instrument} deterministic research fixture`,
    instrument,
    source: "Fixture",
    timeframeMinutes: 5,
    candles,
    importedAt: Date.now(),
  };
}

export function parseCsvDataset(
  text: string,
  instrument: InstrumentCode,
  name: string,
  timeframeMinutes = 5,
): Dataset {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0]
    .split(",")
    .map((value) => value.trim().toLowerCase());
  const required = ["timestamp", "open", "high", "low", "close", "volume"];
  for (const column of required) {
    if (!headers.includes(column)) {
      throw new Error(`CSV is missing required column: ${column}`);
    }
  }
  const candles = lines.slice(1).map((line, index) => {
    const cells = line.split(",");
    const value = (column: string) => cells[headers.indexOf(column)]?.trim();
    const timestampRaw = value("timestamp");
    const timestamp = /^\d+$/.test(timestampRaw)
      ? Number(timestampRaw)
      : Date.parse(timestampRaw);
    const candle = {
      timestamp,
      open: Number(value("open")),
      high: Number(value("high")),
      low: Number(value("low")),
      close: Number(value("close")),
      volume: Number(value("volume")),
    };
    if (Object.values(candle).some((item) => !Number.isFinite(item))) {
      throw new Error(`CSV row ${index + 2} contains invalid numeric data.`);
    }
    return candle;
  });
  if (candles.length < 100)
    throw new Error("At least 100 candles are required.");
  return {
    id: `import-${instrument}-${Date.now()}`,
    name,
    instrument,
    source: "Imported CSV",
    timeframeMinutes,
    candles: candles.sort((a, b) => a.timestamp - b.timestamp),
    importedAt: Date.now(),
  };
}

function fixtureStartPrice(instrument: InstrumentCode): number {
  const prices: Partial<Record<InstrumentCode, number>> = {
    M6E: 1.08,
    M6B: 1.27,
    M6J: 0.0064,
    M6A: 0.66,
  };
  return prices[instrument] ?? 1;
}
