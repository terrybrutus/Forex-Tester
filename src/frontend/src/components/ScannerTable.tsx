import type { ScannerRow } from "@/types";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ScoreBadge } from "./ScoreBadge";

interface ScannerTableProps {
  rows: ScannerRow[];
  onSelectRow: (row: ScannerRow) => void;
}

type SortKey = "score" | "symbol" | "sessionScore" | "riskReward";

export function ScannerTable({ rows, onSelectRow }: ScannerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortAsc, setSortAsc] = useState(false);
  const [minScore, setMinScore] = useState(0);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const sorted = [...rows]
    .filter((r) => r.score >= minScore)
    .sort((a, b) => {
      const mul = sortAsc ? 1 : -1;
      if (sortKey === "symbol") return mul * a.symbol.localeCompare(b.symbol);
      return mul * ((a[sortKey] as number) - (b[sortKey] as number));
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4 px-1">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          Min Score:
          <input
            type="range"
            min={0}
            max={90}
            step={5}
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="w-24"
          />
          <span className="font-mono text-foreground">{minScore}+</span>
        </label>
        <span className="text-xs text-muted-foreground">{sorted.length} pairs shown</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-secondary/60 border-b border-border">
              <Th label="Pair" sortKey="symbol" current={sortKey} asc={sortAsc} onSort={toggleSort} />
              <th className="px-3 py-2 text-left text-muted-foreground font-medium">Bias</th>
              <Th label="Score" sortKey="score" current={sortKey} asc={sortAsc} onSort={toggleSort} />
              <th className="px-3 py-2 text-left text-muted-foreground font-medium">Strategy</th>
              <th className="px-3 py-2 text-left text-muted-foreground font-medium">Volatility</th>
              <Th label="Session" sortKey="sessionScore" current={sortKey} asc={sortAsc} onSort={toggleSort} />
              <Th label="R:R" sortKey="riskReward" current={sortKey} asc={sortAsc} onSort={toggleSort} />
              <th className="px-3 py-2 text-left text-muted-foreground font-medium">News</th>
              <th className="px-3 py-2 text-left text-muted-foreground font-medium">Lots</th>
              <th className="px-3 py-2 text-left text-muted-foreground font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {sorted.map((row) => (
              <ScannerRowItem key={row.symbol} row={row} onClick={() => onSelectRow(row)} />
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                  No pairs meet current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface ThProps {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  asc: boolean;
  onSort: (k: SortKey) => void;
}

function Th({ label, sortKey, current, asc, onSort }: ThProps) {
  const active = current === sortKey;
  return (
    <th className="px-3 py-2 text-left">
      <button
        type="button"
        className="flex items-center gap-1 text-muted-foreground font-medium hover:text-foreground transition-colors"
        onClick={() => onSort(sortKey)}
      >
        {label}
        {active ? (
          asc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
        ) : null}
      </button>
    </th>
  );
}

interface ScannerRowItemProps {
  row: ScannerRow;
  onClick: () => void;
}

function ScannerRowItem({ row, onClick }: ScannerRowItemProps) {
  const biasColor = row.bias === "Long" ? "text-green-400" : row.bias === "Short" ? "text-red-400" : "text-muted-foreground";
  const newsColor = row.newsStatus === "Blocked" ? "text-red-400" : row.newsStatus === "Warning" ? "text-yellow-400" : "text-green-400";
  const volColor = row.volatilityState === "HighQuality" ? "text-green-400" : row.volatilityState === "Normal" ? "text-primary" : row.volatilityState === "Chaotic" ? "text-red-400" : "text-muted-foreground";

  return (
    <tr
      className="hover:bg-secondary/30 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-3 py-3 font-mono font-semibold text-foreground">{row.symbol}</td>
      <td className={`px-3 py-3 font-medium ${biasColor}`}>{row.bias}</td>
      <td className="px-3 py-3">
        <ScoreBadge score={row.score} />
      </td>
      <td className="px-3 py-3 text-muted-foreground text-xs">{row.strategy === "None" ? "—" : row.strategy}</td>
      <td className={`px-3 py-3 text-xs font-medium ${volColor}`}>{row.volatilityState}</td>
      <td className="px-3 py-3 font-mono text-xs">{row.sessionScore}</td>
      <td className="px-3 py-3 font-mono text-xs">{row.riskReward.toFixed(1)}R</td>
      <td className={`px-3 py-3 text-xs font-medium ${newsColor}`}>
        {row.newsStatus}
        {row.nextNewsMinutes !== null && row.newsStatus !== "Clear" && (
          <span className="ml-1 text-muted-foreground">({row.nextNewsMinutes}m)</span>
        )}
      </td>
      <td className="px-3 py-3 font-mono text-xs">{row.suggestedLotSize.toFixed(2)}</td>
      <td className="px-3 py-3">
        {row.score >= 80 && row.newsStatus !== "Blocked" ? (
          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
            Candidate
          </span>
        ) : row.score >= 65 ? (
          <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
            Watch
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-xs">
            Avoid
          </span>
        )}
      </td>
    </tr>
  );
}
