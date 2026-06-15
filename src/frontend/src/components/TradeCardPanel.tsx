import type { ScannerRow, PropFirmSettings, AccountState } from "@/types";
import { calculateRisk } from "@/engines/riskEngine";
import { ScoreBadge } from "./ScoreBadge";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";
import type { ReactNode } from "react";

interface TradeCardPanelProps {
  row: ScannerRow;
  settings: PropFirmSettings;
  account: AccountState;
  onClose: () => void;
  onApprove: (row: ScannerRow) => void;
}

export function TradeCardPanel({ row, settings, account, onClose, onApprove }: TradeCardPanelProps) {
  const risk = calculateRisk(
    settings,
    account,
    row.symbol,
    row.entryPrice,
    row.stopLoss,
    row.takeProfit
  );

  const canTrade = risk.isAllowed && row.newsStatus !== "Blocked" && row.score >= 65;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-card border-l border-border shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-lg">{row.symbol}</span>
          <span
            className={`text-sm font-semibold ${
              row.bias === "Long" ? "text-green-400" : row.bias === "Short" ? "text-red-400" : "text-muted-foreground"
            }`}
          >
            {row.bias}
          </span>
          <ScoreBadge score={row.score} />
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <Section title="Setup">
          <Row label="Strategy" value={row.strategy} />
          <Row label="Entry" value={row.entryPrice.toFixed(5)} mono />
          <Row label="Stop Loss" value={row.stopLoss.toFixed(5)} mono className="text-red-400" />
          <Row label="Take Profit" value={row.takeProfit.toFixed(5)} mono className="text-green-400" />
          <Row label="Risk/Reward" value={`${risk.riskReward}R`} mono />
        </Section>

        <Section title="Position Size">
          <Row label="Lot Size" value={risk.lotSize.toFixed(2)} mono />
          <Row label="Dollar Risk" value={`$${risk.dollarRisk.toFixed(2)}`} mono />
          <Row label="Pip Risk" value={`${risk.pipRisk.toFixed(1)} pips`} mono />
        </Section>

        <Section title="Reasons">
          <ul className="space-y-1">
            {row.reasons.map((r) => (
              <li key={r} className="flex items-start gap-2 text-xs text-muted-foreground">
                <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Invalidation">
          <p className="text-xs text-muted-foreground">{row.invalidation}</p>
        </Section>

        {row.newsStatus !== "Clear" && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle size={14} className="text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-300">
              {row.newsStatus === "Blocked"
                ? `News block: trade not allowed (${row.nextNewsMinutes}m until event)`
                : `News warning: ${row.nextNewsMinutes}m until high-impact event`}
            </p>
          </div>
        )}

        <Section title="Prop Firm Status">
          <div
            className={`flex items-center gap-2 p-3 rounded-md ${
              canTrade
                ? "bg-green-500/10 border border-green-500/20"
                : "bg-red-500/10 border border-red-500/20"
            }`}
          >
            {canTrade ? (
              <CheckCircle size={16} className="text-green-400" />
            ) : (
              <XCircle size={16} className="text-red-400" />
            )}
            <span className={`text-sm font-medium ${canTrade ? "text-green-400" : "text-red-400"}`}>
              {canTrade ? "Trade Allowed" : "Trade Blocked"}
            </span>
          </div>
          {risk.blockReasons.map((br) => (
            <p key={br} className="text-xs text-red-400 mt-1">• {br}</p>
          ))}
        </Section>
      </div>

      <div className="px-5 py-4 border-t border-border">
        <button
          type="button"
          disabled={!canTrade}
          onClick={() => canTrade && onApprove(row)}
          className={`w-full py-2.5 rounded-md font-semibold text-sm transition-colors ${
            canTrade
              ? "bg-primary text-white hover:bg-primary/90"
              : "bg-secondary text-muted-foreground cursor-not-allowed"
          }`}
        >
          {canTrade ? "Approve & Log Trade" : "Cannot Trade"}
        </button>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

interface RowProps {
  label: string;
  value: string;
  mono?: boolean;
  className?: string;
}

function Row({ label, value, mono, className }: RowProps) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${mono ? "font-mono" : ""} ${className ?? "text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
