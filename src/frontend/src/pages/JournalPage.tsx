import { useState } from "react";
import type { JournalEntry, TradeResult } from "@/types";

const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: "1",
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    pair: "GBP/JPY",
    direction: "Long",
    score: 88,
    strategy: "TrendPullback",
    session: "Overlap",
    volatilityState: "HighQuality",
    entryPrice: 192.45,
    stopLoss: 192.1,
    takeProfit: 193.15,
    lotSize: 1.5,
    riskAmount: 500,
    result: "Win",
    rMultiple: 2.0,
    notes: "Clean pullback to 1H EMA50. GBP strong, JPY weak.",
    ruleViolationsPrevented: [],
  },
];

export function JournalPage() {
  const [entries] = useState<JournalEntry[]>(MOCK_ENTRIES);
  const [filter, setFilter] = useState<TradeResult | "All">("All");

  const filtered = filter === "All" ? entries : entries.filter((e) => e.result === filter);

  const wins = entries.filter((e) => e.result === "Win").length;
  const losses = entries.filter((e) => e.result === "Loss").length;
  const avgR =
    entries.length > 0
      ? entries.reduce((s, e) => s + e.rMultiple, 0) / entries.length
      : 0;
  const winRate = entries.length > 0 ? (wins / (wins + losses)) * 100 : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-display font-bold text-2xl">Journal</h1>

      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Win Rate" value={`${winRate.toFixed(1)}%`} />
        <StatCard label="Wins" value={`${wins}`} className="text-green-400" />
        <StatCard label="Losses" value={`${losses}`} className="text-red-400" />
        <StatCard label="Avg R" value={`${avgR.toFixed(2)}R`} />
      </div>

      <div className="flex gap-2">
        {(["All", "Win", "Loss", "BreakEven", "Open"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filter === f
                ? "bg-primary border-primary text-white"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8 text-sm">
            No journal entries yet.
          </p>
        )}
        {filtered.map((entry) => (
          <JournalCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`font-mono font-bold text-xl ${className ?? ""}`}>{value}</div>
    </div>
  );
}

function JournalCard({ entry }: { entry: JournalEntry }) {
  const resultColor =
    entry.result === "Win"
      ? "text-green-400"
      : entry.result === "Loss"
        ? "text-red-400"
        : "text-muted-foreground";

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div>
          <div className="font-mono font-semibold">{entry.pair}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(entry.timestamp).toLocaleString()}
          </div>
        </div>
        <span
          className={`text-sm font-medium ${
            entry.direction === "Long" ? "text-green-400" : "text-red-400"
          }`}
        >
          {entry.direction}
        </span>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
          {entry.strategy}
        </span>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Entry</div>
          <div className="font-mono">{entry.entryPrice.toFixed(5)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Risk</div>
          <div className="font-mono">${entry.riskAmount}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">R Multiple</div>
          <div className={`font-mono font-bold ${resultColor}`}>
            {entry.rMultiple > 0 ? "+" : ""}
            {entry.rMultiple.toFixed(2)}R
          </div>
        </div>
        <span className={`font-semibold ${resultColor}`}>{entry.result}</span>
      </div>
    </div>
  );
}
