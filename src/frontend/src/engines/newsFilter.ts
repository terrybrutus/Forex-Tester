import type { NewsEvent } from "@/types";

export interface NewsRisk {
  isBlocked: boolean;
  isWarning: boolean;
  nextEvent: NewsEvent | null;
  minutesUntilEvent: number | null;
  minutesSinceEvent: number | null;
  blockReason: string | null;
}

const HIGH_IMPACT_EVENTS = [
  "CPI",
  "NFP",
  "Non-Farm",
  "FOMC",
  "Fed",
  "Rate Decision",
  "Interest Rate",
  "GDP",
  "Unemployment",
  "Retail Sales",
  "PMI",
  "ECB",
  "BoE",
  "BoJ",
  "RBA",
  "RBNZ",
];

const MAJOR_EVENT_KEYWORDS = ["FOMC", "Rate Decision", "Interest Rate", "ECB", "BoE", "BoJ"];

export function isMajorEvent(event: NewsEvent): boolean {
  return MAJOR_EVENT_KEYWORDS.some((kw) =>
    event.event.toLowerCase().includes(kw.toLowerCase())
  );
}

export function assessNewsRisk(
  events: NewsEvent[],
  currency1: string,
  currency2: string,
  nowMs: number
): NewsRisk {
  const relevantEvents = events.filter(
    (e) =>
      (e.currency === currency1 || e.currency === currency2) &&
      e.impact === "High"
  );

  let nextEvent: NewsEvent | null = null;
  let minDistance = Infinity;

  for (const event of relevantEvents) {
    const diffMs = event.time - nowMs;
    const diffMin = diffMs / 60000;

    const blockWindowBefore = isMajorEvent(event) ? 60 : 30;
    const blockWindowAfter = isMajorEvent(event) ? 60 : 30;

    if (diffMin >= -blockWindowAfter && diffMin <= blockWindowBefore) {
      return {
        isBlocked: true,
        isWarning: false,
        nextEvent: event,
        minutesUntilEvent: diffMin > 0 ? Math.round(diffMin) : null,
        minutesSinceEvent: diffMin < 0 ? Math.round(-diffMin) : null,
        blockReason: diffMin > 0
          ? `High-impact news in ${Math.round(diffMin)} min: ${event.event}`
          : `High-impact news ended ${Math.round(-diffMin)} min ago: ${event.event}`,
      };
    }

    if (diffMin > 0 && diffMin < minDistance) {
      minDistance = diffMin;
      nextEvent = event;
    }
  }

  if (nextEvent && minDistance < 60) {
    return {
      isBlocked: false,
      isWarning: true,
      nextEvent,
      minutesUntilEvent: Math.round(minDistance),
      minutesSinceEvent: null,
      blockReason: null,
    };
  }

  return {
    isBlocked: false,
    isWarning: false,
    nextEvent,
    minutesUntilEvent: nextEvent ? Math.round(minDistance) : null,
    minutesSinceEvent: null,
    blockReason: null,
  };
}

export function getHighImpactKeywords(): string[] {
  return HIGH_IMPACT_EVENTS;
}
