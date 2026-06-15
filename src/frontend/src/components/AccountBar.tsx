import type { AccountState, PropFirmSettings } from "@/types";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface AccountBarProps {
  account: AccountState;
  settings: PropFirmSettings;
  session: string;
  nextNewsLabel: string | null;
}

export function AccountBar({ account, settings, session, nextNewsLabel }: AccountBarProps) {
  const maxDailyLoss = settings.accountSize * (settings.dailyLossPercent / 100);
  const dailyLossUsed = Math.abs(Math.min(account.dailyPnL, 0));
  const dailyLossPct = (dailyLossUsed / maxDailyLoss) * 100;
  const remainingDaily = maxDailyLoss - dailyLossUsed;
  const pnlPositive = account.dailyPnL >= 0;

  return (
    <div className="flex flex-wrap items-center gap-4 px-6 py-3 bg-card border-b border-border text-sm">
      <Stat label="Balance" value={`$${account.balance.toLocaleString()}`} />
      <Stat label="Equity" value={`$${account.equity.toLocaleString()}`} />
      <Stat
        label="Daily P/L"
        value={`${pnlPositive ? "+" : ""}$${account.dailyPnL.toFixed(2)}`}
        className={pnlPositive ? "text-green-400" : "text-red-400"}
        icon={pnlPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      />
      <Stat label="Remaining Daily Risk" value={`$${remainingDaily.toFixed(0)}`} />
      <div className="flex flex-col gap-0.5">
        <span className="text-muted-foreground text-xs">Daily Loss Used</span>
        <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              dailyLossPct > 75 ? "bg-red-500" : dailyLossPct > 50 ? "bg-yellow-400" : "bg-primary"
            }`}
            style={{ width: `${Math.min(dailyLossPct, 100)}%` }}
          />
        </div>
      </div>
      <Stat label="Trades Today" value={`${account.tradesToday}/${settings.maxTradesPerDay}`} />
      <Stat label="Open Risk" value={`$${account.openRisk.toFixed(0)}`} />
      <Stat label="Session" value={session} className="text-primary" />
      {nextNewsLabel && (
        <div className="flex items-center gap-1 text-yellow-400">
          <AlertTriangle size={14} />
          <span className="text-xs">{nextNewsLabel}</span>
        </div>
      )}
    </div>
  );
}

interface StatProps {
  label: string;
  value: string;
  className?: string;
  icon?: ReactNode;
}

function Stat({ label, value, className, icon }: StatProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className={`font-mono font-medium ${className ?? ""}`}>
        {icon && <span className="inline-flex items-center gap-1">{icon}{value}</span>}
        {!icon && value}
      </span>
    </div>
  );
}
