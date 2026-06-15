import type { NewsEvent } from "@/types";

const FMP_BASE = "https://financialmodelingprep.com/api/v3";
const API_KEY = import.meta.env.VITE_FMP_KEY ?? "demo";

interface FmpEvent {
  date: string;
  country: string;
  event: string;
  currency: string;
  previous: string;
  estimate: string;
  actual: string;
  impact: string;
  changePercent: number;
  unit: string;
}

export async function fetchEconomicCalendar(
  fromDate: string,
  toDate: string
): Promise<NewsEvent[]> {
  const url = `${FMP_BASE}/economic_calendar?from=${fromDate}&to=${toDate}&apikey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return getMockEvents();

    const data: FmpEvent[] = await res.json();
    if (!Array.isArray(data)) return getMockEvents();

    return data
      .filter((e) => e.impact === "High")
      .map((e, i) => ({
        id: `${i}-${e.date}`,
        time: new Date(e.date).getTime(),
        currency: e.currency?.toUpperCase() ?? e.country?.toUpperCase() ?? "",
        event: e.event,
        impact: "High" as const,
        forecast: e.estimate ?? "",
        previous: e.previous ?? "",
        actual: e.actual ?? "",
      }));
  } catch {
    return getMockEvents();
  }
}

function getMockEvents(): NewsEvent[] {
  const now = Date.now();
  return [
    {
      id: "mock-1",
      time: now + 2 * 60 * 60 * 1000,
      currency: "USD",
      event: "CPI m/m",
      impact: "High",
      forecast: "0.3%",
      previous: "0.4%",
      actual: "",
    },
    {
      id: "mock-2",
      time: now + 24 * 60 * 60 * 1000,
      currency: "EUR",
      event: "ECB Rate Decision",
      impact: "High",
      forecast: "4.25%",
      previous: "4.25%",
      actual: "",
    },
  ];
}

export function getTodayRange(): { from: string; to: string } {
  const now = new Date();
  const from = now.toISOString().split("T")[0];
  const next = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const to = next.toISOString().split("T")[0];
  return { from, to };
}
