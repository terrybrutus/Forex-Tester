import type { SessionName } from "@/types";

export interface SessionInfo {
  name: SessionName;
  score: number;
  isActive: boolean;
  bestPairs: string[];
}

export function getCurrentSession(): SessionInfo {
  const now = new Date();
  const etHour = getEasternHour(now);

  if (etHour >= 3 && etHour < 6) {
    return {
      name: "London",
      score: 85,
      isActive: true,
      bestPairs: ["GBP/USD", "EUR/USD", "GBP/JPY", "EUR/GBP"],
    };
  }
  if (etHour >= 8 && etHour < 11) {
    return {
      name: "Overlap",
      score: 95,
      isActive: true,
      bestPairs: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CAD"],
    };
  }
  if (etHour >= 6 && etHour < 8) {
    return {
      name: "NewYork",
      score: 80,
      isActive: true,
      bestPairs: ["USD/JPY", "USD/CAD", "AUD/USD", "NZD/USD"],
    };
  }
  if (etHour >= 20 || etHour < 3) {
    return {
      name: "Asia",
      score: 55,
      isActive: true,
      bestPairs: ["USD/JPY", "AUD/USD", "NZD/USD", "AUD/JPY"],
    };
  }
  if (etHour >= 11 && etHour < 17) {
    return {
      name: "AfterNY",
      score: 35,
      isActive: false,
      bestPairs: [],
    };
  }
  return {
    name: "OffHours",
    score: 20,
    isActive: false,
    bestPairs: [],
  };
}

function getEasternHour(date: Date): number {
  const etOffset = isEasternDST(date) ? -4 : -5;
  const utcHour = date.getUTCHours() + date.getUTCMinutes() / 60;
  return ((utcHour + etOffset + 24) % 24);
}

function isEasternDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);
  const stdOffset = Math.max(
    jan.getTimezoneOffset(),
    jul.getTimezoneOffset()
  );
  return date.getTimezoneOffset() < stdOffset;
}

export function getSessionScoreForPair(
  pair: string,
  session: SessionInfo
): number {
  const isPreferred = session.bestPairs.includes(pair);
  if (isPreferred) return session.score;
  return Math.max(session.score - 20, 20);
}

export function getNextSessionStart(): { name: SessionName; minutesUntil: number } {
  const now = new Date();
  const etHour = getEasternHour(now);
  const etMinute = now.getUTCMinutes();
  const currentMinutes = etHour * 60 + etMinute;

  const sessions: Array<{ name: SessionName; startMinutes: number }> = [
    { name: "Asia", startMinutes: 20 * 60 },
    { name: "London", startMinutes: 3 * 60 },
    { name: "NewYork", startMinutes: 6 * 60 },
    { name: "Overlap", startMinutes: 8 * 60 },
  ];

  for (const s of sessions) {
    if (s.startMinutes > currentMinutes) {
      return {
        name: s.name,
        minutesUntil: s.startMinutes - currentMinutes,
      };
    }
  }

  return {
    name: "Asia",
    minutesUntil: (24 * 60 - currentMinutes) + 20 * 60,
  };
}
