const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/** Noon UTC on the given calendar day, so server and browser seeds match. */
export function demoNow(from = new Date()): Date {
  const day = new Date(from);
  day.setUTCHours(12, 0, 0, 0);
  return day;
}

export function addDays(from: Date, days: number, hourUtc = 8): string {
  const atNoon = demoNow(from);
  return new Date(atNoon.getTime() + days * DAY_MS + (hourUtc - 12) * HOUR_MS).toISOString();
}

export function daysBetween(fromIso: string, to: Date): number {
  const diff = to.getTime() - new Date(fromIso).getTime();
  return Math.max(0, Math.floor(diff / DAY_MS));
}

export function hoursUntil(iso: string, now: Date): number {
  return (new Date(iso).getTime() - now.getTime()) / HOUR_MS;
}

export function formatVenue(iso: string, timeZone = "Europe/London"): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDay(iso: string, timeZone = "Europe/London"): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
  }).format(new Date(iso));
}

export function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export function inRange(iso: string, from: string, to: string): boolean {
  const time = new Date(iso).getTime();
  return time >= new Date(from).getTime() && time <= new Date(to).getTime();
}
