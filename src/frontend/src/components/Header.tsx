import { Button } from "@/components/ui/button";
import { useForexPairs } from "@/hooks/useForexQueries";
import { RefreshCw } from "lucide-react";
import { useCallback } from "react";

export function Header() {
  const { isLoading, refetch } = useForexPairs();

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <header className="sticky top-0 z-20 bg-card border-b border-border shadow-[0_1px_3px_rgba(0,0,0,0.12)]">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Forex Pairs
        </h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="gap-2"
          data-ocid="forex.refresh_button"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
    </header>
  );
}
