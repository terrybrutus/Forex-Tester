export type InstrumentCode =
  | "M6E"
  | "M6B"
  | "M6J"
  | "M6A"
  | "MCL"
  | "MGC"
  | "MES"
  | "ZN";

export type StrategyId =
  | "trend-pullback"
  | "session-breakout"
  | "macro-continuation";

export type TradeDirection = "Long" | "Short";
export type ResearchStatus = "Research only" | "Qualified" | "Rejected";

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface InstrumentSpec {
  code: InstrumentCode;
  name: string;
  contextRole: string;
  tickSize: number;
  tickValue: number;
  roundTurnCommission: number;
  maxContracts: number;
}

export interface Dataset {
  id: string;
  name: string;
  instrument: InstrumentCode;
  source: "Fixture" | "Imported CSV" | "Databento";
  timeframeMinutes: number;
  candles: Candle[];
  importedAt: number;
}

export interface StrategyParameters {
  fastEma: number;
  slowEma: number;
  atrPeriod: number;
  stopAtr: number;
  targetR: number;
  breakoutLookback: number;
  volumeMultiplier: number;
  sessionStartHourEt: number;
  sessionEndHourEt: number;
  maxRiskDollars: number;
}

export interface StrategyDefinition {
  id: StrategyId;
  name: string;
  version: string;
  thesis: string;
  parameters: StrategyParameters;
}

export interface SignalEvidence {
  family: string;
  label: string;
  supports: boolean;
  detail: string;
}

export interface BacktestTrade {
  id: string;
  strategyId: StrategyId;
  instrument: InstrumentCode;
  direction: TradeDirection;
  entryTime: number;
  exitTime: number;
  entry: number;
  stop: number;
  target: number;
  exit: number;
  contracts: number;
  grossPnl: number;
  netPnl: number;
  rMultiple: number;
  exitReason: "Stop" | "Target" | "Session close";
  evidence: SignalEvidence[];
}

export interface BacktestMetrics {
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  averageR: number;
  expectancyR: number;
  profitFactor: number;
  netPnl: number;
  maxDrawdown: number;
  maxConsecutiveLosses: number;
}

export interface TopstepSimulation {
  accountSize: number;
  profitTarget: number;
  maximumLossLimit: number;
  personalDailyLossLimit: number;
  passed: boolean;
  failed: boolean;
  endingBalance: number;
  lowestBalance: number;
  highestBalance: number;
  maximumLossFloor: number;
  bestDayPnl: number;
  consistencyTargetMet: boolean;
  failureReason: string | null;
}

export interface BacktestResult {
  id: string;
  createdAt: number;
  datasetId: string;
  contextDatasetId?: string;
  strategy: StrategyDefinition;
  trades: BacktestTrade[];
  metrics: BacktestMetrics;
  topstep: TopstepSimulation;
  qualification: {
    status: ResearchStatus;
    reasons: string[];
  };
}

export interface TradePlan {
  instrument: InstrumentCode;
  direction: TradeDirection;
  contracts: number;
  entry: number;
  stop: number;
  target: number;
  estimatedRisk: number;
  estimatedReward: number;
  evidence: SignalEvidence[];
  status: ResearchStatus;
  blockedReasons: string[];
}
