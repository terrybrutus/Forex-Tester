import type { PropFirmSettings, AccountState, RiskCalculation } from "@/types";

const PIP_VALUES: Record<string, number> = {
  "EUR/USD": 10,
  "GBP/USD": 10,
  "AUD/USD": 10,
  "NZD/USD": 10,
  "USD/CAD": 7.5,
  "USD/CHF": 11,
  "USD/JPY": 9.1,
  "EUR/JPY": 9.1,
  "GBP/JPY": 9.1,
  "EUR/GBP": 13,
  "AUD/JPY": 9.1,
  "CAD/JPY": 9.1,
};

export function calculateRisk(
  settings: PropFirmSettings,
  account: AccountState,
  pair: string,
  entryPrice: number,
  stopLossPrice: number,
  takeProfitPrice: number,
  riskPercent = 0.5
): RiskCalculation {
  const blockReasons: string[] = [];

  const maxDailyLoss = settings.accountSize * (settings.dailyLossPercent / 100);
  const maxTotalLoss = settings.accountSize * (settings.maxLossPercent / 100);
  const dailyLossUsed = Math.abs(Math.min(account.dailyPnL, 0));
  const totalLossUsed = settings.accountSize - account.equity;

  if (dailyLossUsed >= maxDailyLoss * 0.75) {
    blockReasons.push("Within 25% of daily loss limit");
  }
  if (totalLossUsed >= maxTotalLoss * 0.75) {
    blockReasons.push("Within 25% of maximum loss limit");
  }
  if (account.tradesToday >= settings.maxTradesPerDay) {
    blockReasons.push("Maximum trades per day reached");
  }
  if (account.consecutiveLosses >= 2) {
    blockReasons.push("2 consecutive losses — stop trading today");
  }
  if (riskPercent > settings.maxRiskPerTrade) {
    blockReasons.push("Risk exceeds maximum per-trade limit");
  }

  const dollarRisk = account.equity * (riskPercent / 100);
  const pipValue = PIP_VALUES[pair] ?? 10;
  const pipDistance = Math.abs(entryPrice - stopLossPrice) * 10000;
  const pipDistanceJpy = pair.includes("JPY") ? Math.abs(entryPrice - stopLossPrice) * 100 : pipDistance;
  const adjustedPipDistance = pair.includes("JPY") ? pipDistanceJpy : pipDistance;

  const dollarPerPip = adjustedPipDistance > 0 ? dollarRisk / adjustedPipDistance : 0;
  const lotSize = Math.round((dollarPerPip / pipValue) * 100) / 100;

  const tpDistance = Math.abs(takeProfitPrice - entryPrice);
  const slDistance = Math.abs(stopLossPrice - entryPrice);
  const riskReward = slDistance > 0 ? tpDistance / slDistance : 0;

  if (riskReward < 1.5) {
    blockReasons.push("Risk/reward below minimum 1.5R");
  }

  const projectedDailyLoss = dailyLossUsed + dollarRisk;
  if (projectedDailyLoss > maxDailyLoss) {
    blockReasons.push("Trade would breach daily loss limit");
  }

  return {
    lotSize: Math.max(0.01, lotSize),
    dollarRisk,
    pipRisk: adjustedPipDistance,
    stopLoss: stopLossPrice,
    takeProfit: takeProfitPrice,
    riskReward: Math.round(riskReward * 100) / 100,
    isAllowed: blockReasons.length === 0,
    blockReasons,
  };
}

export function getDefaultSettings(): PropFirmSettings {
  return {
    accountSize: 100000,
    dailyLossPercent: 5,
    maxLossPercent: 10,
    profitTargetPercent: 10,
    maxTradesPerDay: 5,
    maxRiskPerTrade: 1,
    newsTrading: false,
    overnightHolding: false,
    weekendHolding: false,
    eaAutomation: true,
    minProfitableDays: 3,
    firmName: "FTMO",
  };
}

export function getDefaultAccountState(settings: PropFirmSettings): AccountState {
  return {
    balance: settings.accountSize,
    equity: settings.accountSize,
    dailyPnL: 0,
    openRisk: 0,
    tradesToday: 0,
    consecutiveLosses: 0,
  };
}
