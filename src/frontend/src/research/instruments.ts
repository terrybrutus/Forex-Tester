import type { InstrumentCode, InstrumentSpec } from "@/types";

export const INSTRUMENTS: Record<InstrumentCode, InstrumentSpec> = {
  M6E: {
    code: "M6E",
    name: "Micro Euro FX",
    contextRole: "EUR/USD directional expression",
    tickSize: 0.0001,
    tickValue: 1.25,
    roundTurnCommission: 2.4,
    maxContracts: 5,
  },
  M6B: {
    code: "M6B",
    name: "Micro British Pound",
    contextRole: "GBP/USD directional expression",
    tickSize: 0.0001,
    tickValue: 0.625,
    roundTurnCommission: 2.4,
    maxContracts: 5,
  },
  M6J: {
    code: "M6J",
    name: "Micro Japanese Yen",
    contextRole: "JPY/USD directional expression",
    tickSize: 0.0000005,
    tickValue: 0.625,
    roundTurnCommission: 2.4,
    maxContracts: 5,
  },
  M6A: {
    code: "M6A",
    name: "Micro Australian Dollar",
    contextRole: "AUD/USD directional expression",
    tickSize: 0.0001,
    tickValue: 1,
    roundTurnCommission: 2.4,
    maxContracts: 5,
  },
  MCL: {
    code: "MCL",
    name: "Micro WTI Crude Oil",
    contextRole: "Energy and inflation context",
    tickSize: 0.01,
    tickValue: 1,
    roundTurnCommission: 2.4,
    maxContracts: 5,
  },
  MGC: {
    code: "MGC",
    name: "Micro Gold",
    contextRole: "Inflation and risk context",
    tickSize: 0.1,
    tickValue: 1,
    roundTurnCommission: 2.4,
    maxContracts: 5,
  },
  MES: {
    code: "MES",
    name: "Micro E-mini S&P 500",
    contextRole: "Risk-on and risk-off context",
    tickSize: 0.25,
    tickValue: 1.25,
    roundTurnCommission: 2.4,
    maxContracts: 5,
  },
  ZN: {
    code: "ZN",
    name: "10-Year Treasury Note",
    contextRole: "Rates context",
    tickSize: 0.015625,
    tickValue: 15.625,
    roundTurnCommission: 3.2,
    maxContracts: 3,
  },
};

export function ticksBetween(
  instrument: InstrumentCode,
  first: number,
  second: number,
): number {
  return Math.abs(first - second) / INSTRUMENTS[instrument].tickSize;
}

export function dollarsForMove(
  instrument: InstrumentCode,
  first: number,
  second: number,
  contracts: number,
): number {
  return (
    ticksBetween(instrument, first, second) *
    INSTRUMENTS[instrument].tickValue *
    contracts
  );
}
