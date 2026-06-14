import { AddPairForm } from "@/components/AddPairForm";
import { ForexPairCard } from "@/components/ForexPairCard";
import { Card, CardContent } from "@/components/ui/card";
import {
  useAddPair,
  useForexPairs,
  useRemovePair,
} from "@/hooks/useForexQueries";
import { useCallback, useState } from "react";

export function DashboardPage() {
  const { data: pairs = [], isLoading } = useForexPairs();
  const addPair = useAddPair();
  const removePair = useRemovePair();
  const [search, setSearch] = useState("");

  const handleAdd = useCallback(
    (symbol: string) => {
      addPair.mutate(symbol);
    },
    [addPair],
  );

  const handleRemove = useCallback(
    (symbol: string) => {
      removePair.mutate(symbol);
    },
    [removePair],
  );

  const filtered = pairs.filter((p) =>
    p.symbol.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-[1fr_1fr_1fr_80px_100px_44px] items-center gap-3 px-4 py-3 bg-secondary/60 border-b border-border text-sm text-muted-foreground font-medium">
            <span>Pair</span>
            <span>Bid Price</span>
            <span>Ask Price</span>
            <span>Spread (pips)</span>
            <span>% Change</span>
            <span />
          </div>

          {isLoading ? (
            <div
              className="px-4 py-8 text-center text-muted-foreground"
              data-ocid="forex.loading_state"
            >
              Loading pairs...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className="px-4 py-8 text-center text-muted-foreground"
              data-ocid="forex.empty_state"
            >
              {search
                ? "No pairs match your search."
                : "No forex pairs tracked yet. Add one below."}
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {filtered.map((pair, idx) => (
                <ForexPairCard
                  key={pair.symbol}
                  pair={pair}
                  onRemove={handleRemove}
                  index={idx}
                />
              ))}
            </div>
          )}

          <AddPairForm
            onAdd={handleAdd}
            isAdding={addPair.isPending}
            search={search}
            onSearchChange={setSearch}
          />
        </CardContent>
      </Card>
    </div>
  );
}
