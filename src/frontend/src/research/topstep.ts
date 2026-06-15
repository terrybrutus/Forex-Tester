import type { BacktestTrade, TopstepSimulation } from "@/types";

export const TOPSTEP_50K = {
  accountSize: 50000,
  profitTarget: 3000,
  maximumLossLimit: 2000,
  personalDailyLossLimit: 300,
  consistencyTarget: 1500,
};

export function simulateTopstep(trades: BacktestTrade[]): TopstepSimulation {
  let balance = TOPSTEP_50K.accountSize;
  let highestBalance = balance;
  let lowestBalance = balance;
  let maximumLossFloor = TOPSTEP_50K.accountSize - TOPSTEP_50K.maximumLossLimit;
  let currentDay = "";
  let dayStartBalance = balance;
  let bestDayPnl = 0;
  let failed = false;
  let failureReason: string | null = null;

  for (const trade of trades) {
    const day = tradingDayKey(trade.exitTime);
    if (day !== currentDay) {
      if (currentDay) {
        bestDayPnl = Math.max(bestDayPnl, balance - dayStartBalance);
        maximumLossFloor = Math.min(
          TOPSTEP_50K.accountSize,
          Math.max(maximumLossFloor, balance - TOPSTEP_50K.maximumLossLimit),
        );
      }
      currentDay = day;
      dayStartBalance = balance;
    }

    balance += trade.netPnl;
    highestBalance = Math.max(highestBalance, balance);
    lowestBalance = Math.min(lowestBalance, balance);

    if (balance <= maximumLossFloor) {
      failed = true;
      failureReason = "Maximum Loss Limit breached.";
      break;
    }
    if (balance <= dayStartBalance - TOPSTEP_50K.personalDailyLossLimit) {
      failed = true;
      failureReason = "Personal daily loss limit breached.";
      break;
    }
  }

  bestDayPnl = Math.max(bestDayPnl, balance - dayStartBalance);
  const consistencyTargetMet = bestDayPnl <= TOPSTEP_50K.consistencyTarget;
  return {
    accountSize: TOPSTEP_50K.accountSize,
    profitTarget: TOPSTEP_50K.profitTarget,
    maximumLossLimit: TOPSTEP_50K.maximumLossLimit,
    personalDailyLossLimit: TOPSTEP_50K.personalDailyLossLimit,
    passed:
      !failed &&
      balance >= TOPSTEP_50K.accountSize + TOPSTEP_50K.profitTarget &&
      consistencyTargetMet,
    failed,
    endingBalance: balance,
    lowestBalance,
    highestBalance,
    maximumLossFloor,
    bestDayPnl,
    consistencyTargetMet,
    failureReason,
  };
}

function tradingDayKey(timestamp: number): string {
  const central = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(timestamp));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(central.find((item) => item.type === type)?.value ?? 0);
  const adjusted = new Date(
    Date.UTC(part("year"), part("month") - 1, part("day")),
  );
  if (part("hour") >= 17) adjusted.setUTCDate(adjusted.getUTCDate() + 1);
  return adjusted.toISOString().slice(0, 10);
}
