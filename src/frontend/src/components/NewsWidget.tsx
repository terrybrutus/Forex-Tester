import type { NewsEvent } from "@/types";

interface NewsWidgetProps {
  events: NewsEvent[];
}

export function NewsWidget({ events }: NewsWidgetProps) {
  const now = Date.now();
  const upcoming = events
    .filter((e) => e.time > now - 30 * 60 * 1000)
    .sort((a, b) => a.time - b.time)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-2">
      {upcoming.length === 0 && (
        <p className="text-xs text-muted-foreground">No upcoming high-impact news.</p>
      )}
      {upcoming.map((event) => {
        const diffMs = event.time - now;
        const diffMin = Math.round(diffMs / 60000);
        const isImminent = Math.abs(diffMin) < 30;
        const isPast = diffMin < 0;

        return (
          <div
            key={event.id}
            className={`flex items-start justify-between gap-3 p-2.5 rounded-md border text-xs ${
              isImminent
                ? "bg-red-500/10 border-red-500/20"
                : "bg-secondary border-border"
            }`}
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-foreground">
                {event.currency}: {event.event}
              </span>
              {event.forecast && (
                <span className="text-muted-foreground">
                  Forecast: {event.forecast} | Prev: {event.previous}
                </span>
              )}
            </div>
            <span
              className={`shrink-0 font-mono font-medium ${
                isImminent ? "text-red-400" : "text-muted-foreground"
              }`}
            >
              {isPast ? `${Math.abs(diffMin)}m ago` : `${diffMin}m`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
