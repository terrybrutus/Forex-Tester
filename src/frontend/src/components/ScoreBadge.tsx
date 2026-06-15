interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const color =
    score >= 80
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : score >= 65
      ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      : "bg-secondary text-muted-foreground border-border";

  const sizeClass = size === "sm" ? "text-xs px-1.5 py-0.5" : size === "lg" ? "text-base px-3 py-1.5" : "text-sm px-2 py-0.5";

  return (
    <span className={`inline-flex items-center rounded-full border font-mono font-bold ${color} ${sizeClass}`}>
      {score}
    </span>
  );
}
