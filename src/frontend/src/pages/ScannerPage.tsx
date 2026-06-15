import { useState } from "react";
import { useScannerData } from "@/hooks/useScannerData";
import { ScannerTable } from "@/components/ScannerTable";
import { TradeCardPanel } from "@/components/TradeCardPanel";
import { getDefaultSettings, getDefaultAccountState } from "@/engines/riskEngine";
import type { ScannerRow } from "@/types";

export function ScannerPage() {
  const { scannerRows, isLoading } = useScannerData();
  const [selectedRow, setSelectedRow] = useState<ScannerRow | null>(null);

  const settings = getDefaultSettings();
  const account = getDefaultAccountState(settings);

  function handleApprove(row: ScannerRow) {
    console.log("Approved:", row.symbol);
    setSelectedRow(null);
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl">Scanner</h1>
        <span className="text-xs text-muted-foreground">
          {isLoading ? "Scanning..." : `${scannerRows.length} pairs analyzed`}
        </span>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Scanning market data...</div>
      ) : (
        <ScannerTable rows={scannerRows} onSelectRow={setSelectedRow} />
      )}

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
