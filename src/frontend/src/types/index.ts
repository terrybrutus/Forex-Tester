export type PairSymbol = string;

export type TradeDirection = "Long" | "Short" | "Neutral";

export type VolatilityState = "Dead" | "Normal" | "HighQuality" | "Chaotic";

export type SessionName = "Asia" | "London" | "NewYork" | "Overlap" | "AfterNY" | "OffHours";

export type StrategyType = "TrendPullback" | "BreakoutContinuation" | "MeanReversion" | "None";

export type TradeResult = "Win" | "Loss" | "BreakEven" | "Open";

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface PairMarketData {
  symbol: PairSymbol;
  bid: number;
  ask: number;
  changePercent: number;
  isUp: boolean;
  candles: {
    m5: CandleData[];
    m15: CandleData[];
    h1: CandleData[];
    h4: CandleData[];
    d1: CandleData[];
  };
  spread: number;
  atr14: number;
  ema50: number;
  ema200: number;
}

export interface CurrencyStrength {
  currency: string;
  score: number;
  rank: number;
}

export interface ScannerRow {
  symbol: PairSymbol;
  bias: TradeDirection;
  score: number;
  strategy: StrategyType;
  currencyStrengthScore: number;
  trendScore: number;
  volatilityState: VolatilityState;
  sessionScore: number;
  spread: number;
  stopDistance: number;
  targetDistance: number;
  suggestedLotSize: number;
  newsStatus: "Clear" | "Warning" | "Blocked";
  nextNewsMinutes: number | null;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  reasons: string[];
  invalidation: string;
}

export interface PropFirmSettings {
  accountSize: number;
  dailyLossPercent: number;
  maxLossPercent: number;
  profitTargetPercent: number;
  maxTradesPerDay: number;
  maxRiskPerTrade: number;
  newsTrading: boolean;
  overnightHolding: boolean;
  weekendHolding: boolean;
  eaAutomation: boolean;
  minProfitableDays: number;
  firmName: string;
}

export interface AccountState {
  balance: number;
  equity: number;
  dailyPnL: number;
  openRisk: number;
  tradesToday: number;
  consecutiveLosses: number;
}

export interface NewsEvent {
  id: string;
  time: number;
  currency: string;
  event: string;
  impact: "High" | "Medium" | "Low";
  forecast: string;
  previous: string;
  actual: string;
}

export interface TradeCard {
  symbol: PairSymbol;
  direction: TradeDirection;
  score: number;
  strategy: StrategyType;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  lotSize: number;
  riskAmount: number;
  rewardAmount: number;
  reasons: string[];
  invalidation: string;
  newsWarning: string | null;
  propFirmStatus: "Allowed" | "Blocked";
  blockReasons: string[];
}

export interface JournalEntry {
  id: string;
  timestamp: number;
  pair: PairSymbol;
  direction: TradeDirection;
  score: number;
  strategy: StrategyType;
  session: SessionName;
  volatilityState: VolatilityState;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  lotSize: number;
  riskAmount: number;
  result: TradeResult;
  rMultiple: number;
  notes: string;
  ruleViolationsPrevented: string[];
}

export interface RiskCalculation {
  lotSize: number;
  dollarRisk: number;
  pipRisk: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  isAllowed: boolean;
  blockReasons: string[];
}
