import type { CurrencyStrength } from "@/types";

interface CurrencyStrengthBarProps {
  strengths: CurrencyStrength[];
}

export function CurrencyStrengthBar({ strengths }: CurrencyStrengthBarProps) {
  if (strengths.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {strengths.map((s) => (
        <div key={s.currency} className="flex items-center gap-3">
          <span className="w-8 text-xs font-mono font-semibold text-foreground text-right">
            {s.currency}
          </span>
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                s.score >= 70
                  ? "bg-green-400"
                  : s.score >= 40
                  ? "bg-primary"
                  : "bg-red-400"
              }`}
              style={{ width: `${s.score}%` }}
            />
          </div>
          <span className="w-8 text-xs font-mono text-muted-foreground">{s.score}</span>
          <span className="w-4 text-xs text-muted-foreground">#{s.rank}</span>
        </div>
      ))}
    </div>
  );
}
