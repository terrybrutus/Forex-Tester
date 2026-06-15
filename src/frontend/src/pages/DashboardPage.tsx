import { useState } from "react";
import { useScannerData } from "@/hooks/useScannerData";
import { AccountBar } from "@/components/AccountBar";
import { CurrencyStrengthBar } from "@/components/CurrencyStrengthBar";
import { NewsWidget } from "@/components/NewsWidget";
import { ScannerTable } from "@/components/ScannerTable";
import { TradeCardPanel } from "@/components/TradeCardPanel";
import { getDefaultSettings, getDefaultAccountState } from "@/engines/riskEngine";
import type { ScannerRow } from "@/types";

export function DashboardPage() {
  const { scannerRows, currencyStrengths, session, isLoading, newsEvents } = useScannerData();
  const [selectedRow, setSelectedRow] = useState<ScannerRow | null>(null);

  const settings = getDefaultSettings();
  const account = getDefaultAccountState(settings);

  const topCandidates = scannerRows.filter((r) => r.score >= 80).slice(0, 3);
  const nextNews = newsEvents
    .filter((e) => e.time > Date.now())
    .sort((a, b) => a.time - b.time)[0];

  const nextNewsLabel = nextNews
    ? `${nextNews.currency} ${nextNews.event} in ${Math.round((nextNews.time - Date.now()) / 60000)}m`
    : null;

  function handleApprove(row: ScannerRow) {
    console.log("Trade approved:", row.symbol, row.bias, row.score);
    setSelectedRow(null);
  }

  return (
    <div className="flex flex-col h-full">
      <AccountBar
        account={account}
        settings={settings}
        session={session.name}
        nextNewsLabel={nextNewsLabel}
      />

      <div className="flex-1 overflow-auto p-6 space-y-6">
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-4">
            <h2 className="font-display font-semibold text-lg">Top Trade Candidates</h2>
            {isLoading ? (
              <StatusMessage label="Scanning pairs..." />
            ) : topCandidates.length === 0 ? (
              <StatusMessage label="No high-scoring setups right now. Check Scanner for full list." />
            ) : (
              <div className="space-y-2">
                {topCandidates.map((row) => (
                  <button
                    key={row.symbol}
                    type="button"
                    className="w-full text-left"
                    onClick={() => setSelectedRow(row)}
                  >
                    <TopCandidateCard row={row} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="font-display font-semibold text-lg mb-3">Currency Strength</h2>
              {isLoading ? (
                <StatusMessage label="Calculating..." />
              ) : (
                <CurrencyStrengthBar strengths={currencyStrengths} />
              )}
            </div>

            <div>
              <h2 className="font-display font-semibold text-lg mb-3">Upcoming News</h2>
              <NewsWidget events={newsEvents} />
            </div>
          </div>
        </div>

        <div>
          <h2 className="font-display font-semibold text-lg mb-3">Full Scanner</h2>
          {isLoading ? (
            <StatusMessage label="Loading market data..." />
          ) : (
            <ScannerTable rows={scannerRows} onSelectRow={setSelectedRow} />
          )}
        </div>
      </div>

      {selectedRow && (
        <TradeCardPanel
          row={selectedRow}
          settings={settings}
          account={account}
          onClose={() => setSelectedRow(null)}
          onApprove={handleApprove}
        />
      )}
    </div>
  );
}

interface TopCandidateCardProps {
  row: ScannerRow;
}

function TopCandidateCard({ row }: TopCandidateCardProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-4">
        <span className="font-mono font-bold text-base">{row.symbol}</span>
        <span
          className={`text-sm font-semibold ${
            row.bias === "Long" ? "text-green-400" : "text-red-400"
          }`}
        >
          {row.bias}
        </span>
        <span className="text-xs text-muted-foreground">{row.strategy}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Entry</div>
          <div className="font-mono text-sm">{row.entryPrice.toFixed(5)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">R:R</div>
          <div className="font-mono text-sm text-green-400">{row.riskReward.toFixed(1)}R</div>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-bold font-mono border ${
            row.score >= 80
              ? "bg-green-500/20 text-green-400 border-green-500/30"
              : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
          }`}
        >
          {row.score}
        </span>
      </div>
    </div>
  );
}

function StatusMessage({ label }: { label: string }) {
  return (
    <div className="py-8 text-center text-muted-foreground text-sm">{label}</div>
  );
}
