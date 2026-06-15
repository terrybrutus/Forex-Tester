import { useScannerData } from "@/hooks/useScannerData";
import { CurrencyStrengthBar } from "@/components/CurrencyStrengthBar";
import { getBestTradePairs } from "@/engines/currencyStrength";

export function CurrencyStrengthPage() {
  const { currencyStrengths, isLoading } = useScannerData();
  const bestPairs = getBestTradePairs(currencyStrengths).slice(0, 6);

  return (
    <div className="p-6 space-y-8">
      <h1 className="font-display font-bold text-2xl">Currency Strength</h1>

      {isLoading ? (
        <div className="py-16 text-center text-muted-foreground">Calculating strength...</div>
      ) : (
        <>
          <div className="bg-card rounded-lg border border-border p-6 max-w-lg">
            <h2 className="font-semibold mb-4">Strength Rankings</h2>
            <CurrencyStrengthBar strengths={currencyStrengths} />
          </div>

          <div>
            <h2 className="font-semibold mb-3">Best Currency Pair Combinations</h2>
            <div className="grid grid-cols-3 gap-3">
              {bestPairs.map((p) => (
                <div
                  key={`${p.pair}-${p.biasCurrency}`}
                  className="bg-card border border-border rounded-lg p-4 space-y-2"
                >
                  <div className="font-mono font-bold">{p.pair}</div>
                  <div className="text-xs text-muted-foreground">
                    Strong: <span className="text-green-400">{p.biasCurrency}</span>
                    {" vs "}
                    Weak: <span className="text-red-400">{p.weakCurrency}</span>
                  </div>
                  <div className="text-xs font-mono text-primary">
                    Alignment: {p.alignmentScore.toFixed(0)}pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
