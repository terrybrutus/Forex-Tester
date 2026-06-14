import type { ForexPair } from "@/backend";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";

function formatPrice(n: number): string {
  return n.toFixed(5);
}

interface ForexPairCardProps {
  pair: ForexPair;
  onRemove: (symbol: string) => void;
  index: number;
}

export function ForexPairCard({ pair, onRemove, index }: ForexPairCardProps) {
  const spread = Math.round(Math.abs(pair.ask - pair.bid) * 100000);

  return (
    <div
      className="grid grid-cols-[1fr_1fr_1fr_80px_100px_44px] items-center gap-3 px-4 py-3 border-b border-border/40 hover:bg-secondary/40 transition-colors"
      data-ocid={`forex.item.${index + 1}`}
    >
      <span className="font-mono text-sm text-foreground">{pair.symbol}</span>
      <span className="font-mono text-sm text-foreground">
        {formatPrice(pair.bid)}
      </span>
      <span className="font-mono text-sm text-foreground">
        {formatPrice(pair.ask)}
      </span>
      <span className="font-mono text-sm text-muted-foreground">{spread}</span>
      <span
        className={`font-mono text-sm flex items-center gap-1 ${pair.isUp ? "text-[oklch(var(--accent))]" : "text-[oklch(var(--destructive))]"}`}
      >
        {pair.isUp ? (
          <ArrowUp className="w-3 h-3" />
        ) : (
          <ArrowDown className="w-3 h-3" />
        )}
        {pair.changePercent.toFixed(2)}%
      </span>
      <button
        type="button"
        onClick={() => onRemove(pair.symbol)}
        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
        aria-label={`Remove ${pair.symbol}`}
        data-ocid={`forex.delete_button.${index + 1}`}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
